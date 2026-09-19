import os
import sys
import sqlite3
from pathlib import Path

# =========================================================
# 讓 backend/main.py 可以讀取上一層的 gemini_file.py
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent

if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))


# =========================================================
# Gemini
# =========================================================

from gemini_file import ask_gemini


# =========================================================
# Database
# =========================================================

from database import (
    init_database,
    find_application,
    bind_line_user,
    find_application_by_line_user,
)


# =========================================================
# Flask / dotenv
# =========================================================

from flask import Flask, request, abort, jsonify
from dotenv import load_dotenv


# =========================================================
# LINE Bot SDK v3
# =========================================================

from linebot.v3 import WebhookParser
from linebot.v3.exceptions import InvalidSignatureError

from linebot.v3.messaging import (
    Configuration,
    ApiClient,
    MessagingApi,
    ReplyMessageRequest,
    TextMessage,
    MessagingApiBlob,
)

from linebot.v3.webhooks import (
    MessageEvent,
    TextMessageContent,
    ImageMessageContent,
)


# =========================================================
# 1. 讀取專案根目錄的 .env
# =========================================================

ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

app = Flask(__name__)

# =========================================================
# AI 客服狀態
# =========================================================
# ai_chat_users：目前已進入「其他 / AI 智慧客服」模式的 LINE 使用者
# ai_chat_history：保存每位使用者最近幾輪對話，讓 Gemini 可以理解追問
ai_chat_users = set()
ai_chat_history = {}

init_database()


# =========================================================
# LINE 環境變數
# =========================================================

CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET")
CHANNEL_ACCESS_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


if not CHANNEL_SECRET:
    raise ValueError(
        "找不到 LINE_CHANNEL_SECRET，請檢查 .env"
    )


if not CHANNEL_ACCESS_TOKEN:
    raise ValueError(
        "找不到 LINE_CHANNEL_ACCESS_TOKEN，請檢查 .env"
    )


# =========================================================
# 2. LINE Bot 設定
# =========================================================

parser = WebhookParser(CHANNEL_SECRET)

configuration = Configuration(
    access_token=CHANNEL_ACCESS_TOKEN
)


# =========================================================
# 3. 測試首頁
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return "Ctrl & Create LINE Bot is running!"


def decode_line_user_id(user_id_str):
    """解碼可能被 URL 或 Base64 編碼的 LINE user_id"""
    if not user_id_str:
        return user_id_str
    import base64
    from urllib.parse import unquote

    # 1. URL 解碼
    decoded = unquote(user_id_str).strip()
    # 2. 若有 Base64 編碼則解碼還原
    try:
        padded = decoded + "=" * (-len(decoded) % 4)
        b64 = base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8")
        if b64.startswith("U"):
            return b64
    except Exception:
        pass
    return decoded


@app.route("/api/applications/by-line/<path:line_user_id>", methods=["GET"])
def application_by_line_user(line_user_id):
    clean_user_id = decode_line_user_id(line_user_id)
    application = find_application_by_line_user(clean_user_id)

    if application is None:
        return jsonify({"error": "找不到此 LINE 帳號的案件綁定"}), 404

    return jsonify(application), 200


# =========================================================
# 4. 前端案件查詢 API
#
# 使用方式：
# GET /applications?name=陳小明
#
# 成功：
# {
#     "name": "陳小明",
#     "ID": "AI20260001"
# }
#
# 查無姓名：HTTP 404
# =========================================================

