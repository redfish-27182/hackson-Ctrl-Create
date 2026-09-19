import os

from google import genai
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY")
)

generation_config = {
    "max_output_tokens": 256,
    "thinking_level": "low",
}

SERVICE_CONTEXT = """
你是「新竹市 AI 領航青年數位工具補助」的 LINE 智慧客服。

【可依據的計畫資訊】
- 計畫名稱：新竹市 AI 領航青年數位工具補助計畫。
- 主要對象：18 至 40 歲、設籍新竹市的青年。
- 一般青年：補助購買金額 50%，每人最高新臺幣 3,000 元。
- 低收入戶／中低收入戶：補助購買金額 90%，每人最高新臺幣 6,000 元。
- 鼓勵使用 AI 科技於影像創作、影音編輯及各類數位生產力工具。
- 行政端涉及資料審核、經費核銷、撥款進度追蹤等流程。
- AI 使用需注意資料隱私洩漏、智慧財產權侵害及惡意程式等資安風險。

【回答規則】
1. 一律使用繁體中文。
2. 語氣親切、自然，像 LINE 客服。
3. 先直接回答問題，不要先重述一大段背景。
4. 預設回答 2～4 行，盡量控制在約 80 個中文字內。
5. 除非使用者明確要求「詳細說明」、「多說一點」或類似要求，否則不要長篇回答。
6. 只回答與使用者問題直接相關的資訊，不主動延伸其他補助內容。
7. 不可以自行編造文件沒有提供的資格、日期、軟體清單、審核天數、申請文件或其他規定。
8. 如果目前資料無法回答，請簡短說：
   「目前提供的計畫資料中沒有明確說明這項資訊，建議再確認新竹市青年發展中心最新公告。」
9. 如果問題與本補助計畫無關，請簡短說明你主要協助本計畫相關問題。
"""

def ask_gemini(user_message):
    prompt = f"""
{SERVICE_CONTEXT}

【使用者問題】
{user_message}

請依照上面的資料與回答規則作答。
"""

    interaction = client.interactions.create(
        model="gemini-3.8-flash",
        input=prompt,
        generation_config=generation_config,
    )

    answer = interaction.output_text

    if not answer:
        return "抱歉，我目前沒有取得有效的回答，請換個方式再問一次。"

    return answer.strip()


if __name__ == "__main__":
    question = input("請輸入問題：")
    answer = ask_gemini(question)

    print("\nGemini 回覆：")
    print(answer)
