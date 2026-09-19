
from __future__ import annotations
from pathlib import Path
from datetime import datetime
import json
import re

BASE_DIR = Path(__file__).resolve().parent
TOOLS_FILE = BASE_DIR / "ai_tools.json"

PURCHASE_START = datetime(2026, 4, 2)
PURCHASE_END = datetime(2026, 10, 31)

REQUIRED_RECEIPT_FIELDS = [
    "software_name",
    "purchase_date",
    "original_amount",
    "payment_method",
]

def load_rules():
    with open(TOOLS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def normalize(text):
    if text is None:
        return ""
    text = str(text).strip().lower()
    text = re.sub(r"\s+", "", text)
    return text

def match_tool(software_name, rules):
    target = normalize(software_name)

    best_match = None
    for tool in rules["tools"]:
        for alias in tool.get("aliases", []):
            alias_n = normalize(alias)

            # 例如 ChatGPT Plus 可以對到 ChatGPT
            if alias_n == target or alias_n in target or target in alias_n:
                best_match = tool
                if alias_n == target:
                    return tool
    return best_match

def parse_date(date_str):
    try:
        return datetime.strptime(date_str, "%Y-%m-%d")
    except (TypeError, ValueError):
        return None

def check_subsidy(receipt):
    rules = load_rules()

    result = {
        "status": "PASS",
        "eligible": True,
        "software_name": receipt.get("software_name"),
        "canonical_name": None,
        "company_name": receipt.get("company_name"),
        "category": None,
        "origin": None,
        "missing_fields": [],
        "passed_checks": [],
        "failed_checks": [],
        "review_checks": [],
    }

    # 1. 基本欄位完整性
    for field in REQUIRED_RECEIPT_FIELDS:
        value = receipt.get(field)
        if value in (None, "", []):
            result["missing_fields"].append(field)

    if result["missing_fields"]:
        result["status"] = "REVIEW"
        result["eligible"] = None
        result["review_checks"].append(
            "收據資料不完整，缺少：" + ", ".join(result["missing_fields"])
        )

    # 2. 辨識 AI 工具
    tool = match_tool(receipt.get("software_name", ""), rules)

    if tool:
        result["canonical_name"] = tool["canonical_name"]
        result["category"] = tool["category"]
        result["origin"] = tool["origin"]

        if tool["eligible"]:
            result["passed_checks"].append(
                f"{tool['canonical_name']} 已在規則資料庫中列為可補助工具"
            )
        else:
            result["failed_checks"].append(
                f"{tool['canonical_name']} 已在規則資料庫中列為不予補助工具"
            )
    else:
        result["review_checks"].append(
            "此 AI 工具目前不在已知清單中，需要人工確認開發/營運地區及產品性質"
        )

    # 3. 購買日期
    purchase_date = parse_date(receipt.get("purchase_date"))
    if purchase_date is None:
        result["review_checks"].append("購買日期格式無法辨識")
    elif PURCHASE_START <= purchase_date <= PURCHASE_END:
        result["passed_checks"].append("購買日期落在計畫指定期間內")
    else:
        result["failed_checks"].append("購買日期不在計畫指定期間內")

    # 4. 官方購買 / 集合式平台 / 代購
    purchase_channel = normalize(receipt.get("purchase_channel"))
    blocked_channels = [normalize(x) for x in rules["blocked_purchase_channels"]]

    if any(x and x in purchase_channel for x in blocked_channels):
        result["failed_checks"].append("購買來源屬於計畫明列不補助的平台或代購管道")
    elif purchase_channel == "official":
        result["passed_checks"].append("購買來源標示為官方管道")
    elif purchase_channel:
        result["review_checks"].append("購買來源不是明確的 official，建議人工覆核")
    else:
        result["review_checks"].append("缺少購買來源資訊")

    # 5. Credit / Token / API / 預付儲值
    service_type = normalize(receipt.get("service_type"))
    blocked_types = [normalize(x) for x in rules["blocked_service_types"]]

    if any(x and x in service_type for x in blocked_types):
        result["failed_checks"].append(
            "服務類型屬 Credit / Token / API / 預付儲值等不補助形式"
        )
    elif service_type == "subscription":
        result["passed_checks"].append("服務型態為訂閱制")
    elif service_type:
        result["review_checks"].append("服務型態需人工確認")
    else:
        result["review_checks"].append("缺少服務型態資訊")

    # 6. 臺幣金額
    twd_amount = receipt.get("twd_amount")
    if isinstance(twd_amount, (int, float)) and twd_amount > 0:
        result["passed_checks"].append(f"已取得臺幣金額：NT${twd_amount:g}")
    else:
        result["review_checks"].append("缺少有效的臺幣帳單金額")

    # 7. 收據上的購買人辨識資訊
    subscriber_name = receipt.get("subscriber_name")
    subscriber_email = receipt.get("subscriber_email")
    payer_name = receipt.get("payer_name")
    payer_email = receipt.get("payer_email")

    if subscriber_name or subscriber_email:
        result["passed_checks"].append("收據含可辨識購買人的姓名或電子信箱")
    elif payer_name or payer_email:
        result["passed_checks"].append("收據含可辨識付款人的姓名或電子信箱")
    else:
        result["review_checks"].append("缺少可辨識購買人的姓名或電子信箱")

    # 8. 彙整狀態：FAIL > REVIEW > PASS
    if result["failed_checks"]:
        result["status"] = "FAIL"
        result["eligible"] = False
    elif result["review_checks"] or result["missing_fields"]:
        result["status"] = "REVIEW"
        result["eligible"] = None
    else:
        result["status"] = "PASS"
        result["eligible"] = True

    return result

def format_line_message(receipt, result):

    # 西元轉民國年
    purchase_date = receipt.get(
        "purchase_date",
        ""
    )

    roc_date = "待確認"

    try:

        year, month, day = purchase_date.split("-")

        roc_year = int(year) - 1911

        roc_date = (
            f"民國{roc_year}年"
            f"{int(month)}月"
            f"{int(day)}日"
        )

    except Exception:
        pass


    # 費用方式
    billing_type = receipt.get(
        "billing_type"
    )

    if billing_type == "monthly":

        billing_text = (
            "☑ 月費制　☐ 年費制"
        )

    elif billing_type == "yearly":

        billing_text = (
            "☐ 月費制　☑ 年費制"
        )

    else:

        billing_text = "待確認"


    # 信用卡付款人
    card_owner = receipt.get(
        "card_owner"
    )

    if card_owner == "self":

        card_text = "☑ 本人信用卡"

    elif card_owner == "family":

        card_text = (
            "☑ 父母、配偶或法定代理人信用卡"
        )

    else:

        card_text = "待確認"


    reply_text = (

        "🧾 購買明細自動填寫完成\n\n"

        f"費用方式：{billing_text}\n"

        f"功能類型：☑ "
        f"{result.get('category') or receipt.get('category', '待確認')}\n\n"

        f"軟體名稱："
        f"{receipt.get('software_name', '待確認')}\n"

        f"軟體公司："
        f"{receipt.get('company_name', '待確認')}\n"

        f"出產地："
        f"{result.get('origin') or receipt.get('origin', '待確認')}\n"

        f"購買日期：{roc_date}\n\n"

        f"原始費用："
        f"US${receipt.get('original_amount', 0):.2f}\n"

        f"換算新臺幣："
        f"NT${receipt.get('twd_amount', '-')}\n\n"

        f"是否本人信用卡：{card_text}"

    )

    return reply_text

if __name__ == "__main__":
    receipt_file = BASE_DIR / "fake_receipt.json"
    with open(receipt_file, "r", encoding="utf-8") as f:
        receipt = json.load(f)

    result = check_subsidy(receipt)

    print("=== JSON RESULT ===")
    print(json.dumps(result, ensure_ascii=False, indent=2))

    print("\n=== LINE MESSAGE ===")
    print(format_line_message(receipt, result))
