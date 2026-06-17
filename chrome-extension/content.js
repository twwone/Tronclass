(() => {
  let enabled = true;

  chrome.storage.local.get('enabled', (result) => {
    enabled = result.enabled !== false;
    if (enabled) apply();
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.enabled) {
      enabled = changes.enabled.newValue;
      enabled ? apply() : restore();
    }
  });

  // 儲存原始值，停用時還原
  const orig = {
    hidden:                  Object.getOwnPropertyDescriptor(Document.prototype, 'hidden'),
    visibilityState:         Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState'),
    webkitHidden:            Object.getOwnPropertyDescriptor(Document.prototype, 'webkitHidden'),
    mozHidden:               Object.getOwnPropertyDescriptor(Document.prototype, 'mozHidden'),
    webkitVisibilityState:   Object.getOwnPropertyDescriptor(Document.prototype, 'webkitVisibilityState'),
    mozVisibilityState:      Object.getOwnPropertyDescriptor(Document.prototype, 'mozVisibilityState'),
    hasFocus:                Document.prototype.hasFocus,
  };

  function stopEvent(e) {
    e.stopImmediatePropagation();
  }

  // 只攔截滑鼠真正離開瀏覽器視窗的 mouseleave（relatedTarget 為 null）
  function stopMouseLeave(e) {
    if (!e.relatedTarget) e.stopImmediatePropagation();
  }

  function apply() {
    // ── Page Visibility API ──────────────────────────────
    Object.defineProperty(document, 'hidden',                { get: () => false,      configurable: true });
    Object.defineProperty(document, 'visibilityState',       { get: () => 'visible',  configurable: true });

    // 廠商前綴（舊版 Chrome / Firefox）
    Object.defineProperty(document, 'webkitHidden',          { get: () => false,      configurable: true });
    Object.defineProperty(document, 'mozHidden',             { get: () => false,      configurable: true });
    Object.defineProperty(document, 'webkitVisibilityState', { get: () => 'visible',  configurable: true });
    Object.defineProperty(document, 'mozVisibilityState',    { get: () => 'visible',  configurable: true });

    // hasFocus() 永遠回傳 true
    Document.prototype.hasFocus = () => true;

    // ── 事件攔截（捕獲階段，比網頁程式碼更早執行）────────
    document.addEventListener('visibilitychange',       stopEvent,       true);
    document.addEventListener('webkitvisibilitychange', stopEvent,       true);
    document.addEventListener('mozvisibilitychange',    stopEvent,       true);
    window.addEventListener  ('blur',                   stopEvent,       true);
    document.addEventListener('blur',                   stopEvent,       true);
    window.addEventListener  ('pagehide',               stopEvent,       true);
    document.addEventListener('freeze',                 stopEvent,       true); // 分頁被瀏覽器凍結
    document.addEventListener('mouseleave',             stopMouseLeave,  true); // 滑鼠移出視窗
  }

  function restore() {
    // 還原 API
    if (orig.hidden)                Object.defineProperty(document, 'hidden',                orig.hidden);
    if (orig.visibilityState)       Object.defineProperty(document, 'visibilityState',       orig.visibilityState);
    if (orig.webkitHidden)          Object.defineProperty(document, 'webkitHidden',          orig.webkitHidden);
    if (orig.mozHidden)             Object.defineProperty(document, 'mozHidden',             orig.mozHidden);
    if (orig.webkitVisibilityState) Object.defineProperty(document, 'webkitVisibilityState', orig.webkitVisibilityState);
    if (orig.mozVisibilityState)    Object.defineProperty(document, 'mozVisibilityState',    orig.mozVisibilityState);
    Document.prototype.hasFocus = orig.hasFocus;

    // 移除事件監聽
    document.removeEventListener('visibilitychange',       stopEvent,      true);
    document.removeEventListener('webkitvisibilitychange', stopEvent,      true);
    document.removeEventListener('mozvisibilitychange',    stopEvent,      true);
    window.removeEventListener  ('blur',                   stopEvent,      true);
    document.removeEventListener('blur',                   stopEvent,      true);
    window.removeEventListener  ('pagehide',               stopEvent,      true);
    document.removeEventListener('freeze',                 stopEvent,      true);
    document.removeEventListener('mouseleave',             stopMouseLeave, true);
  }
})();