@app.route("/applications", methods=["GET"])
def get_application_by_name():

    name = request.args.get(
        "name",
        default="",
        type=str
    ).strip()

    # 沒有帶 name
    if not name:
        return jsonify({
            "error": "請提供姓名"
        }), 400


    # demo.db 與 main.py 位於同一個 backend 資料夾
    db_path = Path(__file__).resolve().parent / "demo.db"

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 找出資料庫內所有一般資料表
        cursor.execute("""
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
              AND name NOT LIKE 'sqlite_%'
        """)

        table_names = [
            row["name"]
            for row in cursor.fetchall()
        ]

        result = None

        # 為了讓目前 demo.db 的欄位名稱有些差異時仍可運作，
        # 自動尋找具有姓名欄位與案件 ID 欄位的資料表。
        possible_name_columns = [
            "name",
            "applicant_name",
            "user_name"
        ]

        possible_id_columns = [
            "application_id",
            "application_no",
            "case_id",
            "ID",
            "id"
        ]

        for table_name in table_names:

            cursor.execute(
                f'PRAGMA table_info("{table_name}")'
            )

            columns = [
                row["name"]
                for row in cursor.fetchall()
            ]

            name_column = next(
                (
                    col
                    for col in possible_name_columns
                    if col in columns
                ),
                None
            )

            id_column = next(
                (
                    col
                    for col in possible_id_columns
                    if col in columns
                ),
                None
            )

            if not name_column or not id_column:
                continue

            # table/column 名稱來自 SQLite schema，而不是前端輸入；
            # 使用雙引號包住 identifier。
            sql = (
                f'SELECT "{name_column}" AS name, '
                f'"{id_column}" AS application_id '
                f'FROM "{table_name}" '
                f'WHERE "{name_column}" = ? '
                f'LIMIT 1'
            )

            cursor.execute(
                sql,
                (name,)
            )

            row = cursor.fetchone()

            if row:
                result = {
                    "name": row["name"],
                    "ID": str(row["application_id"])
                }
                break

        conn.close()

    except sqlite3.Error as e:

        print(
            f"[API /applications] Database error: {e}"
        )

        return jsonify({
            "error": "資料庫查詢失敗"
        }), 500


    if result:
        return jsonify(result), 200


    return jsonify({
        "error": "查無此姓名"
    }), 404


# =========================================================
# 4. LINE Webhook
# =========================================================

@app.route("/callback", methods=["POST"])
def callback():

    signature = request.headers.get(
        "X-Line-Signature"
    )

    if not signature:
        abort(400)

    body = request.get_data(
        as_text=True
    )

    try:

        events = parser.parse(
            body,
            signature
        )

    except InvalidSignatureError:

        print(
            "[LINE ERROR] Invalid signature"
        )

        abort(400)


    for event in events:

    # 只處理 MessageEvent
        if not isinstance(
        event,
        MessageEvent
    ):
            continue

    # 文字訊息
        if isinstance(
        event.message,
        TextMessageContent
    ):
            handle_text_message(event)

    # 圖片訊息
        elif isinstance(
        event.message,
        ImageMessageContent
    ):
            handle_image_message(event)


    return "OK"


# =========================================================
# 5. 訊息處理
# =========================================================
import json
# =========================================================
# 圖片帳單處理
# =========================================================

def handle_image_message(event):

    print("[LINE] 收到圖片訊息")

    try:

        # -------------------------------------------------
        # 1. 下載 LINE 使用者傳來的圖片
        # -------------------------------------------------

        message_id = event.message.id

        upload_dir = (
            Path(__file__).resolve().parent
            / "uploads"
        )

        upload_dir.mkdir(
            exist_ok=True
        )

        image_path = (
            upload_dir
            / f"{message_id}.jpg"
        )

        with ApiClient(
            configuration
        ) as api_client:

            blob_api = MessagingApiBlob(
                api_client
            )

            image_content = (
                blob_api.get_message_content(
                    message_id=message_id
                )
            )

        with open(
            image_path,
            "wb"
        ) as f:

            f.write(
                image_content
            )

        print(
            f"[IMAGE] 圖片已儲存：{image_path}"
        )


        # -------------------------------------------------
        # 2. DEMO 第一版：
        #    先假裝圖片辨識已經完成
        # -------------------------------------------------

        fake_receipt_path = (
            Path(__file__).resolve().parent
            / "fake_receipt.json"
        )

        with open(
            fake_receipt_path,
            "r",
            encoding="utf-8"
        ) as f:

            receipt = json.load(f)


        # -------------------------------------------------
        # 3. 跑補助審核
        # -------------------------------------------------

        from subsidy_checker import (
            check_subsidy,
            format_line_message,
        )

        result = check_subsidy(
            receipt
        )

        reply_text = format_line_message(
            receipt,
            result
        )


        # -------------------------------------------------
        # 4. 回覆 LINE
        # -------------------------------------------------

        send_reply(
            event,
            reply_text
        )


    except Exception as e:

        print(
            f"[IMAGE ERROR] {e}"
        )

        send_reply(
            event,
            (
                "⚠️ 帳單圖片處理失敗\n\n"
                "請稍後再試一次。"
            )
        )
