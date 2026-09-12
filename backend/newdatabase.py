import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "database.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """建立支援 5 欄位的資料表結構"""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                app_no TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                id_last4 TEXT NOT NULL,
                birthday_roc TEXT NOT NULL,
                status TEXT NOT NULL
            )
        """)
        conn.commit()
    print("[Database] 資料庫初始化完成！")

def insert_demo_data(data_list):
    """批量新增多筆 Demo 資料 (若已存在則覆寫更新)"""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.executemany("""
            INSERT OR REPLACE INTO applications (app_no, name, id_last4, birthday_roc, status)
            VALUES (?, ?, ?, ?, ?)
        """, data_list)
        conn.commit()
        print(f"[Database] 成功寫入 {cursor.rowcount} 筆測試資料！")

def get_all_applications():
    """查詢所有申請案件"""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM applications")
        return [dict(row) for row in cursor.fetchall()]

def find_application(name: str, id_last4: str):
    """依照 姓名 與 身分證末四碼 查詢"""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM applications 
            WHERE name = ? AND id_last4 = ?
        """, (name, id_last4))
        row = cursor.fetchone()
        return dict(row) if row else None

def delete_application(app_no: str):
    """根據 申請編號 刪除紀錄"""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM applications WHERE app_no = ?", (app_no,))
        conn.commit()
        return cursor.rowcount > 0