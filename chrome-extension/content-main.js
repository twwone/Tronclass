// MAIN world — 處理 window 層級事件
// 與 content.js（isolated world）透過 document CustomEvent 溝通
(() => {
  function stopEvent(e) { e.stopImmediatePropagation(); }
  function stopMouseLeave(e) { if (!e.relatedTarget) e.stopImmediatePropagation(); }

  function apply() {
    window.addEventListener('blur',         stopEvent,       true);
    window.addEventListener('pagehide',     stopEvent,       true);
    document.addEventListener('freeze',     stopEvent,       true);
    document.addEventListener('mouseleave', stopMouseLeave,  true);
  }

  function restore() {
    window.removeEventListener('blur',         stopEvent,       true);
    window.removeEventListener('pagehide',     stopEvent,       true);
    document.removeEventListener('freeze',     stopEvent,       true);
    document.removeEventListener('mouseleave', stopMouseLeave,  true);
  }

  // 接收 isolated world 的開關訊號
  document.addEventListener('__sv_toggle__', (e) => {
    e.detail.enabled ? apply() : restore();
  });

  // 預設啟用，等 isolated world 讀取 storage 後若需要關閉會發訊號
  apply();
})();
