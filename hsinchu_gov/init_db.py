import sqlite3

def init_db():
    conn = sqlite3.connect('hsinchu_gov.db')
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
    print("Mock 資料庫建置完成！(hsinchu_gov.db)")

if __name__ == '__main__':
    init_db()