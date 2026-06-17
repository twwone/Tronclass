<div align="center">

# 🎓 Tronclass Helper

**讓你的翱翔課堂體驗更流暢、更高效**

[![License](https://img.shields.io/github/license/twwone/Tronclass?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/twwone/Tronclass?style=flat-square)](https://github.com/twwone/Tronclass/stargazers)
[![Issues](https://img.shields.io/github/issues/twwone/Tronclass?style=flat-square)](https://github.com/twwone/Tronclass/issues)
[![Last Commit](https://img.shields.io/github/last-commit/twwone/Tronclass?style=flat-square)](https://github.com/twwone/Tronclass/commits)

</div>

---

## 📖 專案簡介

**Tronclass Helper** 是一款針對翱翔課堂（TronClass）學習管理系統所開發的輔助工具，幫助學生更方便地管理課程、查看作業與下載學習資源，讓你不再為繁瑣操作煩惱。

> 🏫 適用對象：使用翱翔課堂平台的大學生與教育工作者

---

## ✨ 主要功能

| 功能 | 說明 |
|------|------|
| 📥 課程資源下載 | 一鍵批量下載課程投影片、影片與附件 |
| 📋 作業追蹤 | 自動整理未繳作業清單並提醒截止日期 |
| 🕐 簽到輔助 | 快速完成課堂簽到，避免遲到扣分 |
| 📊 成績查詢 | 清楚呈現各科目成績與學分統計 |
| 🔔 通知管理 | 整合課程公告，不再遺漏重要訊息 |

---

## 🖥️ 系統需求

- 作業系統：Windows 10+ / macOS 12+ / Linux
- Python **3.8** 以上
- 有效的翱翔課堂帳號

---

## 📦 安裝步驟

### 步驟 1 — 複製專案

```bash
git clone https://github.com/twwone/Tronclass.git
cd Tronclass
```

### 步驟 2 — 安裝相依套件

```bash
pip install -r requirements.txt
```

### 步驟 3 — 設定帳號

複製設定範本並填入你的資訊：

```bash
cp config.example.json config.json
```

開啟 `config.json`，填入帳號資料：

```json
{
  "username": "你的學號",
  "password": "你的密碼",
  "school_url": "https://your-school.tronclass.com.cn"
}
```

> ⚠️ `config.json` 已加入 `.gitignore`，帳號密碼不會被上傳。

---

## 🚀 使用說明

### 啟動程式

```bash
python main.py
```

啟動後會出現互動選單，用數字鍵選擇功能：

```
╔══════════════════════════════╗
║    🎓 Tronclass Helper       ║
╠══════════════════════════════╣
║  [1] 📥 下載課程資源          ║
║  [2] 📋 查看待繳作業          ║
║  [3] 🕐 課堂簽到              ║
║  [4] 📊 查詢成績              ║
║  [5] 🔔 查看最新公告          ║
║  [Q] 離開                    ║
╚══════════════════════════════╝
```

### 常用指令

```bash
# 下載所有課程資源
python main.py download --all

# 只下載指定課程
python main.py download --course "資料結構"

# 查看未繳作業
python main.py homework --pending

# 查詢成績
python main.py grades

# 顯示完整幫助
python main.py --help
```

---

## ⚙️ 進階設定

`config.json` 支援以下進階選項：

```json
{
  "username": "你的學號",
  "password": "你的密碼",
  "school_url": "https://your-school.tronclass.com.cn",
  "download_path": "./downloads",
  "auto_signin": false,
  "notify_days_before": 3
}
```

| 設定項目 | 說明 | 預設值 |
|----------|------|--------|
| `download_path` | 資源儲存路徑 | `./downloads` |
| `auto_signin` | 啟動時自動簽到 | `false` |
| `notify_days_before` | 作業到期提前幾天提醒 | `3` |

---

## 🤝 如何貢獻

歡迎任何形式的貢獻！

1. **Fork** 此專案
2. 建立功能分支：`git checkout -b feature/新功能名稱`
3. 提交修改：`git commit -m 'Add: 新功能說明'`
4. 推送分支：`git push origin feature/新功能名稱`
5. 開啟 **Pull Request**

遇到 Bug 或有功能建議，請至 [Issues](https://github.com/twwone/Tronclass/issues) 回報。

---

## ⚠️ 免責聲明

本工具僅供個人學習使用，請勿用於任何違反學校規定或平台服務條款的行為。使用本工具所產生的任何後果由使用者自行負責。

---

## 📄 授權條款

本專案採用 [MIT License](LICENSE) 授權，詳情請見 LICENSE 檔案。

---

<div align="center">

如果這個專案對你有幫助，請給個 ⭐ Star 支持一下！

Made with ❤️ by [twwone](https://github.com/twwone)

</div>
