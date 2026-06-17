const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');

chrome.storage.local.get('enabled', (result) => {
  const enabled = result.enabled !== false;
  render(enabled);
});

toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get('enabled', (result) => {
    const current = result.enabled !== false;
    chrome.storage.local.set({ enabled: !current }, () => render(!current));
  });
});

function render(enabled) {
  statusEl.textContent = enabled ? '已啟用 ✅' : '已停用 ❌';
  toggleBtn.textContent = enabled ? '點我停用' : '點我啟用';
  toggleBtn.className = enabled ? 'on' : 'off';
}
