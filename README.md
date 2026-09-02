# hackson-Ctrl-Create

梅竹黑客松專案倉庫。

隊名: Ctrl & Create 隊

---

## 目錄架構

```text
hackson-Ctrl-Create/
├── frontend/          # 前端程式碼
├── backend/           # 後端程式碼
├── .gitignore         # Git 設定
└── README.md          # 專案說明文件（本檔案）
```
---

## 專案目錄結構

```text
hackson-Ctrl-Create/
├── frontend/          # 前端程式碼（React + Vite）
├── backend/           # 後端程式碼（Python + FastAPI）
├── .gitignore         # Git 忽略設定檔
└── README.md          # 專案協作手冊（本檔案）
```

---

## 團隊須知

### 1. 核心開發守則
* **嚴禁直接 Push 到 `main` 分支**：所有功能開發請建立獨立分支，透過 Pull Request (PR) 合併進主分支。
* **嚴禁提交敏感金鑰**：API Key、金鑰或密碼一律放在本機 `.env`，切勿推上 GitHub。

### 2. Commit 訊息範例
* `feat: 新增某功能`
* `fix: 修復某問題`
* `style: 調整排版或樣式`
* `chore: 調整套件或設定檔`

---

## 標準開發工作流程（SOP）

1. **同步最新主分支並開新分支**：
   ```bash
   git checkout main
   git pull origin main
   git checkout -b <你的分支名稱>
   ```

2. **本地開發與提交**：
   ```bash
   git add .
   git commit -m "feat: 實作某功能"
   ```

3. **推送至遠端**：
   ```bash
   git push -u origin <你的分支名稱>
   ```

4. **發起 Pull Request (PR)**：
   * 前往 GitHub 倉庫點選 **Compare & pull request**。
   * 簡述修改內容，確認無衝突後合併進 `main`。
   * 合併後可直接刪除 GitHub 上的舊分支。
