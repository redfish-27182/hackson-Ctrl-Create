import sqlite3
from pathlib import Path


DB_PATH = Path(__file__).resolve().parent / "demo.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_database():
    conn = get_connection()
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
            progress_percent INTEGER,         #新增：進度百分比 (例如 50)
            submitted_at TEXT,               #新增：送件時間 (例如 '2026-03-01 10:00:00')
            updated_at TEXT,                 #新增：更新時間
            expected_completed_at TEXT       #新增：預計完成時間
        )
    """)

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
        ("AI20260001", "陳小明", "1234", "920517", "資料審核中","20","2026-03-01 10:00:00","2026-03-02 10:00:00","2026-03-31 10:00:00"),
        ("AI20260002", "王小美", "5678", "900101", "核銷完成","67","2026-03-07 14:30:00","2026-03-08 14:30:00","2026-04-04 14:30:00"),
        ("AI20260003", "陳美麗", "1357", "900110", "等待補件","30","2026-03-10 09:00:00","2026-03-11 12:00:00","2026-04-09 09:00:00"),
        ("AI20260004", "林大偉", "2468", "890305", "等待撥款","45","2026-03-15 11:00:00","2026-03-16 11:00:00","2026-04-14 11:00:00"),
        ("AI20260005", "張怡君", "4321", "930725", "審核完成","80","2026-03-20 10:00:00","2026-03-21 10:00:00","2026-04-19 10:00:00"),
        ("AI20260006", "李承恩", "8765", "880912", "已完成撥款","100","2026-03-25 14:30:00","2026-03-26 14:30:00","2026-04-24 14:30:00"),
    ]

    cursor.executemany("""
        INSERT OR IGNORE INTO applications
        (application_id, name, id_last4, birthday_roc, status, progress_percent, submitted_at, updated_at, expected_completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, demo_data)

    conn.commit()
    conn.close()


def find_application(name, id_last4, birthday_roc):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT application_id, name, status
        FROM applications
        WHERE name = ?
        AND id_last4 = ?
        AND birthday_roc = ?
    """, (
        name,
        id_last4,
        birthday_roc
    ))

    result = cursor.fetchone()

    conn.close()

    return result


def bind_line_user(line_user_id, application_id):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT OR REPLACE INTO line_bindings
        (line_user_id, application_id)
        VALUES (?, ?)
    """, (
        line_user_id,
        application_id
    ))

    conn.commit()
    conn.close()