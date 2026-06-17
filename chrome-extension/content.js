// ISOLATED world — document 屬性覆寫 + chrome.storage + 注入 MAIN world 備援腳本
(() => {
  // ── 注入備援腳本到 MAIN world（透過 <script> 標籤，確保在頁面 JS 之前執行）──
  // 若 "world":"MAIN" 的 content-main.js 已執行則跳過（靠 window.__sv_loaded 旗標判斷）
  try {
    const s = document.createElement('script');
    s.textContent = `(function(){
if(window.__sv_loaded)return;
window.__sv_loaded=true;
var WB=["blur","pagehide","freeze"],DB=["visibilitychange","webkitvisibilitychange","mozvisibilitychange","fullscreenchange","webkitfullscreenchange","mozfullscreenchange"];
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
  }
})();
