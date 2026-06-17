<div align="center">

<img src="chrome-extension/icons/icon128.png" alt="Stay Visible" width="96"/>

# Stay Visible

**防止翱翔課堂（TronClass）偵測你切換視窗或分頁**

[![License](https://img.shields.io/github/license/twwone/Tronclass?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/twwone/Tronclass?style=flat-square)](https://github.com/twwone/Tronclass/stargazers)
[![Manifest](https://img.shields.io/badge/Manifest-v3-blue?style=flat-square)](#)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow?logo=googlechrome&logoColor=white&style=flat-square)](#)

</div>

---

## 📖 這是什麼？

很多線上學習平台（包括翱翔課堂）會監聽你的視窗焦點，當你切換到其他分頁或視窗時，影片會自動暫停、甚至記錄離開次數。

**Stay Visible** 是一款 Chrome 擴充套件，透過攔截瀏覽器的 Visibility API，讓網頁永遠以為你還在這個分頁，解決上述問題。

### 它做了什麼？

| 攔截項目 | 說明 |
|----------|------|
| `document.hidden` | 永遠回傳 `false`（頁面不隱藏） |
| `document.visibilityState` | 永遠回傳 `'visible'`（頁面可見） |
| `visibilitychange` 事件 | 阻止觸發 |
| `blur` 事件 | 阻止觸發 |
| `pagehide` 事件 | 阻止觸發 |

---

## 📦 安裝方式

> Chrome Web Store 上架前，請使用**手動安裝（開發者模式）**。

### 步驟 1 — 下載專案

```bash
git clone https://github.com/twwone/Tronclass.git
```

或直接點右上角 **Code → Download ZIP** 下載後解壓縮。

### 步驟 2 — 開啟 Chrome 擴充功能頁面

在網址列輸入：

```
chrome://extensions
```

### 步驟 3 — 啟用開發者模式

開啟右上角的 **「開發人員模式」** 開關。

![開發者模式示意](https://i.imgur.com/placeholder-devmode.png)

### 步驟 4 — 載入擴充套件

點擊 **「載入未封裝項目」**，選擇剛才下載的 `chrome-extension/` 資料夾。

完成後擴充套件列表中會出現 **Stay Visible**。

---

## 🚀 使用方式

1. 進入翱翔課堂（或任何需要的網站）
2. 點擊瀏覽器右上角的 **Stay Visible 圖示**
3. 確認狀態顯示 **已啟用 ✅**

```
┌─────────────────────┐
│    Stay Visible     │
│                     │
│    已啟用 ✅         │
│                     │
│  ┌───────────────┐  │
│  │   點我停用    │  │  ← 點擊切換開關
│  └───────────────┘  │
└─────────────────────┘
```

| 狀態 | 說明 |
|------|------|
| ✅ 已啟用（綠色） | 網頁無法偵測你切換分頁 |
| ❌ 已停用（紅色） | 恢復瀏覽器原始行為 |

> 設定會自動記住，重新整理後依然有效。

---

## 📁 專案結構

```
chrome-extension/
├── manifest.json   # 擴充套件設定（Manifest v3）
├── content.js      # 核心邏輯，攔截 Visibility API
├── popup.html      # 點擊圖示後的彈出介面
├── popup.js        # 介面控制邏輯
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## 🔧 相容性

| 瀏覽器 | 支援狀況 |
|--------|----------|
| Chrome 88+ | ✅ 完整支援 |
| Edge（Chromium）| ✅ 完整支援 |
| Firefox | ❌ 不支援（Manifest v3 差異） |
| Safari | ❌ 不支援 |

---

## ⚠️ 免責聲明

本工具僅供個人學習與研究使用。使用前請確認是否符合所在學校的規範，因使用本工具所產生的任何後果由使用者自行承擔。

---

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request！

1. Fork 此專案
2. 建立分支：`git checkout -b feature/改進內容`
3. 提交：`git commit -m 'Add: 說明'`
4. 推送：`git push origin feature/改進內容`
5. 開啟 Pull Request

---

## 📄 授權

[MIT License](LICENSE) © [twwone](https://github.com/twwone)

---

<div align="center">

如果這個專案對你有幫助，請給個 ⭐ 支持！

</div>
