from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3
import os

# 取得目前這支 Python 檔案所在的資料夾絕對路徑
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 將資料庫路徑固定在跟這支 Python 檔案同一個資料夾內
DB_PATH = os.path.join(BASE_DIR, 'hsinchu_gov.db')

app = FastAPI(title="Hsinchu Mock API")

# 設定 CORS 允許你的前端網站發送請求
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 黑客松期間可設為 "*" 方便開發
    allow_methods=["*"],
    allow_headers=["*"],
)

# 定義前端傳來的資料結構
class VerifyRequest(BaseModel):
    id_number: str
    dob: str

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.post("/api/verify")
def verify_citizen(request: VerifyRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 查詢資料庫
    cursor.execute(
        "SELECT phone, registered_address, mailing_address FROM citizens WHERE id_number = ? AND dob = ?",
        (request.id_number, request.dob)
    )
    user = cursor.fetchone()
    conn.close()

    if user:
        return {
            "status": "success",
            "data": {
                "phone": user["phone"],
                "registered_address": user["registered_address"],
                "mailing_address": user["mailing_address"]
            }
        }
    else:
        raise HTTPException(status_code=404, detail="查無此人或身分證與出生日期不符")

# 注意：這裡已經修正了縮排，必須放在最外層才能正確啟動伺服器
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)