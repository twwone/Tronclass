const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');
const answersBtn = document.getElementById('answersBtn');
const answerCountEl = document.getElementById('answerCount');

answersBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('answers.html') });
});

function updateAnswerCount() {
  chrome.storage.local.get({ answers: [] }, ({ answers }) => {
    answerCountEl.textContent = answers.length
      ? `已擷取 ${answers.length} 筆答案`
      : '尚無擷取到的答案';
  });
}

updateAnswerCount();
chrome.storage.onChanged.addListener((changes) => {
  if (changes.answers) updateAnswerCount();
});

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
