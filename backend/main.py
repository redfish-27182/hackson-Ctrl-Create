import os
import sys
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
)


# =========================================================
# Flask / dotenv
# =========================================================

from flask import Flask, request, abort
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
)

from linebot.v3.webhooks import (
    MessageEvent,
    TextMessageContent,
)


# =========================================================
# 1. 讀取專案根目錄的 .env
# =========================================================

ENV_PATH = BASE_DIR / ".env"

load_dotenv(ENV_PATH)

app = Flask(__name__)

init_database()


# =========================================================
# LINE 環境變數
# =========================================================

CHANNEL_SECRET = os.getenv("LINE_CHANNEL_SECRET")
CHANNEL_ACCESS_TOKEN = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")


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


        # 只處理文字訊息
        if not isinstance(
            event.message,
            TextMessageContent
        ):
            continue


        handle_text_message(event)


    return "OK"


# =========================================================
# 5. 訊息處理
# =========================================================

def handle_text_message(event):

    user_message = event.message.text.strip()

    print(
        f"[LINE] 收到訊息：{user_message}"
    )


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

        "資安遊戲",
    }


    if user_message in web_menu_messages:

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

            "🤖 可補助工具\n"

            "📝 申請流程\n"

            "📄 補件／核銷\n"

            "📞 聯絡我們\n"

            "💬 問題回報\n"

            "📖 常見問題\n"

            "🔍 搜尋\n"

            "🔐 AI 資安\n\n"

            "直接輸入問題就可以囉！\n\n"

            "例如：\n"

            "「誰可以申請？」\n"

            "「補助多少錢？」\n"

            "「AI 資安要注意什麼？」"
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
    # K. 其他問題
    #
    # ⭐ 這裡就是 Gemini AI 客服
    # =====================================================

    else:

        print(
            f"[Gemini] 準備詢問：{user_message}"
        )

        try:

            reply_text = ask_gemini(
                user_message
            )

            # 避免 Gemini 意外回傳空值
            if not reply_text:

                reply_text = (
                    "🤖 抱歉，我目前沒有取得有效的回答。"
                    "\n\n請換個方式再問我一次！"
                )

            print(
                f"[Gemini] 回覆：{reply_text}"
            )


        except Exception as e:

            print(
                f"[Gemini Error] {e}"
            )

            reply_text = (
                "🤖 抱歉，目前 AI 客服暫時無法回覆。\n\n"

                "您可以先詢問：\n"

                "• 誰可以申請？\n"

                "• 補助多少錢？\n"

                "• 可以補助哪些工具？\n"

                "• 申請流程是什麼？\n"

                "• AI 資安要注意什麼？"
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


# =========================================================
# 7. 啟動 Flask
# =========================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )