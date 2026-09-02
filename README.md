# hackson-Ctrl-Create

梅竹黑客松專案倉庫。

Ctrl & Create 隊

---

## 目錄架構

```text
hackson-Ctrl-Create/
├── frontend/          # 前端程式碼
├── backend/           # 後端程式碼
├── .gitignore         # Git 設定
└── README.md          # 專案說明文件
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

## 開發流程（SOP）

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

## Git 初學者新手村

> [!IMPORTANT]
> 如果從未用過 Git，請依序完成以下步驟：

### 1. 安裝 Git
* **Windows**：前往 [git-scm.com](https://git-scm.com/) 下載安裝檔，安裝過程一路按「Next」預設值到底即可。
* **Mac**：開啟「終端機（Terminal）」，輸入 `git --version`，系統會自動跳出提示引導安裝 Command Line Tools。

### 2. 第一次使用需設定身分（僅需執行一次）
安裝後打開 VS Code 的終端機（或 Git Bash），輸入：
```bash
git config --global user.name "你的GitHub暱稱"
git config --global user.email "你的GitHub信箱"
```

### 3. 下載專案到自己電腦（Clone）
找好你想放專案的資料夾，打開終端機執行：
```bash
git clone [https://github.com/redfish-27182/hackson-Ctrl-Create.git](https://github.com/redfish-27182/hackson-Ctrl-Create.git)
cd hackson-Ctrl-Create
```
下載完成後，用 VS Code 打開這個資料夾，照著上方的「開發流程（SOP）」開始寫扣即可。
