// MAIN world — 攔截 window 層級事件 + 覆寫 addEventListener 防止偵測器被掛載
(() => {
  if (window.__sv_loaded) return;
  window.__sv_loaded = true;

  const WIN_BLOCK = new Set(['blur', 'pagehide', 'freeze']);
  const DOC_BLOCK = new Set(['visibilitychange', 'webkitvisibilitychange', 'mozvisibilitychange', 'fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'contextmenu', 'copy', 'cut', 'paste', 'selectstart', 'dragstart']);

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

  const _origHasFocus = Document.prototype.hasFocus;

  function apply() {
    active = true;
    _ael.call(window, 'blur', sv_stop, true);
    _ael.call(window, 'pagehide', sv_stop, true);
    _ael.call(document, 'freeze', sv_stop, true);
    _ael.call(document, 'mouseleave', sv_ml, true);
    Document.prototype.hasFocus = () => true;
  }

  function restore() {
    active = false;
    _rel.call(window, 'blur', sv_stop, true);
    _rel.call(window, 'pagehide', sv_stop, true);
    _rel.call(document, 'freeze', sv_stop, true);
    _rel.call(document, 'mouseleave', sv_ml, true);
    Document.prototype.hasFocus = _origHasFocus;
  }

  // 接收 isolated world 的開關訊號
  _ael.call(document, '__sv_toggle__', (e) => {
    e.detail.enabled ? apply() : restore();
  });

  apply();

  // ── 答案擷取：攔截 fetch / XHR 回應 ────────────────────────────────────
  const _origFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await _origFetch.apply(this, args);
    try {
      const url = typeof args[0] === 'string' ? args[0] : (args[0]?.url ?? '');
      const clone = response.clone();
      clone.json().then(data => tryEmitAnswer(url, data)).catch(() => {});
    } catch (_) {}
    return response;
  };

  const _origXHROpen = XMLHttpRequest.prototype.open;
  const _origXHRSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__sv_url = url;
    return _origXHROpen.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    _ael.call(this, 'load', function () {
      try {
        const data = JSON.parse(this.responseText);
        tryEmitAnswer(this.__sv_url || '', data);
      } catch (_) {}
    });
    return _origXHRSend.apply(this, args);
  };

  function extractAnswer(data) {
    if (!data || typeof data !== 'object') return null;

    // 常見答案欄位名稱（遞迴搜尋）
    const ANSWER_KEYS = ['correct_answer', 'correctAnswer', 'right_answer', 'answer_key', 'rightAnswer', 'right_key'];
    const CORRECT_KEYS = ['is_correct', 'isCorrect', 'correct', 'is_answer', 'isAnswer', 'is_right', 'isRight'];
    const QUESTION_KEYS = ['question', 'title', 'question_text', 'stem', 'content', 'description', 'body', 'text'];
    const OPTION_KEYS = ['options', 'choices', 'answers', 'selections', 'items'];

    function dig(obj, depth) {
      if (depth > 6 || !obj || typeof obj !== 'object') return null;
      const entries = Array.isArray(obj) ? obj.map((v, i) => [i, v]) : Object.entries(obj);
      for (const [k, v] of entries) {
        // 直接找正確答案欄位
        if (ANSWER_KEYS.includes(k) && v != null) {
          const questionText = findFirst(obj, QUESTION_KEYS);
          return { question: questionText, answer: v };
        }
        // 找選項列表中 is_correct: true 的那項
        if (OPTION_KEYS.includes(k) && Array.isArray(v)) {
          const correct = v.find(o => o && CORRECT_KEYS.some(ck => o[ck] === true));
          if (correct) {
            const answerText = correct.text ?? correct.content ?? correct.label ?? correct.title ?? JSON.stringify(correct);
            const questionText = findFirst(obj, QUESTION_KEYS);
            return { question: questionText, answer: answerText };
          }
        }
        if (typeof v === 'object') {
          const r = dig(v, depth + 1);
          if (r) return r;
        }
      }
      return null;
    }

    function findFirst(obj, keys) {
      for (const k of keys) {
        if (obj[k] && typeof obj[k] === 'string') return obj[k];
      }
      return null;
    }

    return dig(data, 0);
  }

  function tryExtractBatch(data) {
    // 嘗試從資料中找到題目陣列
    const candidates = [
      data?.subjects_data?.subjects,
      data?.subjects,
      data?.questions,
      data?.data?.subjects,
      data?.data?.questions,
      data?.result?.subjects,
      data?.result?.questions,
      data?.exam?.subjects,
      data?.exam?.questions,
      Array.isArray(data) ? data : null,
    ];

    for (const list of candidates) {
      if (!Array.isArray(list) || !list.length) continue;
      const batch = list.map(s => {
        const opts = s.options || s.choices || s.selections || s.items || [];
        const correctOpt = opts.find(o =>
          o.is_answer === true || o.is_correct === true || o.correct === true ||
          o.isAnswer === true || o.isCorrect === true || o.is_right === true
        );
        const questionText = stripHtml(
          s.description || s.question || s.stem || s.content || s.title || s.body || s.text || ''
        );
        const answerText = stripHtml(
          correctOpt?.content || correctOpt?.text || correctOpt?.label || correctOpt?.title ||
          s.correct_answer || s.correctAnswer || s.right_answer || s.answer_explanation || ''
        );
        return { question: questionText, answer: answerText };
      }).filter(e => e.answer);

      if (batch.length) return batch;
    }
    return null;
  }

  function tryEmitAnswer(url, data) {
    // 偵測模式：把所有 JSON 回應都記錄下來
    document.dispatchEvent(new CustomEvent('__sv_debug__', {
      detail: { url, data, timestamp: Date.now() }
    }));

    // Tronclass 考試相關 API（進行中或送出後）
    if (/\/api\/exams\//.test(url) || /\/exams\/\d+/.test(url)) {
      const batch = tryExtractBatch(data);
      if (batch && batch.length) {
        document.dispatchEvent(new CustomEvent('__sv_answers_batch__', {
          detail: { batch, url, timestamp: Date.now() }
        }));
        return;
      }
    }

    const result = extractAnswer(data);
    if (!result) return;
    document.dispatchEvent(new CustomEvent('__sv_answer__', {
      detail: { url, ...result, timestamp: Date.now() }
    }));
  }

  function stripHtml(html) {
    const d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent.trim();
  }
})();
