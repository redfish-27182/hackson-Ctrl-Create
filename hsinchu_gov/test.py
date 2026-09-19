import requests
import json

url = "http://127.0.0.1:5001/api/verify_citizen"
payload = {
    "id_number": "O123456789",
    "dob": "民國89年05月20日"
}

response = requests.post(url, json=payload)
# 將 JSON 轉回字典，再用 ensure_ascii=False 印出漂亮的中文格式
data = response.json()
print("HTTP 狀態碼:", response.status_code)
print("伺服器回傳內容:", json.dumps(data, ensure_ascii=False, indent=2))