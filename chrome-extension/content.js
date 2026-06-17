// ISOLATED world — document 屬性覆寫 + chrome.storage + 注入 MAIN world 備援腳本
(() => {
  // ── 注入備援腳本到 MAIN world（透過 <script> 標籤，確保在頁面 JS 之前執行）──
  // 若 "world":"MAIN" 的 content-main.js 已執行則跳過（靠 window.__sv_loaded 旗標判斷）
  try {
    const s = document.createElement('script');
    s.textContent = `(function(){
if(window.__sv_loaded)return;
window.__sv_loaded=true;
var WB=["blur","pagehide","freeze"],DB=["visibilitychange","webkitvisibilitychange","mozvisibilitychange","fullscreenchange","webkitfullscreenchange","mozfullscreenchange","contextmenu","copy","cut","paste","selectstart","dragstart"];
var _a=EventTarget.prototype.addEventListener,_r=EventTarget.prototype.removeEventListener;
var on=true;
EventTarget.prototype.addEventListener=function(t,f,o){
  if(on&&((this===window&&WB.indexOf(t)>=0)||(this===document&&DB.indexOf(t)>=0)))return;
  return _a.call(this,t,f,o);
};
function ss(e){e.stopImmediatePropagation();}
function sm(e){if(!e.relatedTarget)e.stopImmediatePropagation();}
var _hf=Document.prototype.hasFocus;
function ap(){on=true;_a.call(window,"blur",ss,true);_a.call(window,"pagehide",ss,true);_a.call(document,"freeze",ss,true);_a.call(document,"mouseleave",sm,true);Document.prototype.hasFocus=function(){return true;};}
function rs(){on=false;_r.call(window,"blur",ss,true);_r.call(window,"pagehide",ss,true);_r.call(document,"freeze",ss,true);_r.call(document,"mouseleave",sm,true);Document.prototype.hasFocus=_hf;}
_a.call(document,"__sv_toggle__",function(e){e.detail.enabled?ap():rs();});
ap();
})();`;
    (document.documentElement || document.head).appendChild(s);
    s.remove();
  } catch (_) { /* CSP 擋住 inline script，靠 content-main.js 處理 */ }

  // ── chrome.storage 狀態管理 ──────────────────────────────────────────
  let enabled = true;

  chrome.storage.local.get('enabled', (result) => {
    enabled = result.enabled !== false;
    enabled ? apply() : restore();
    document.dispatchEvent(new CustomEvent('__sv_toggle__', { detail: { enabled } }));
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      enabled = changes.enabled.newValue;
      enabled ? apply() : restore();
      document.dispatchEvent(new CustomEvent('__sv_toggle__', { detail: { enabled } }));
    }
  });

  // ── 浮動答案面板（隱匿版）────────────────────────────────────────────────
  let overlayAnswers = [];
  let overlayIndex = 0;
  let wrapEl = null;
  let dotEl = null;
  let panelEl = null;
  let stealthMode = false;
  let hideTimer = null;

  function buildOverlay() {
    if (wrapEl) return;

    // 外層容器：點和面板都在裡面，滑鼠在容器內任何位置都不縮
    wrapEl = document.createElement('div');
    wrapEl.style.cssText = [
      'position:fixed', 'bottom:10px', 'right:10px', 'z-index:2147483647',
      'display:flex', 'flex-direction:column', 'align-items:flex-end', 'gap:6px',
    ].join(';');

    panelEl = document.createElement('div');
    panelEl.style.cssText = [
      'background:rgba(10,10,10,0.88)', 'color:#fff',
      'padding:10px 13px', 'border-radius:10px',
      'font-size:13px', 'max-width:310px', 'min-width:180px',
      'font-family:sans-serif', 'line-height:1.6',
      'box-shadow:0 4px 16px rgba(0,0,0,0.45)',
      'user-select:none', 'display:none',
    ].join(';');
    panelEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:10px;color:#888" id="__sv_counter__"></span>
        <div style="display:flex;gap:5px">
          <button id="__sv_prev__" style="background:#2a2a2a;color:#ccc;border:none;border-radius:3px;padding:1px 7px;cursor:pointer;font-size:13px">‹</button>
          <button id="__sv_next__" style="background:#2a2a2a;color:#ccc;border:none;border-radius:3px;padding:1px 7px;cursor:pointer;font-size:13px">›</button>
          <button id="__sv_hide__" style="background:#2a2a2a;color:#888;border:none;border-radius:3px;padding:1px 7px;cursor:pointer;font-size:11px" title="縮回小點">—</button>
        </div>
      </div>
      <div id="__sv_q__" style="font-size:11px;color:#999;margin-bottom:4px;max-height:55px;overflow-y:auto;display:none"></div>
      <div id="__sv_a__" style="font-size:15px;font-weight:bold;color:#6dff6d;word-break:break-all"></div>
    `;

    dotEl = document.createElement('div');
    dotEl.style.cssText = [
      'width:8px', 'height:8px', 'border-radius:50%',
      'background:rgba(100,180,100,0.35)', 'cursor:pointer',
      'align-self:flex-end',
    ].join(';');

    wrapEl.appendChild(panelEl);
    wrapEl.appendChild(dotEl);
    document.body.appendChild(wrapEl);

    // 滑鼠進入整個容器才展開，離開整個容器才縮（300ms 緩衝）
    wrapEl.addEventListener('mouseenter', () => {
      clearTimeout(hideTimer);
      if (!stealthMode && overlayAnswers.length) showPanel();
    });
    wrapEl.addEventListener('mouseleave', () => {
      hideTimer = setTimeout(() => hidePanel(), 300);
    });

    panelEl.querySelector('#__sv_hide__').addEventListener('click', (e) => {
      e.stopPropagation();
      clearTimeout(hideTimer);
      hidePanel();
    });
    panelEl.querySelector('#__sv_prev__').addEventListener('click', () => {
      if (overlayIndex < overlayAnswers.length - 1) { overlayIndex++; renderPanel(); }
    });
    panelEl.querySelector('#__sv_next__').addEventListener('click', () => {
      if (overlayIndex > 0) { overlayIndex--; renderPanel(); }
    });

    // Ctrl+`：完全隱藏 / 恢復
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        stealthMode = !stealthMode;
        wrapEl.style.display = stealthMode ? 'none' : 'flex';
        if (stealthMode) { clearTimeout(hideTimer); hidePanel(); }
      }
    });
  }

  function showPanel() {
    if (!panelEl || !overlayAnswers.length) return;
    renderPanel();
    panelEl.style.display = 'block';
  }

  function hidePanel() {
    if (!panelEl) return;
    panelEl.style.display = 'none';
  }

  function renderPanel() {
    if (!panelEl || !overlayAnswers.length) return;
    const entry = overlayAnswers[overlayIndex];
    const answerText = typeof entry.answer === 'object' ? JSON.stringify(entry.answer) : String(entry.answer);
    const qEl = panelEl.querySelector('#__sv_q__');
    qEl.textContent = entry.question || '';
    qEl.style.display = entry.question ? 'block' : 'none';
    panelEl.querySelector('#__sv_a__').textContent = answerText;
    panelEl.querySelector('#__sv_counter__').textContent = `${overlayAnswers.length - overlayIndex} / ${overlayAnswers.length}`;
    panelEl.querySelector('#__sv_prev__').disabled = overlayIndex >= overlayAnswers.length - 1;
    panelEl.querySelector('#__sv_next__').disabled = overlayIndex <= 0;
  }

  function syncOverlay(answers) {
    overlayAnswers = answers;
    overlayIndex = 0;
    if (!wrapEl && answers.length) buildOverlay();
    if (wrapEl) wrapEl.style.display = stealthMode ? 'none' : 'flex';
  }

  function syncOverlayFromStorage() {
    chrome.storage.local.get({ answers: [] }, ({ answers }) => syncOverlay(answers));
  }

  if (document.body) {
    syncOverlayFromStorage();
  } else {
    document.addEventListener('DOMContentLoaded', syncOverlayFromStorage);
  }

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.answers) syncOverlay(changes.answers.newValue ?? []);
  });

  // ── 接收 MAIN world 擷取的答案並存入 storage ────────────────────────────
  document.addEventListener('__sv_answer__', (e) => {
    const entry = e.detail;
    chrome.storage.local.get({ answers: [] }, ({ answers }) => {
      answers.unshift(entry);
      if (answers.length > 200) answers.length = 200;
      chrome.storage.local.set({ answers });
    });
  });

  // ── 一次收到整份考卷的答案 ───────────────────────────────────────────────
  document.addEventListener('__sv_answers_batch__', (e) => {
    const { batch, url, timestamp } = e.detail;
    chrome.storage.local.get({ answers: [] }, ({ answers }) => {
      const entries = batch.map(b => ({ ...b, url, timestamp }));
      answers.unshift(...entries);
      if (answers.length > 200) answers.length = 200;
      chrome.storage.local.set({ answers });
    });
  });

  // ── 偵測模式：記錄所有 JSON 回應供分析 ──────────────────────────────────
  document.addEventListener('__sv_debug__', (e) => {
    chrome.storage.local.get({ debugMode: false, debugLogs: [] }, ({ debugMode, debugLogs }) => {
      if (!debugMode) return;
      const { url, data, timestamp } = e.detail;
      debugLogs.unshift({ url, data, timestamp });
      if (debugLogs.length > 50) debugLogs.length = 50;
      chrome.storage.local.set({ debugLogs });
    });
  });

  // ── document 屬性覆寫（document 為兩個 world 共用物件）────────────────
  const orig = {
    hidden:                Object.getOwnPropertyDescriptor(Document.prototype, 'hidden'),
    visibilityState:       Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState'),
    webkitHidden:          Object.getOwnPropertyDescriptor(Document.prototype, 'webkitHidden'),
    mozHidden:             Object.getOwnPropertyDescriptor(Document.prototype, 'mozHidden'),
    webkitVisibilityState: Object.getOwnPropertyDescriptor(Document.prototype, 'webkitVisibilityState'),
    mozVisibilityState:    Object.getOwnPropertyDescriptor(Document.prototype, 'mozVisibilityState'),
    fullscreenElement:     Object.getOwnPropertyDescriptor(Document.prototype, 'fullscreenElement'),
    webkitFullscreenElement: Object.getOwnPropertyDescriptor(Document.prototype, 'webkitFullscreenElement'),
    fullscreen:            Object.getOwnPropertyDescriptor(Document.prototype, 'fullscreen'),
    webkitIsFullScreen:    Object.getOwnPropertyDescriptor(Document.prototype, 'webkitIsFullScreen'),
    hasFocus:              Document.prototype.hasFocus,
  };

  function stopEvent(e) { e.stopImmediatePropagation(); }

  function apply() {
    Object.defineProperty(document, 'hidden',                { get: () => false,     configurable: true });
    Object.defineProperty(document, 'visibilityState',       { get: () => 'visible', configurable: true });
    Object.defineProperty(document, 'webkitHidden',          { get: () => false,     configurable: true });
    Object.defineProperty(document, 'mozHidden',             { get: () => false,     configurable: true });
    Object.defineProperty(document, 'webkitVisibilityState', { get: () => 'visible', configurable: true });
    Object.defineProperty(document, 'mozVisibilityState',    { get: () => 'visible', configurable: true });
    Object.defineProperty(document, 'fullscreenElement',     { get: () => document.documentElement, configurable: true });
    Object.defineProperty(document, 'webkitFullscreenElement', { get: () => document.documentElement, configurable: true });
    Object.defineProperty(document, 'fullscreen',            { get: () => true, configurable: true });
    Object.defineProperty(document, 'webkitIsFullScreen',    { get: () => true, configurable: true });
    Document.prototype.hasFocus = () => true;

    document.addEventListener('visibilitychange',       stopEvent, true);
    document.addEventListener('webkitvisibilitychange', stopEvent, true);
    document.addEventListener('mozvisibilitychange',    stopEvent, true);
    document.addEventListener('blur',                   stopEvent, true);
    document.addEventListener('fullscreenchange',       stopEvent, true);
    document.addEventListener('webkitfullscreenchange', stopEvent, true);
    document.addEventListener('mozfullscreenchange',    stopEvent, true);
    document.addEventListener('contextmenu',            stopEvent, true);
    document.addEventListener('copy',                   stopEvent, true);
    document.addEventListener('cut',                    stopEvent, true);
    document.addEventListener('paste',                  stopEvent, true);
    document.addEventListener('selectstart',            stopEvent, true);
    document.addEventListener('dragstart',              stopEvent, true);
  }

  function restore() {
    if (orig.hidden)                Object.defineProperty(document, 'hidden',                orig.hidden);
    if (orig.visibilityState)       Object.defineProperty(document, 'visibilityState',       orig.visibilityState);
    if (orig.webkitHidden)          Object.defineProperty(document, 'webkitHidden',          orig.webkitHidden);
    if (orig.mozHidden)             Object.defineProperty(document, 'mozHidden',             orig.mozHidden);
    if (orig.webkitVisibilityState) Object.defineProperty(document, 'webkitVisibilityState', orig.webkitVisibilityState);
    if (orig.mozVisibilityState)    Object.defineProperty(document, 'mozVisibilityState',    orig.mozVisibilityState);
    if (orig.fullscreenElement)     Object.defineProperty(document, 'fullscreenElement',     orig.fullscreenElement);
    if (orig.webkitFullscreenElement) Object.defineProperty(document, 'webkitFullscreenElement', orig.webkitFullscreenElement);
    if (orig.fullscreen)            Object.defineProperty(document, 'fullscreen',            orig.fullscreen);
    if (orig.webkitIsFullScreen)    Object.defineProperty(document, 'webkitIsFullScreen',    orig.webkitIsFullScreen);
    Document.prototype.hasFocus = orig.hasFocus;

    document.removeEventListener('visibilitychange',       stopEvent, true);
    document.removeEventListener('webkitvisibilitychange', stopEvent, true);
    document.removeEventListener('mozvisibilitychange',    stopEvent, true);
    document.removeEventListener('blur',                   stopEvent, true);
    document.removeEventListener('fullscreenchange',       stopEvent, true);
    document.removeEventListener('webkitfullscreenchange', stopEvent, true);
    document.removeEventListener('mozfullscreenchange',    stopEvent, true);
    document.removeEventListener('contextmenu',            stopEvent, true);
    document.removeEventListener('copy',                   stopEvent, true);
    document.removeEventListener('cut',                    stopEvent, true);
    document.removeEventListener('paste',                  stopEvent, true);
    document.removeEventListener('selectstart',            stopEvent, true);
    document.removeEventListener('dragstart',              stopEvent, true);
  }
})();
