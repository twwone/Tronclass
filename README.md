<div align="center">

<img src="chrome-extension/icons/icon128.png" alt="Stay Visible" width="96"/>

# Stay Visible — Tronclass 版

**上課影片切去查資料，回來發現被暫停了？這個就是為你做的。**

[![License](https://img.shields.io/github/license/twwone/Tronclass?style=flat-square)](LICENSE)
[![Stars](https://img.shields.io/github/stars/twwone/Tronclass?style=flat-square)](https://github.com/twwone/Tronclass/stargazers)
[![Manifest](https://img.shields.io/badge/Manifest-v3-blue?style=flat-square)](#)
[![Chrome](https://img.shields.io/badge/Chrome-Extension-yellow?logo=googlechrome&logoColor=white&style=flat-square)](#)

</div>

---

> 翱翔課堂的影片只要你切換分頁就會暫停，回來還要從頭找進度。
> 這個擴充套件讓瀏覽器跟網頁說「我還在」，讓你安心多開分頁查資料。

---

## 它做了什麼

翱翔課堂透過瀏覽器的 [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) 偵測你有沒有在看。Stay Visible 直接在最底層攔截這些訊號：

| 攔截目標 | 原本的值 | 裝完之後 |
|----------|----------|----------|
| `document.hidden` | `true`（你切走了） | 永遠 `false` |
| `document.visibilityState` | `"hidden"` | 永遠 `"visible"` |
| `visibilitychange` 事件 | 會觸發 | 直接擋掉 |
| `blur` / `pagehide` 事件 | 會觸發 | 直接擋掉 |

---

## 如何安裝

> [!NOTE]
> 這個擴充套件尚未上架 Chrome Web Store，需要用**開發者模式**手動安裝，步驟很簡單，跟著做就行。

**第一步 — 下載這個專案**

點右上角綠色的 **`Code`** 按鈕 → **`Download ZIP`**，下載後解壓縮到任意位置。

---

**第二步 — 開啟 Chrome 擴充功能頁面**

在網址列輸入以下網址並按 Enter：

```
chrome://extensions
```

---

**第三步 — 啟用開發者模式**

進入頁面後，開啟右上角的 **「開發人員模式」** 切換開關。

> [!WARNING]
> 如果沒開啟開發者模式，下一步的「載入未封裝項目」按鈕不會出現。

---

**第四步 — 載入擴充套件**

點擊左上角出現的 **「載入未封裝項目」**，選擇你剛才解壓縮的資料夾裡的 **`chrome-extension`** 子資料夾。

```
Tronclass-main/
└── chrome-extension/   ← 選這個資料夾
    ├── manifest.json
    ├── content.js
    ├── popup.html
    ├── popup.js
    └── icons/
```

載入完成後，擴充套件列表會出現 **Stay Visible**，代表安裝成功 🎉

---

## 如何使用

1. 打開翱翔課堂，進到有影片的頁面
2. 點瀏覽器右上角工具列的 **Stay Visible 圖示**
3. 確認彈出視窗顯示 **已啟用 ✅**（按鈕是綠色的）

就這樣，之後切去其他分頁影片也不會暫停了。

---

想暫時關掉的話，再點一次圖示，按 **點我停用** 即可切回紅色（❌ 已停用），瀏覽器恢復正常行為。

> [!NOTE]
> 設定會記住，重新整理或重開瀏覽器後不需要重新設定。

---

## 瀏覽器支援

| 瀏覽器 | 支援 |
|--------|------|
| Chrome 88+ | ✅ |
| Edge（Chromium 核心）| ✅ |
| Brave | ✅ |
| Firefox | ❌ Manifest v3 不相容 |
| Safari | ❌ 不支援 |

---

## 考試模式也適用 🎓

> [!IMPORTANT]
> TronClass 的**線上考試防作弊**用的是完全一樣的偵測機制，Stay Visible 同樣有效。

翱翔課堂考試的防作弊運作方式如下：

老師在建立測驗時可設定「**答題時離開視窗超過 N 次則強制交卷**」（進階設定 → 防作弊）：

| 老師設定 | 結果 |
|----------|------|
| 設為 0 次 | 只要離開視窗一次，立刻強制交卷 |
| 設為 3 次 | 警告 3 次後強制交卷 |
| 未開啟防作弊 | 沒有任何限制 |

Stay Visible 攔截的 `visibilitychange`、`blur`、`pagehide` 事件，正是 TronClass 考試拿來計算「離開次數」的訊號，所以開著擴充套件考試不會被扣次數。

> [!WARNING]
> 注意：上傳附件時開啟的系統資料夾對話框，**也會被部分學校計算為離開視窗**，這部分 Stay Visible 無法攔截（屬於作業系統層級行為）。考試前確認老師是否設置次數限制。

---

## 常見問題

**Q：裝完之後影片還是會暫停？**
確認 popup 顯示「已啟用 ✅」。如果是，可能是該平台用了其他偵測方式（例如滑鼠移動偵測），Stay Visible 目前只攔截 Visibility API。

**Q：考試時開著安全嗎？不會被伺服器發現？**
Stay Visible 只修改本機瀏覽器行為，不會對伺服器發送任何請求，伺服器端無法感知。

**Q：為什麼不上架 Chrome Web Store？**
開發中，歡迎給 ⭐ 催更。

---

## 免責聲明

> [!CAUTION]
> 本工具僅供個人學習與研究使用。使用前請自行確認是否符合所在學校的相關規範，因使用本工具所產生的任何後果由使用者自行負責。

---

## 考試前測試

> [!TIP]
> 考試前先用 `test/index.html` 做回測，確認擴充套件攔截正常再去考試。

1. 下載本專案後，直接用 Chrome 開啟 `test/index.html`
2. 確認頂部顯示 **「Stay Visible 擴充套件已啟用」**
3. 切換分頁、最小化、Alt+Tab 各試一次
4. 底部顯示 **「✅ 可以去考試了」** 才算通過

---

## 授權

[MIT License](LICENSE) © [twwone](https://github.com/twwone)

---

<div align="center">

覺得有用的話給個 ⭐ 讓更多人找得到！

</div>
