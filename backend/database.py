import sqlite3
import hashlib
from pathlib import Path


# =========================================================
# Database 路徑
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

DB_PATH = BASE_DIR / "demo.db"


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
    建立 applications 與 line_bindings 資料表。
    如果舊資料表缺少欄位會自動補齊。
    並寫入 demo 測試資料。
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
            expected_completed_at TEXT,
            line_id TEXT 
        )
    """)

        # 自動補充舊版本缺少的欄位
    cursor.execute("PRAGMA table_info(applications)")
    existing_cols = {col[1] for col in cursor.fetchall()}
    for col_name, col_type in [
            ("progress_percent", "INTEGER"),
            ("submitted_at", "TEXT"),
            ("updated_at", "TEXT"),
            ("expected_completed_at", "TEXT"),
        ]:
            if col_name not in existing_cols:
                cursor.execute(f"ALTER TABLE applications ADD COLUMN {col_name} {col_type}")

        # 建立 LINE 綁定資料表
    cursor.execute("""
            CREATE TABLE IF NOT EXISTS line_bindings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                line_user_id TEXT UNIQUE NOT NULL,
                application_id TEXT NOT NULL
            )
        """)

    # =========================
    # Demo 測試資料
    # =========================
        #新增狀態時間：進度百分比、送件時間、更新時間、預計完成時間
    demo_data = [
        ("AI20260001", "陳小明", "1234", "920517", "資料審核中","20","2026-03-01 10:00:00","2026-03-02 10:00:00","2026-03-31 10:00:00", "Ub945c2cc692c327562e17341cab81db3"),
        ("AI20260002", "王小美", "5678", "900101", "核銷完成","67","2026-03-07 14:30:00","2026-03-08 14:30:00","2026-04-04 14:30:00", "Uec7e5850552345e8107a60b6dca98d5b"),
        ("AI20260003", "陳美麗", "1357", "900110", "等待補件","30","2026-03-10 09:00:00","2026-03-11 12:00:00","2026-04-09 09:00:00", "Ucb34f80fa6a376985477df17a18dcd07"),
        ("AI20260004", "林大偉", "2468", "890305", "等待撥款","45","2026-03-15 11:00:00","2026-03-16 11:00:00","2026-04-14 11:00:00", "dawei_line"),
        ("AI20260005", "張怡君", "4321", "930725", "審核完成","80","2026-03-20 10:00:00","2026-03-21 10:00:00","2026-04-19 10:00:00", "yijun_line"),
        ("AI20260006", "李承恩", "8765", "880912", "已完成撥款","100","2026-03-25 14:30:00","2026-03-26 14:30:00","2026-04-24 14:30:00", "chengen_line"),
        
    ]

    cursor.executemany("""
        INSERT OR IGNORE INTO applications
        (application_id, name, id_last4, birthday_roc, status, progress_percent, submitted_at, updated_at, expected_completed_at, line_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, demo_data)

    conn.commit()
    print(f"[Database] 資料庫初始化完成！已確保測試資料存在。")


# =========================================================
# Demo 資料寫入相容函式
# =========================================================

