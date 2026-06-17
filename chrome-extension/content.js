// ISOLATED world — document 屬性覆寫 + chrome.storage + 注入 MAIN world 備援腳本
(() => {
  // ── 注入備援腳本到 MAIN world（透過 <script> 標籤，確保在頁面 JS 之前執行）──
  // 若 "world":"MAIN" 的 content-main.js 已執行則跳過（靠 window.__sv_loaded 旗標判斷）
  try {
    const s = document.createElement('script');
    s.textContent = `(function(){
if(window.__sv_loaded)return;
window.__sv_loaded=true;
var WB=["blur","pagehide","freeze"],DB=["visibilitychange","webkitvisibilitychange","mozvisibilitychange"];
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

  // ── document 屬性覆寫（document 為兩個 world 共用物件）────────────────
  const orig = {
    hidden:                Object.getOwnPropertyDescriptor(Document.prototype, 'hidden'),
    visibilityState:       Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState'),
    webkitHidden:          Object.getOwnPropertyDescriptor(Document.prototype, 'webkitHidden'),
    mozHidden:             Object.getOwnPropertyDescriptor(Document.prototype, 'mozHidden'),
    webkitVisibilityState: Object.getOwnPropertyDescriptor(Document.prototype, 'webkitVisibilityState'),
    mozVisibilityState:    Object.getOwnPropertyDescriptor(Document.prototype, 'mozVisibilityState'),
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
    Document.prototype.hasFocus = () => true;

    document.addEventListener('visibilitychange',       stopEvent, true);
    document.addEventListener('webkitvisibilitychange', stopEvent, true);
    document.addEventListener('mozvisibilitychange',    stopEvent, true);
    document.addEventListener('blur',                   stopEvent, true);
  }

  function restore() {
    if (orig.hidden)                Object.defineProperty(document, 'hidden',                orig.hidden);
    if (orig.visibilityState)       Object.defineProperty(document, 'visibilityState',       orig.visibilityState);
    if (orig.webkitHidden)          Object.defineProperty(document, 'webkitHidden',          orig.webkitHidden);
    if (orig.mozHidden)             Object.defineProperty(document, 'mozHidden',             orig.mozHidden);
    if (orig.webkitVisibilityState) Object.defineProperty(document, 'webkitVisibilityState', orig.webkitVisibilityState);
    if (orig.mozVisibilityState)    Object.defineProperty(document, 'mozVisibilityState',    orig.mozVisibilityState);
    Document.prototype.hasFocus = orig.hasFocus;

    document.removeEventListener('visibilitychange',       stopEvent, true);
    document.removeEventListener('webkitvisibilitychange', stopEvent, true);
    document.removeEventListener('mozvisibilitychange',    stopEvent, true);
    document.removeEventListener('blur',                   stopEvent, true);
  }
})();
