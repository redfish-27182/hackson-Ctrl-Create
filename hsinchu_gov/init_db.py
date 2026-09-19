import sqlite3
import os

# 取得目前這支 Python 檔案所在的資料夾絕對路徑
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# 將資料庫路徑固定在跟這支 Python 檔案同一個資料夾內
DB_PATH = os.path.join(BASE_DIR, 'hsinchu_gov.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 建立市民資料表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS citizens (
            id_number TEXT PRIMARY KEY,
            dob TEXT,
            phone TEXT,
            registered_address TEXT,
            mailing_address TEXT
        )
    ''')

    # 清空舊資料（方便重複執行）
    cursor.execute('DELETE FROM citizens')

    # 插入 Mock Data (Demo 用)
    mock_data = [
        ('O123456789', '民國89年05月20日', '0912-345-678', '新竹市北區中正路120號', '新竹市北區中正路120號'),
        ('O987654321', '民國95年12月10日', '0987-654-321', '新竹市東區光復路二段101號', '新竹市東區光復路二段101號'),
        ('J112233445', '民國90年01月01日', '0955-111-222', '新竹市香山區中華路五段200號', '新北市板橋區縣民大道二段7號')
    ]

    cursor.executemany('''
        INSERT INTO citizens (id_number, dob, phone, registered_address, mailing_address)
        VALUES (?, ?, ?, ?, ?)
    ''', mock_data)

    conn.commit()
    conn.close()
    print(f"Mock 資料庫建置完成！")
    print(f"資料庫位置：{DB_PATH}")

if __name__ == '__main__':
    init_db()