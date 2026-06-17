// MAIN world — 攔截 window 層級事件 + 覆寫 addEventListener 防止偵測器被掛載
(() => {
  if (window.__sv_loaded) return;
  window.__sv_loaded = true;

  const WIN_BLOCK = new Set(['blur', 'pagehide', 'freeze']);
  const DOC_BLOCK = new Set(['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange']);

  let active = true;

  // 保存原始方法
  const _ael = EventTarget.prototype.addEventListener;
  const _rel = EventTarget.prototype.removeEventListener;

  // 覆寫 addEventListener：讓偵測相關事件完全無法被掛載
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (active) {
      if (this === window && WIN_BLOCK.has(type)) return;
      if (this === document && DOC_BLOCK.has(type)) return;
    }
    return _ael.call(this, type, fn, opts);
  };

  function sv_stop(e) { e.stopImmediatePropagation(); }
  function sv_ml(e) { if (!e.relatedTarget) e.stopImmediatePropagation(); }

  function apply() {
    active = true;
    _ael.call(window, 'blur', sv_stop, true);
    _ael.call(window, 'pagehide', sv_stop, true);
    _ael.call(document, 'freeze', sv_stop, true);
    _ael.call(document, 'mouseleave', sv_ml, true);
  }

  function restore() {
    active = false;
    _rel.call(window, 'blur', sv_stop, true);
    _rel.call(window, 'pagehide', sv_stop, true);
    _rel.call(document, 'freeze', sv_stop, true);
    _rel.call(document, 'mouseleave', sv_ml, true);
  }

  // 接收 isolated world 的開關訊號
  _ael.call(document, '__sv_toggle__', (e) => {
    e.detail.enabled ? apply() : restore();
  });

  apply();
})();
