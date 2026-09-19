import sqlite3
from pathlib import Path


# =========================================================
# Database 路徑
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

DB_PATH = BASE_DIR / "database.db"


# =========================================================
# 建立連線
# =========================================================

def get_connection():

    conn = sqlite3.connect(DB_PATH)

    conn.row_factory = sqlite3.Row

    return conn


# =========================================================
# 初始化資料庫
# =========================================================

def init_database():

    """
    建立 applications 資料表。
    如果舊資料表沒有 line_user_id，
    會自動補上。
    """

    with get_connection() as conn:

        cursor = conn.cursor()

    # 建立申請資料表
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            application_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            id_last4 TEXT NOT NULL,
            birthday_roc TEXT NOT NULL,
            status TEXT NOT NULL,
            progress_percent INTEGER,         
            submitted_at TEXT,               
            updated_at TEXT,                 
            expected_completed_at TEXT      
        )
    """)

        # -------------------------------------------------
        # 相容舊版 database.db
        # 如果原本沒有 line_user_id，自動加入
        # -------------------------------------------------

        cursor.execute("""
            PRAGMA table_info(applications)
        """)

        columns = [
            row["name"]
            for row in cursor.fetchall()
        ]

        if "line_user_id" not in columns:

            cursor.execute("""
                ALTER TABLE applications
                ADD COLUMN line_user_id TEXT
            """)

            print(
                "[Database] 已新增 line_user_id 欄位"
            )

        conn.commit()

    print(
        "[Database] 資料庫初始化完成！"
    )


# =========================================================
# Demo 資料
# =========================================================

def insert_demo_data(data_list):

    """
    批量新增 Demo 資料。
    如果 app_no 已存在，就更新。
    """

    with get_connection() as conn:

        cursor = conn.cursor()

        cursor.executemany("""
            INSERT OR REPLACE INTO applications
            (
                app_no,
                name,
                id_last4,
                birthday_roc,
                status
            )

            VALUES (?, ?, ?, ?, ?)
        """, data_list)

        conn.commit()

        print(
            f"[Database] 成功寫入 "
            f"{cursor.rowcount} 筆測試資料！"
        )


# =========================================================
# 查詢所有案件
# =========================================================

def get_all_applications():

    with get_connection() as conn:

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM applications
        """)

        return [
            dict(row)
            for row in cursor.fetchall()
        ]


# =========================================================
# 帳號綁定用
# 姓名 + 身分證末四碼 + 出生年月日
# =========================================================

def find_application(
    name: str,
    id_last4: str,
    birthday_roc: str
):

    with get_connection() as conn:

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM applications

            WHERE name = ?
              AND id_last4 = ?
              AND birthday_roc = ?

            LIMIT 1
        """, (
            name,
            id_last4,
            birthday_roc
        ))

        row = cursor.fetchone()

        if row:
            return dict(row)

        return None


# =========================================================
# LINE 帳號綁定
# =========================================================

def bind_line_user(
    line_user_id: str,
    application_id: str
):

    with get_connection() as conn:

        cursor = conn.cursor()

        cursor.execute("""
            UPDATE applications

            SET line_user_id = ?

            WHERE app_no = ?
        """, (
            line_user_id,
            application_id
        ))

        conn.commit()

        success = (
            cursor.rowcount > 0
        )

    if success:

        print(
            "[Database] LINE 綁定完成："
            f"{application_id}"
        )

    else:

        print(
            "[Database] 找不到案件："
            f"{application_id}"
        )

    return success


# =========================================================
# 依姓名查詢案件
# 給前端 /applications API 使用
# =========================================================

def find_application_by_name(
    name: str
):

    with get_connection() as conn:

        cursor = conn.cursor()

        cursor.execute("""
            SELECT *
            FROM applications

            WHERE name = ?

            LIMIT 1
        """, (
            name,
        ))

        row = cursor.fetchone()

        if not row:
            return None

        # 配合目前 main.py 的寫法：
        #
        # application_id = application[0]
        # applicant_name = application[1]
        #
        # 所以這裡刻意回傳 tuple

        return (
            row["app_no"],
            row["name"],
        )


# =========================================================
# 刪除案件
# =========================================================

def delete_application(
    app_no: str
):

    with get_connection() as conn:

        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM applications

            WHERE app_no = ?
        """, (
            app_no,
        ))

        conn.commit()

        return (
            cursor.rowcount > 0
        )
