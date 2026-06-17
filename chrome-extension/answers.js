const listEl = document.getElementById('list');
const emptyEl = document.getElementById('empty');

function render(answers) {
  listEl.innerHTML = '';
  if (!answers.length) {
    emptyEl.hidden = false;
    return;
  }
  emptyEl.hidden = true;
  for (const entry of answers) {
    const card = document.createElement('div');
    card.className = 'card';

    const answerText = typeof entry.answer === 'object'
      ? JSON.stringify(entry.answer)
      : String(entry.answer);

    card.innerHTML = `
      ${entry.question ? `<div class="q">題目：${escHtml(entry.question)}</div>` : ''}
      <div class="a">✅ 正確答案：${escHtml(answerText)}</div>
      <div class="meta">${new Date(entry.timestamp).toLocaleString()} &nbsp;|&nbsp; ${escHtml(entry.url)}</div>
    `;
    listEl.appendChild(card);
  }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

chrome.storage.local.get({ answers: [] }, ({ answers }) => render(answers));

chrome.storage.onChanged.addListener((changes) => {
  if (changes.answers) render(changes.answers.newValue ?? []);
});

document.getElementById('clearBtn').addEventListener('click', () => {
  chrome.storage.local.set({ answers: [] });
});
