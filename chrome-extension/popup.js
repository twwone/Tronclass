let answers = [];
let index = 0; // 0 = 最新那筆

const toggleBtn  = document.getElementById('toggleBtn');
const noData     = document.getElementById('noData');
const dataView   = document.getElementById('dataView');
const questionEl = document.getElementById('questionText');
const answerEl   = document.getElementById('answerValue');
const nav        = document.getElementById('nav');
const prevBtn    = document.getElementById('prevBtn');
const nextBtn    = document.getElementById('nextBtn');
const counterEl  = document.getElementById('counter');
const clearBtn   = document.getElementById('clearBtn');

// ── 開關狀態 ─────────────────────────────────────────────────────────────
chrome.storage.local.get('enabled', ({ enabled }) => renderToggle(enabled !== false));
chrome.storage.onChanged.addListener((changes) => {
  if (changes.enabled) renderToggle(changes.enabled.newValue);
  if (changes.answers) {
    const wasEmpty = answers.length === 0;
    answers = changes.answers.newValue ?? [];
    if (wasEmpty || index === 0) index = 0; // 有新答案時自動跳到最新
    renderAnswer();
  }
});

toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get('enabled', ({ enabled }) => {
    const next = !(enabled !== false);
    chrome.storage.local.set({ enabled: next });
  });
});

function renderToggle(enabled) {
  toggleBtn.textContent = enabled ? '已啟用' : '已停用';
  toggleBtn.className = 'toggle-btn ' + (enabled ? 'on' : 'off');
}

// ── 答案顯示 ──────────────────────────────────────────────────────────────
chrome.storage.local.get({ answers: [] }, ({ answers: stored }) => {
  answers = stored;
  index = 0;
  renderAnswer();
});

function renderAnswer() {
  if (!answers.length) {
    noData.hidden = false;
    dataView.hidden = true;
    nav.hidden = true;
    return;
  }

  noData.hidden = true;
  dataView.hidden = false;
  nav.hidden = false;

  const entry = answers[index];
  const answerText = typeof entry.answer === 'object'
    ? JSON.stringify(entry.answer)
    : String(entry.answer);

  questionEl.textContent = entry.question ?? '';
  questionEl.hidden = !entry.question;
  answerEl.textContent = answerText;

  counterEl.textContent = `${answers.length - index} / ${answers.length}`;
  prevBtn.disabled = index >= answers.length - 1; // 往舊的
  nextBtn.disabled = index <= 0;                  // 往新的
}

prevBtn.addEventListener('click', () => {
  if (index < answers.length - 1) { index++; renderAnswer(); }
});
nextBtn.addEventListener('click', () => {
  if (index > 0) { index--; renderAnswer(); }
});

clearBtn.addEventListener('click', () => {
  chrome.storage.local.set({ answers: [] });
  answers = [];
  index = 0;
  renderAnswer();
});

// ── 偵測模式 ─────────────────────────────────────────────────────────────
const debugToggle = document.getElementById('debugToggle');
const debugBar    = document.getElementById('debugBar');
const exportBtn   = document.getElementById('exportBtn');

chrome.storage.local.get({ debugMode: false, debugLogs: [] }, ({ debugMode, debugLogs }) => {
  debugToggle.checked = debugMode;
  debugBar.classList.toggle('active', debugMode);
  exportBtn.hidden = debugLogs.length === 0;
});

debugToggle.addEventListener('change', () => {
  const on = debugToggle.checked;
  chrome.storage.local.set({ debugMode: on, debugLogs: [] });
  debugBar.classList.toggle('active', on);
  exportBtn.hidden = true;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.debugLogs) {
    exportBtn.hidden = (changes.debugLogs.newValue ?? []).length === 0;
  }
});

exportBtn.addEventListener('click', () => {
  chrome.storage.local.get({ debugLogs: [] }, ({ debugLogs }) => {
    const blob = new Blob([JSON.stringify(debugLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tronclass-debug-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
});
