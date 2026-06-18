<div align="center">

<img src="chrome-extension/icons/icon128.png" alt="Stay Visible" width="96"/>

# Stay Visible — Tronclass 版

**上課影片切去查資料，回來發現被暫停了？考試切分頁被抓到？這個就是為你做的。**

[![License](https://img.shields.io/github/license/twwone/Tronclass?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/twwone/Tronclass?style=flat-square)](https://github.com/twwone/Tronclass/stargazers)
[![Manifest](https://img.shields.io/badge/Manifest-v3-blue?style=flat-square)](#)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow?logo=googlechrome&logoColor=white&style=flat-square)](#)

</div>

---

## 功能總覽

| 功能 | 說明 |
|------|------|
| 🙈 防離開視窗偵測 | 切分頁、切視窗、Alt+Tab 完全不被偵測 |
| 🖥️ 防全螢幕離開偵測 | 按 Esc 離開全螢幕不被計次 |
| 🖱️ 解除右鍵限制 | 考試中可正常使用右鍵選單 |
| 📋 解除複製貼上限制 | 可自由複製選取題目文字 |
| ✅ 答案擷取 | 送出考卷後自動抓取全部正確答案 |
| 💬 浮動答案面板 | 答案直接顯示在考試頁面右下角，不需要開 popup |
| 🔍 偵測模式 | 記錄所有 API 回應供分析，可匯出 JSON |

---

## 如何安裝

> [!NOTE]
> 這個擴充套件尚未上架 Chrome Web Store，需要用**開發者模式**手動安裝。

**第一步 — 下載這個專案**

點右上角綠色的 **`Code`** 按鈕 → **`Download ZIP`**，下載後解壓縮到任意位置。

**第二步 — 開啟 Chrome 擴充功能頁面**

在網址列輸入並按 Enter：

```
chrome://extensions
```

**第三步 — 啟用開發者模式**

開啟右上角的 **「開發人員模式」** 切換開關。

**第四步 — 載入擴充套件**

點 **「載入未封裝項目」**，選擇解壓縮資料夾裡的 **`chrome-extension`** 子資料夾。

```
Tronclass-main/
└── chrome-extension/   ← 選這個資料夾
    ├── manifest.json
    ├── content.js
    ├── content-main.js
    ├── popup.html
    ├── popup.js
    ├── answers.html
    ├── answers.js
    └── icons/
```

載入完成後，擴充套件列表出現 **Stay Visible** 即安裝成功。

---

## 如何使用

### 一、防偵測（切分頁 / 離開全螢幕）

1. 進到 Tronclass 考試頁面
2. 點右上角 **Stay Visible 圖示**，確認顯示 **已啟用**（綠色）
3. 之後切分頁、Alt+Tab、按 Esc 離開全螢幕，Tronclass 完全偵測不到

---

### 二、答案擷取與浮動面板

送出考卷後，答案會自動被擷取，並透過兩個地方顯示：

#### 浮動面板（考試頁面右下角）

送出後頁面右下角會出現一個**小綠點**：

```
                              ●  ← 小綠點，平常縮著
```

**滑鼠移到小綠點上**，答案面板自動展開：

```
        ┌──────────────────────────────┐
        │ 3 / 10   ‹  ›  —            │
        │ 題目文字（灰色小字）          │
        │                              │
        │ candidate                    │  ← 正確答案（綠色大字）
        └──────────────────────────────┘
                                      ●
```

- **‹ ›**：前後翻題
- **—**：縮回小綠點
- **`Ctrl + \``**：完全隱藏 / 恢復面板（緊急隱藏用）

#### Popup（點擴充套件圖示）

點右上角 Stay Visible 圖示也可以查看所有答案，同樣支援 ‹ › 翻頁。

---

### 三、偵測模式

如需分析 Tronclass API 回應格式：

1. 點 Stay Visible 圖示
2. 勾選底部「偵測模式」
3. 操作 Tronclass 頁面
4. 點「匯出 JSON」下載所有 API 回應紀錄

---

## 它擋掉了什麼

Tronclass 透過瀏覽器多種 API 偵測你是否在考試頁面，Stay Visible 在最底層全部攔截：

| 攔截目標 | 原本的值 | 裝完之後 |
|----------|----------|----------|
| `document.hidden` | `true` | 永遠 `false` |
| `document.visibilityState` | `"hidden"` | 永遠 `"visible"` |
| `document.hasFocus()` | `false` | 永遠 `true` |
| `document.fullscreenElement` | `null`（離開全螢幕） | 永遠回傳頁面元素 |
| `document.fullscreen` | `false` | 永遠 `true` |
| `visibilitychange` 事件 | 會觸發 | 直接擋掉 |
| `fullscreenchange` 事件 | 會觸發 | 直接擋掉 |
| `blur` 事件 | 會觸發 | 直接擋掉 |
| `pagehide` / `freeze` 事件 | 會觸發 | 直接擋掉 |
| `contextmenu` 事件 | 被禁用 | 解除封鎖 |
| `copy` / `cut` / `paste` 事件 | 被禁用 | 解除封鎖 |
| `selectstart` 事件 | 被禁用 | 解除封鎖 |

---

## 考試防作弊機制對應表

| Tronclass 設定 | Stay Visible 對應 |
|----------------|-------------------|
| `is_leaving_window_constrained` | ✅ 攔截 blur / visibilitychange |
| `is_leaving_window_timeout` | ✅ 同上，計時器收不到觸發訊號 |
| `is_fullscreen_mode` | ✅ 攔截 fullscreenchange，偽裝 fullscreenElement |
| `disable_right_click` | ✅ 攔截 contextmenu |
| `disable_copy_paste` | ✅ 攔截 copy / cut / paste / selectstart |
| `enable_invigilation` | ⚠️ 鏡頭監考，套件無法處理 |
| `disable_devtool` | ⏭️ 不處理 |

---

## 瀏覽器支援

| 瀏覽器 | 支援 |
|--------|------|
| Chrome 88+ | ✅ |
| Edge（Chromium 核心） | ✅ |
| Brave | ✅ |
| Firefox | ❌ Manifest v3 不相容 |
| Safari | ❌ 不支援 |

---

## 考試前測試

> [!TIP]
> 考試前先用 `test/index.html` 確認擴充套件正常運作。

1. 用 Chrome 開啟 `test/index.html`
2. 確認頂部顯示 **「Stay Visible 擴充套件已啟用」**
3. 切換分頁、最小化、Alt+Tab 各試一次
4. 底部顯示 **「✅ 可以去考試了」** 才算通過

---

## 免責聲明

> [!CAUTION]
> 本工具僅供個人學習與研究使用。使用前請自行確認是否符合所在學校的相關規範，因使用本工具所產生的任何後果由使用者自行負責。

---

## 授權

[MIT License](LICENSE) © [twwone](https://github.com/twwone)

---

<div align="center">

覺得有用的話給個 ⭐ 讓更多人找得到！

</div>