def insert_demo_data(data_list):
    """批量新增 Demo 資料"""
    with get_connection() as conn:
        cursor = conn.cursor()
        for item in data_list:
            if len(item) == 5:
                cursor.execute("""
                    INSERT OR REPLACE INTO applications
                    (application_id, name, id_last4, birthday_roc, status)
                    VALUES (?, ?, ?, ?, ?)
                """, item)
            elif len(item) >= 9:
                cursor.execute("""
                    INSERT OR REPLACE INTO applications
                    (application_id, name, id_last4, birthday_roc, status, progress_percent, submitted_at, updated_at, expected_completed_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, item[:9])
        conn.commit()
        print(f"[Database] 成功寫入 {len(data_list)} 筆測試資料！")


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
        return [dict(row) for row in cursor.fetchall()]


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
            INSERT OR REPLACE INTO line_bindings
            (line_user_id, application_id)
            VALUES (?, ?)
        """, (
            str(line_user_id),
            str(application_id)
        ))
        conn.commit()
        success = cursor.rowcount > 0

    if success:
        print(f"[Database] LINE 綁定完成：{application_id}")
    else:
        print(f"[Database] 綁定失敗：{application_id}")

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
            SELECT application_id, name
            FROM applications
            WHERE name = ?
            LIMIT 1
        """, (name,))
        row = cursor.fetchone()
        if not row:
            return None
        return (
            row["application_id"],
            row["name"]
        )


# =========================================================
# 依 LINE User ID 查詢案件
# 給 /api/applications/by-line/<line_user_id> 與一鍵申請自動代入
# =========================================================

def find_application_by_line_user(
    line_user_id: str
):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT a.application_id, a.name, a.id_last4, a.birthday_roc,
                   a.status, a.progress_percent, a.submitted_at,
                   a.updated_at, a.expected_completed_at
            FROM line_bindings AS b
            JOIN applications AS a ON a.application_id = b.application_id
            WHERE b.line_user_id = ?
            LIMIT 1
        """, (str(line_user_id),))
        row = cursor.fetchone()

        # 若 LINE 尚未綁定，依據 line_user_id hash 動態分配不同的 Demo 申請人
        if row is None:
            cursor.execute("""
                SELECT application_id, name, id_last4, birthday_roc, status
                FROM applications
            """)
            all_apps = cursor.fetchall()
            if all_apps:
                idx = int(hashlib.md5(str(line_user_id).encode("utf-8")).hexdigest(), 16) % len(all_apps)
                row = all_apps[idx]
                # 自動儲存綁定，確保同一位使用者後續進入都是同一個人
                try:
                    cursor.execute("""
                        INSERT OR REPLACE INTO line_bindings (line_user_id, application_id)
                        VALUES (?, ?)
                    """, (str(line_user_id), row["application_id"]))
                    conn.commit()
                except Exception as e:
                    print(f"[DB Auto-bind warning] {e}")

    if not row:
        return None

    app_data = dict(row)

    raw_bday = str(app_data.get("birthday_roc", ""))
    if len(raw_bday) == 6:
        b_year, b_month, b_day = raw_bday[:2], raw_bday[2:4], raw_bday[4:6]
    elif len(raw_bday) == 7:
        b_year, b_month, b_day = raw_bday[:3], raw_bday[3:5], raw_bday[5:7]
    else:
        b_year, b_month, b_day = "92", "05", "17"

    last4 = str(app_data.get("id_last4", "1234"))
    id_number = f"O12345{last4}"

    return {
        "application_id": app_data.get("application_id"),
        "name": app_data.get("name"),
        "id_last4": last4,
        "id_number": id_number,
        "birthday_roc": raw_bday,
        "birthday_year": b_year,
        "birthday_month": b_month,
        "birthday_day": b_day,
        "status": app_data.get("status"),
        # 照片對應表單缺少的資料，先提供假資料，待日後補齊 DB
        "target_type": "general",             # general: 一般青年, specific: 特定對象與文化語言保存者
        "phone": "0912-345-678",
        "email": f"applicant_{last4}@gmail.com",
        "registered_address": "新竹市東區中央路 120 號",
        "mailing_address": "新竹市東區中央路 120 號",
        "same_address": True,
        "payment_cycle": "monthly",           # annual: 年費制, monthly: 月費制
        "software_function": "general",       # general, image, office, learn, other
        "software_name": "ChatGPT Plus",
        "software_company": "OpenAI, Inc.",
        "origin": "美國",
        "purchase_year": "113",
        "purchase_month": "03",
        "purchase_day": "15",
        "original_price": "USD 20.00",
        "twd_price": "640",
        "credit_card_type": "self",           # self: 本人信用卡, proxy: 父母、配偶或法定代理人信用卡
    }


# =========================================================
# 刪除案件
# =========================================================

def delete_application(
    application_id: str
):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM applications
            WHERE application_id = ?
        """, (str(application_id),))
        cursor.execute("""
            DELETE FROM line_bindings
            WHERE application_id = ?
        """, (str(application_id),))
        conn.commit()
        return cursor.rowcount > 0