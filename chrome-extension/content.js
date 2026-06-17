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

  const originalHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden');
  const originalVisibilityState = Object.getOwnPropertyDescriptor(Document.prototype, 'visibilityState');

  function apply() {
    Object.defineProperty(document, 'hidden', {
      get: () => false,
      configurable: true,
    });
    Object.defineProperty(document, 'visibilityState', {
      get: () => 'visible',
      configurable: true,
    });

    document.addEventListener('visibilitychange', stopEvent, true);
    window.addEventListener('blur', stopEvent, true);
    window.addEventListener('pagehide', stopEvent, true);
  }

  function restore() {
    if (originalHidden) Object.defineProperty(document, 'hidden', originalHidden);
    if (originalVisibilityState) Object.defineProperty(document, 'visibilityState', originalVisibilityState);

    document.removeEventListener('visibilitychange', stopEvent, true);
    window.removeEventListener('blur', stopEvent, true);
    window.removeEventListener('pagehide', stopEvent, true);
  }

  function stopEvent(e) {
    e.stopImmediatePropagation();
  }
})();
