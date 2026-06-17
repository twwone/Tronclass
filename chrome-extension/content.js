// ISOLATED world — 處理 document 屬性覆寫、document 事件、chrome.storage
(() => {
  let enabled = true;

  chrome.storage.local.get('enabled', (result) => {
    enabled = result.enabled !== false;
    enabled ? apply() : restore();
    // 同步狀態給 MAIN world（content-main.js）
    document.dispatchEvent(new CustomEvent('__sv_toggle__', { detail: { enabled } }));
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      enabled = changes.enabled.newValue;
      enabled ? apply() : restore();
      document.dispatchEvent(new CustomEvent('__sv_toggle__', { detail: { enabled } }));
    }
  });

  // 儲存原始描述符，停用時還原
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
    // ── document 屬性覆寫（document 為 isolated/main world 共用物件）──
    Object.defineProperty(document, 'hidden',                { get: () => false,     configurable: true });
    Object.defineProperty(document, 'visibilityState',       { get: () => 'visible', configurable: true });
    Object.defineProperty(document, 'webkitHidden',          { get: () => false,     configurable: true });
    Object.defineProperty(document, 'mozHidden',             { get: () => false,     configurable: true });
    Object.defineProperty(document, 'webkitVisibilityState', { get: () => 'visible', configurable: true });
    Object.defineProperty(document, 'mozVisibilityState',    { get: () => 'visible', configurable: true });

    // hasFocus() 永遠回傳 true
    Document.prototype.hasFocus = () => true;

    // ── document 事件（在 isolated world 攔截即可生效）────────────────
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