def handle_text_message(event):

    user_message = event.message.text.strip()
    line_user_id = getattr(event.source, "user_id", "mock_user")

    print(
        f"[LINE] 收到訊息：'{user_message}' (來自 {line_user_id})"
    )

    # =====================================================
    # 0. 優先處理「一鍵申請」等專用申辦入口 (最高優先級，避免被客服模式卡住)
    # =====================================================
    if any(kw in user_message for kw in ["一鍵申請", "線上案件申報", "線上申辦", "一鍵申辦", "案件申報", "申請"]):
        ai_chat_users.discard(line_user_id)
        apply_url = f"{FRONTEND_URL}/apply?line_user_id={line_user_id}"
        reply_text = (
            "📋【新竹市青年數位工具補助 — 線上申辦】\n\n"
            "已為您開啟個人專屬一鍵申辦通道！\n"
            "系統將自動帶入您的戶籍與身分資訊。\n\n"
            f"👉 請點擊以下專屬連結進入申辦表單：\n{apply_url}"
        )
        send_reply(event, reply_text)
        return


    # =====================================================
    # 0. AI 智慧客服模式
    # =====================================================
    # 使用者只有在輸入「其他」後才會進入這裡。
    # 這段必須放在綁定格式判斷之前，避免 AI 對話中的數字
    # 被誤判成「姓名 / 身分證末四碼 / 出生年月日」。

    if line_user_id in ai_chat_users:

        # 離開 AI 客服
        if user_message in [
            "離開AI客服",
            "離開 AI 客服",
            "退出AI客服",
            "退出 AI 客服",
            "返回主選單",
        ]:

            ai_chat_users.discard(line_user_id)
            ai_chat_history.pop(line_user_id, None)

            reply_text = (
                "👋 已離開 AI 智慧客服。\n\n"
                "您可以再次點選「客服小幫手」查看常見問題，"
                "或輸入「其他」再次進入 AI 智慧客服。"
            )

            send_reply(event, reply_text)
            return

        # 保留最近幾輪對話，讓 Gemini 能理解「那我妹妹呢？」這類追問
        history = ai_chat_history.setdefault(line_user_id, [])

        history_text = ""
        if history:
            history_text = "以下是前面的對話紀錄：\n"
            for item in history[-6:]:
                history_text += (
                    f"使用者：{item['user']}\n"
                    f"客服：{item['assistant']}\n"
                )
            history_text += "\n"

        gemini_prompt = (
            "你現在正在 LINE 的 AI 智慧客服中。"
            "請延續前文理解使用者的問題，並用親切、簡潔的繁體中文回答。\n\n"
            f"{history_text}"
            f"使用者目前的問題：{user_message}"
        )

        print(
            f"[Gemini AI Mode] 準備詢問：{user_message}"
        )

        try:
            reply_text = ask_gemini(gemini_prompt)

            if not reply_text:
                reply_text = (
                    "🤖 抱歉，我目前沒有取得有效的回答。"
                    "\n\n請換個方式再問我一次！"
                )

            history.append({
                "user": user_message,
                "assistant": reply_text,
            })

            # Demo 階段限制最多保存最近 6 輪，避免 prompt 越來越長
            if len(history) > 6:
                del history[:-6]

            print(
                f"[Gemini AI Mode] 回覆：{reply_text}"
            )

        except Exception as e:
            print(
                f"[Gemini Error] {e}"
            )

            reply_text = (
                "🤖 抱歉，目前 AI 智慧客服暫時無法回覆。\n\n"
                "請稍後再試一次，或輸入「離開AI客服」回到一般客服。"
            )

        send_reply(event, reply_text)
        return


    # =====================================================
    # 嘗試判斷是否為帳號綁定資料
    #
    # 格式：
    # 姓名 身分證末四碼 民國出生年月日
    #
    # 例如：
    # 陳小明 1234 920517
    # =====================================================

    parts = user_message.split()


    # =====================================================
    # 如果剛好有三個欄位
    # 嘗試視為綁定資料
    # =====================================================

    if len(parts) == 3:

        name = parts[0]

        id_last4 = parts[1]

        birthday_roc = parts[2]


        # =================================================
        # 先檢查格式
        # =================================================

        if (
            not id_last4.isdigit()
            or len(id_last4) != 4
            or not birthday_roc.isdigit()
            or len(birthday_roc) != 6
        ):

            reply_text = (
                "⚠️ 輸入格式不正確\n\n"

                "請確認：\n"

                "• 身分證末四碼為 4 碼數字\n"

                "• 出生年月日為民國 6 碼數字\n\n"

                "例如：\n"

                "陳小明 1234 920517"
            )

            send_reply(
                event,
                reply_text
            )

            return


        # =================================================
        # 格式正確才進入綁定
        # =================================================

        line_user_id = (
            event.source.user_id
        )


        application = find_application(
            name,
            id_last4,
            birthday_roc
        )


        # =================================================
        # 如果資料庫裡面有找到
        # 就真正建立 LINE 綁定
        # =================================================

        if application:

            application_id = (
                application[0]
            )

            bind_line_user(
                line_user_id,
                application_id
            )


        # =================================================
        # Demo 設計：
        # 格式正確後皆顯示綁定完成
        # =================================================

        reply_text = (
            "🎉 恭喜，綁定完成！\n\n"

            f"謝謝您，{name}！"

            "您的 LINE 帳號已成功完成綁定。\n\n"

            "接下來可以直接點選下方的"
            "「進度查詢」，"

            "查看您的申請進度囉！"
        )


        send_reply(
            event,
            reply_text
        )

        return


    # =====================================================
    # 有數字，但格式不是三個欄位
    #
    # 例如：
    # 陳小明 1234
    #
    # 或：
    # 陳小明 1234 920517 111
    # =====================================================

    elif (
        len(parts) != 3
        and any(
            char.isdigit()
            for char in user_message
        )
    ):

        reply_text = (
            "⚠️ 輸入格式不正確\n\n"

            "請依照以下格式輸入：\n"

            "姓名 身分證末四碼 出生年月日\n\n"

            "例如：\n"

            "陳小明 1234 920517"
        )

        send_reply(
            event,
            reply_text
        )

        return


    # =====================================================
    # A. 這些按鈕之後會開網頁
    #
    # 不要讓它們跑進客服預設回答
    # =====================================================

    web_menu_messages = {
        "FAQ",
        "FAQ (c+d)",
        "進度查詢",
        "查詢申請進度",
        "一鍵申請",
        "線上案件申報",
        "線上申辦",
        "一鍵申辦",
        "案件申報",
        "申請",
        "資安遊戲",
    }

    if user_message in web_menu_messages:
        if user_message in ["一鍵申請", "線上案件申報", "線上申辦", "一鍵申辦", "案件申報", "申請"]:
            line_user_id = getattr(event.source, "user_id", "mock_user")
            apply_url = f"{FRONTEND_URL}/apply?line_user_id={line_user_id}"
            reply_text = (
                "📋【新竹市青年數位工具補助 — 線上申辦】\n\n"
                "已為您開啟個人專屬一鍵申辦通道！\n"
                "系統將自動帶入您的戶籍與身分資訊。\n\n"
                f"👉 請點擊以下專屬連結進入申辦表單：\n{apply_url}"
            )
            send_reply(event, reply_text)
        else:
            print(
                f"[LINE] {user_message} "
                "預計改成 URI 網頁按鈕"
            )

        return


    # =====================================================
    # B. 綁定帳號
    # =====================================================

    if user_message in [
        "綁定帳號",
        "綁定按鈕",
        "綁定資料"
    ]:

        reply_text = (
            "🔗 帳號綁定\n\n"

            "為了讓您之後可以快速查詢申請進度，"

            "請先完成身分綁定。\n\n"

            "請輸入：\n"

            "姓名 身分證末四碼 出生年月日(民國)\n\n"

            "例如：\n"

            "陳小明 1234 920517"
        )


    # =====================================================
    # C. 客服小幫手首頁
    # =====================================================

    elif user_message in [
        "客服",
        "客服小幫手"
    ]:

        reply_text = (
            "🤖 AI 領航客服小幫手\n\n"

            "您好！請問您想了解什麼呢？ 👋\n\n"

            "我可以協助您：\n"

            "👤 申請資格\n"

            "💰 補助金額\n"

            "📝 申請流程\n"

            "📄 補件／核銷\n"

            "📞 聯絡我們\n"

            "💬 問題回報\n"

            "✨ 其他／詢問 AI\n\n"

            "常見問題可以直接輸入，例如：\n"

            "「誰可以申請？」\n"

            "「補助多少錢？」\n"

            "「申請流程是什麼？」\n\n"

            "如果上面沒有您想問的問題，"
            "請輸入「其他」，即可進入 AI 智慧客服。"
        )


    # =====================================================
    # C-1. 其他 / 進入 AI 智慧客服
    # =====================================================

    elif user_message in [
        "其他",
        "詢問AI",
        "詢問 AI",
        "AI客服",
        "AI 客服",
    ]:

        ai_chat_users.add(line_user_id)
        ai_chat_history[line_user_id] = []

        reply_text = (
            "✨ 已進入 AI 智慧客服模式\n\n"
            "您現在可以直接用自己的方式問我問題，不需要按照固定格式 😊\n\n"
            "例如：\n"
            "「我是 22 歲，可以申請嗎？」\n"
            "「補助最高多少錢？」\n"
            "「生成式 AI 工具有哪些資安風險？」\n\n"
            "輸入「離開AI客服」即可回到一般客服。"
        )


    # =====================================================
    # D. 補助金額
    # =====================================================

    elif (
        "補助多少" in user_message
        or "補助金額" in user_message
        or "補助幾成" in user_message
    ):

        reply_text = (
            "💰 補助金額\n\n"

            "一般青年：\n"

            "• 補助購買金額 50%\n"

            "• 每人最高 3,000 元\n\n"

            "低收入戶／中低收入戶：\n"

            "• 補助購買金額 90%\n"

            "• 每人最高 6,000 元"
        )


    # =====================================================
    # E. 申請資格
    # =====================================================

    elif (
        "誰可以申請" in user_message
        or "申請資格" in user_message
        or "可以申請嗎" in user_message
        or "年齡" in user_message
        or "設籍" in user_message
    ):

        reply_text = (
            "👤 申請資格\n\n"

            "主要申請對象為：\n"

            "• 18 至 40 歲青年\n"

            "• 設籍新竹市\n\n"

            "一般青年與低收／中低收入戶"

            "適用不同補助比例與上限。\n\n"

            "詳細資格仍以官方公告與"
            "實際審核結果為準。"
        )


    # =====================================================
    # F. 可補助工具
    # =====================================================

    elif (
        "哪些工具" in user_message
        or "什麼工具" in user_message
        or "可以補助哪些" in user_message
        or "可補助工具" in user_message
        or "軟體" in user_message
    ):

        reply_text = (
            "🤖 可補助的數位工具\n\n"

            "計畫主要鼓勵青年使用：\n"

            "• 生成式 AI 工具\n"

            "• 影像創作工具\n"

            "• 影音編輯工具\n"

            "• 數位生產力工具\n\n"

            "⚠️ 個別軟體是否符合補助資格，"

            "仍須以官方規定與實際審核結果為準。"
        )


    # =====================================================
    # G. 申請流程
    # =====================================================

    elif (
        "怎麼申請" in user_message
        or "如何申請" in user_message
        or "申請流程" in user_message
        or "申請步驟" in user_message
    ):

        reply_text = (
            "📝 申請流程\n\n"

            "主要流程為：\n\n"

            "1️⃣ 提交申請資料\n"

            "2️⃣ 資料審核\n"

            "3️⃣ 補件（如有需要）\n"

            "4️⃣ 核銷確認\n"

            "5️⃣ 撥款\n\n"

            "之後也可以透過 LINE 的"
            "「進度查詢」"

            "查看案件目前所在階段。"
        )


    # =====================================================
    # H. 補件 / 核銷
    # =====================================================

    elif (
        "補件" in user_message
        or "核銷" in user_message
        or "資料缺" in user_message
        or "資料漏" in user_message
    ):

        reply_text = (
            "📄 補件／核銷\n\n"

            "如果申請資料缺漏，"
            "系統會提示需要補充的項目。\n\n"

            "完成資料審核後，"
            "案件會進入核銷程序，"

            "確認相關文件與費用資料後，"
            "再進行後續撥款。\n\n"

            "實際補件內容仍以案件通知為準。"
        )


    # =====================================================
    # I. 案件進度
    # =====================================================

    elif (
        "申請進度" in user_message
        or "案件進度" in user_message
        or "申請到哪" in user_message
        or "撥款進度" in user_message
        or "什麼時候撥款" in user_message
    ):

        reply_text = (
            "📍 案件進度查詢\n\n"

            "如果已完成 LINE 帳號綁定，"

            "之後可以透過 Rich Menu 的"
            "「進度查詢」"

            "直接查看您的案件狀態。\n\n"

            "可查看的階段包含：\n"

            "• 資料審核\n"

            "• 補件\n"

            "• 核銷\n"

            "• 撥款\n\n"

            "🚧 目前 Demo 資料庫串接正在建置中。"
        )


    # =====================================================
    # J. AI 資安
    # =====================================================

    elif (
        "資安" in user_message
        or "個資" in user_message
        or "隱私" in user_message
        or "身分證" in user_message
        or "上傳 AI" in user_message
    ):

        reply_text = (
            "🔐 AI 資安提醒\n\n"

            "使用生成式 AI 時，"
            "請避免直接上傳：\n"

            "• 身分證字號\n"

            "• 電話與地址\n"

            "• 銀行帳號\n"

            "• 公司機密\n"

            "• 未授權的個人資料\n\n"

            "如果需要 AI 協助處理文件，"

            "建議先將敏感資訊遮蔽或去識別化。"
        )


    # =====================================================
    # K. 其他未辨識訊息
    # =====================================================
    # 一般模式不再把所有訊息直接送給 Gemini。
    # 必須先輸入「其他」才會進入 AI 智慧客服。

    else:

        reply_text = (
            "🤖 抱歉，我目前沒有找到對應的服務。\n\n"
            "您可以輸入「客服小幫手」查看常見問題，"
            "或輸入「其他」進入 AI 智慧客服自由提問。"
        )


    # =====================================================
    # 最後統一回覆 LINE
    # =====================================================

    send_reply(
        event,
        reply_text
    )


# =========================================================
# 6. 回覆 LINE
# =========================================================

def send_reply(
    event,
    reply_text
):
    try:
        with ApiClient(
            configuration
        ) as api_client:

            messaging_api = MessagingApi(
                api_client
            )

            messaging_api.reply_message(

                ReplyMessageRequest(

                    reply_token=event.reply_token,

                    messages=[
                        TextMessage(
                            text=reply_text
                        )
                    ],

                )

            )
        print(f"[LINE] 成功回覆訊息給使用者！")
    except Exception as e:
        print(f"[LINE 回覆失敗 ERROR] {e}")


from flask_cors import CORS
CORS(app)


# =========================================================
# 7. 啟動 Flask
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=True
    )
