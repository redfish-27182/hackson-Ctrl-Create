import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from newdatabase import (
    init_database,
    insert_demo_data,
    get_all_applications,
    find_application
)

# 朋友提供的測試資料 (已修正全形引號)
demo_data = [
    ("AI20260001", "陳小明", "1234", "920517", "資料審核中"),
    ("AI2026002", "王小美", "5678", "900101", "核銷完成"),
    ("AI20260003", "陳美麗", "1357", "900110", "等待補件"),
    ("AI2026004", "林大偉", "2468", "890305", "等待撥款"),
    ("AI2026005", "張怡君", "4321", "930725", "審核完成"),
    ("AI2026006", "李承恩", "8765", "880912", "已完成撥款"),
]

if __name__ == "__main__":
    print("========== 開始測試匯入 Demo 資料 ==========\n")

    # 1. 初始化資料庫
    init_database()

    # 2. 匯入 6 筆資料
    insert_demo_data(demo_data)

    # 3. 測試：印出資料庫內所有的資料
    print("\n--- 目前資料庫內的所有資料 ---")
    all_rows = get_all_applications()
    for row in all_rows:
        print(f"[{row['app_no']}] 姓名: {row['name']} | 身分證末四碼: {row['id_last4']} | 生日: {row['birthday_roc']} | 狀態: {row['status']}")

    # 4. 測試：單筆查詢 (查王小美)
    print("\n--- 測試查詢：王小美 (末四碼 5678) ---")
    result = find_application("王小美", "5678")
    if result:
        print(f"查詢成功：{result}")
    else:
        print("查無資料")

    print("\n========== 測試完成 ==========")