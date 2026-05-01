'use strict';

// ============================================================
// Quiz state
// ============================================================
const quiz = {
  difficulty: null,
  queue: [],
  idx: 0,
  results: [],
  selectedPat: new Set(),
  selectedDS:  new Set(),
  answered: false
};

const QUIZ_LENGTH = 10;

// ============================================================
// Entry point — called once from renderAll()
// ============================================================
function renderQuiz() {
  const panel = document.getElementById('panel-quiz');
  panel.innerHTML = `<div class="quiz-wrap" id="quiz-wrap"></div>`;
  showQuizStart();
}

// ============================================================
// Start screen
// ============================================================
function showQuizStart() {
  const allAcc      = loadAllAccuracy();
  const totalPlayed = Object.values(allAcc).reduce((s, a) => s + a.total, 0);
  const totalCorrect= Object.values(allAcc).reduce((s, a) => s + a.correct, 0);

  document.getElementById('quiz-wrap').innerHTML = `
    <div class="quiz-start">
      <h2>Pattern Quiz</h2>
      <p>See a problem — identify the pattern and data structure.<br>
         Single-select for Easy/Medium. Multi-select for Hard.</p>
      <div class="difficulty-grid">
        <button class="diff-btn" data-diff="Easy">Easy</button>
        <button class="diff-btn" data-diff="Medium">Medium</button>
        <button class="diff-btn" data-diff="Hard">Hard</button>
        <button class="diff-btn" data-diff="Mixed">Mixed</button>
      </div>
      <div class="quiz-stats-bar">
        <div>All-time: <span>${totalCorrect}/${totalPlayed}</span> correct</div>
        <div>Patterns tracked: <span>${Object.keys(allAcc).length}</span></div>
      </div>
    </div>`;

  document.getElementById('quiz-wrap').querySelectorAll('.diff-btn').forEach(btn =>
    btn.addEventListener('click', () => startQuiz(btn.dataset.diff))
  );
}

// ============================================================
// Session setup
// ============================================================
function startQuiz(difficulty) {
  quiz.difficulty = difficulty;
  quiz.results    = [];
  quiz.idx        = 0;

  const pool = data.problems.problems.filter(p =>
    difficulty === 'Mixed' || p.difficulty === difficulty
  );

  if (!pool.length) {
    document.getElementById('quiz-wrap').innerHTML =
      `<div style="padding:40px;text-align:center;color:var(--text-dim)">No problems for this difficulty yet.</div>`;
    return;
  }

  quiz.queue = shuffle([...pool]).slice(0, QUIZ_LENGTH);
  showQuestion();
}

// ============================================================
// Question screen
// ============================================================
function showQuestion() {
  if (quiz.idx >= quiz.queue.length) { showSummary(); return; }

  quiz.selectedPat.clear();
  quiz.selectedDS.clear();
  quiz.answered = false;

  const prob    = quiz.queue[quiz.idx];
  const isHard  = prob.difficulty === 'Hard';
  const hint    = isHard ? '(multi-select)' : '(pick one)';
  const progress= Math.round((quiz.idx / quiz.queue.length) * 100);

  const patChips = data.patterns.patterns.map(p =>
    `<button class="sel-chip" data-pid="${p.id}">${escHtml(p.name)}</button>`
  ).join('');

  const dsChips = data.ds.structures.map(s =>
    `<button class="sel-chip" data-dsid="${s.id}">${escHtml(s.name)}</button>`
  ).join('');

  document.getElementById('quiz-wrap').innerHTML = `
    ${progressBar(quiz.idx, quiz.queue.length, quiz.difficulty)}

    <div class="quiz-problem-card">
      <div class="problem-meta">
        <span class="diff-badge diff-${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
        ${prob.leetcode_num ? `<span class="lc-num">LC ${prob.leetcode_num}</span>` : ''}
      </div>
      <div class="problem-name">${escHtml(prob.name)}</div>
    </div>

    ${prob.patterns.length > 0 ? `
    <div style="margin-bottom:22px">
      <div class="quiz-section-label">Which pattern(s)? <span class="quiz-section-hint">${hint}</span></div>
      <div class="selector-grid" id="pat-selector">${patChips}</div>
    </div>` : ''}

    <div style="margin-bottom:22px">
      <div class="quiz-section-label">Which data structure(s)? <span class="quiz-section-hint">${hint}</span></div>
      <div class="selector-grid" id="ds-selector">${dsChips}</div>
    </div>

    <button class="quiz-submit-btn" id="quiz-submit-btn" disabled>Check Answer</button>`;

  wireQuizQuestion(prob, isHard);
}

function wireQuizQuestion(prob, isHard) {
  const submitBtn = document.getElementById('quiz-submit-btn');
  const updateSubmit = () => {
    const patOk = prob.patterns.length === 0 || quiz.selectedPat.size > 0;
    submitBtn.disabled = !(patOk && quiz.selectedDS.size > 0);
  };

  const patSel = document.getElementById('pat-selector');
  if (patSel) {
    patSel.querySelectorAll('.sel-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (!isHard) { patSel.querySelectorAll('.sel-chip').forEach(c => c.classList.remove('selected')); quiz.selectedPat.clear(); }
        if (quiz.selectedPat.has(chip.dataset.pid)) {
          quiz.selectedPat.delete(chip.dataset.pid); chip.classList.remove('selected');
        } else {
          quiz.selectedPat.add(chip.dataset.pid); chip.classList.add('selected');
        }
        updateSubmit();
      });
    });
  }

  const dsSel = document.getElementById('ds-selector');
  dsSel.querySelectorAll('.sel-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      if (!isHard) { dsSel.querySelectorAll('.sel-chip').forEach(c => { c.classList.remove('selected','selected-ds'); }); quiz.selectedDS.clear(); }
      if (quiz.selectedDS.has(chip.dataset.dsid)) {
        quiz.selectedDS.delete(chip.dataset.dsid); chip.classList.remove('selected-ds');
      } else {
        quiz.selectedDS.add(chip.dataset.dsid); chip.classList.add('selected-ds');
      }
      updateSubmit();
    });
  });

  submitBtn.addEventListener('click', () => showResult(prob, isHard));
}

// ============================================================
// Result screen
// ============================================================
function showResult(prob, isHard) {
  const correctPats = new Set(prob.patterns);
  const correctDS   = new Set(prob.structures);

  const patCorrect = correctPats.size === 0 ? true
    : isHard ? [...correctPats].every(p => quiz.selectedPat.has(p))
    : quiz.selectedPat.size > 0 && correctPats.has([...quiz.selectedPat][0]);

  const dsCorrect = isHard
    ? [...correctDS].every(d => quiz.selectedDS.has(d))
    : quiz.selectedDS.size > 0 && correctDS.has([...quiz.selectedDS][0]);

  const fullyCorrect = patCorrect && dsCorrect;
  const partial      = !fullyCorrect && (patCorrect || dsCorrect);

  quiz.results.push({ prob, fullyCorrect, partial, patCorrect, dsCorrect });

  prob.patterns.forEach(pid => {
    const key = `quiz-acc:${pid}`;
    const acc = JSON.parse(localStorage.getItem(key) || '{"correct":0,"total":0}');
    acc.total++;
    if (fullyCorrect) acc.correct++;
    localStorage.setItem(key, JSON.stringify(acc));
  });

  let verdictClass, verdictText;
  if (fullyCorrect) { verdictClass = 'verdict-correct'; verdictText = '✓ Correct'; }
  else if (partial) { verdictClass = 'verdict-partial';  verdictText = '◑ Partial'; }
  else              { verdictClass = 'verdict-wrong';    verdictText = '✗ Wrong'; }

  const patAnswerHtml = prob.patterns.length === 0
    ? `<span class="tag" style="color:var(--text-dim)">Design problem — no single pattern</span>`
    : prob.patterns.map(pid => {
        const p = data.patternById[pid];
        return `<span class="tag tag-link" data-goto="pattern" data-goto-id="${pid}" title="Jump to ${p ? p.name : pid} in Patterns tab">${p ? p.name : pid}</span>`;
      }).join('');

  const dsAnswerHtml = prob.structures.map(did => {
    const ds = data.dsById[did];
    return `<span class="tag tag-ds tag-link" data-goto="ds" data-goto-id="${did}" title="Jump to ${ds ? ds.name : did} in Data Structures tab">${ds ? ds.name : did}</span>`;
  }).join('') || `<span class="tag" style="color:var(--text-dim)">—</span>`;

  document.getElementById('quiz-wrap').innerHTML = `
    ${progressBar(quiz.idx + 1, quiz.queue.length, quiz.difficulty)}

    <div class="quiz-problem-card">
      <div class="problem-meta">
        <span class="diff-badge diff-${prob.difficulty.toLowerCase()}">${prob.difficulty}</span>
        ${prob.leetcode_num ? `<span class="lc-num">LC ${prob.leetcode_num}</span>` : ''}
      </div>
      <div class="problem-name">${escHtml(prob.name)}</div>
    </div>

    <div class="quiz-result">
      <div class="result-verdict ${verdictClass}">${verdictText}</div>
      <div class="result-row"><div class="result-row-label">Pattern</div><div class="tag-row">${patAnswerHtml}</div></div>
      <div class="result-row"><div class="result-row-label">DS</div><div class="tag-row">${dsAnswerHtml}</div></div>
      <div class="result-explanation">${escHtml(prob.blurb ? prob.blurb.trim() : '')}</div>
    </div>

    <button class="quiz-next-btn" id="quiz-next-btn">
      ${quiz.idx + 1 >= quiz.queue.length ? 'See Summary →' : 'Next Question →'}
    </button>`;

  document.getElementById('quiz-wrap').querySelectorAll('[data-goto]').forEach(el =>
    el.addEventListener('click', () => gotoItem(el.dataset.goto, el.dataset.gotoId))
  );
  document.getElementById('quiz-next-btn').addEventListener('click', () => { quiz.idx++; showQuestion(); });
}

// ============================================================
// Summary screen
// ============================================================
function showSummary() {
  const total   = quiz.results.length;
  const correct = quiz.results.filter(r => r.fullyCorrect).length;
  const partial = quiz.results.filter(r => r.partial).length;
  const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;

  const sessionAcc = {};
  quiz.results.forEach(r => {
    r.prob.patterns.forEach(pid => {
      if (!sessionAcc[pid]) sessionAcc[pid] = { correct: 0, total: 0, name: data.patternById[pid]?.name || pid };
      sessionAcc[pid].total++;
      if (r.fullyCorrect) sessionAcc[pid].correct++;
    });
  });

  const allAcc = loadAllAccuracy();
  const weak   = Object.entries(allAcc)
    .filter(([, a]) => a.total >= 2 && (a.correct / a.total) < 0.6)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
    .slice(0, 5);

  const sessionRows = Object.entries(sessionAcc)
    .sort((a, b) => (a[1].correct / a[1].total) - (b[1].correct / b[1].total))
    .map(([, a]) => accuracyRow(a.name, a.correct, a.total)).join('');

  const weakRows = weak.length
    ? weak.map(([pid, a]) => {
        const p   = data.patternById[pid];
        const pct = Math.round((a.correct / a.total) * 100);
        return `<div class="summary-pat-row">
          <div class="summary-pat-name">
            <span class="tag-link" data-goto="pattern" data-goto-id="${pid}" style="cursor:pointer;color:var(--primary)">${escHtml(p?.name || pid)} ↗</span>
          </div>
          <div class="summary-pat-bar-wrap"><div class="summary-pat-bar bar-weak" style="width:${pct}%"></div></div>
          <div class="summary-pat-score" style="color:var(--accent-warn)">${a.correct}/${a.total} all-time</div>
        </div>`;
      }).join('')
    : `<div style="color:var(--text-dim);font-size:0.85rem;padding:8px 0">Not enough data yet — play more rounds.</div>`;

  document.getElementById('quiz-wrap').innerHTML = `
    <div class="quiz-summary">
      <h2>Session Complete</h2>
      <div class="quiz-summary-sub">${quiz.difficulty} · ${total} questions</div>
      <div class="summary-score-block">
        <div class="summary-score-num">${pct}%</div>
        <div class="summary-score-label">${correct} correct · ${partial} partial · ${total - correct - partial} wrong</div>
      </div>
      ${sessionRows ? `<div class="summary-section-title">This Session — by Pattern</div>
        <div class="summary-pattern-list">${sessionRows}</div>` : ''}
      <div class="summary-section-title">All-Time Weak Spots</div>
      <div class="summary-pattern-list">${weakRows}</div>
      <button class="quiz-restart-btn" id="quiz-restart-btn">Start Another Round</button>
    </div>`;

  document.getElementById('quiz-restart-btn').addEventListener('click', showQuizStart);
  document.getElementById('quiz-wrap').querySelectorAll('[data-goto]').forEach(el =>
    el.addEventListener('click', () => gotoItem(el.dataset.goto, el.dataset.gotoId))
  );
}

// ============================================================
// Shared helpers
// ============================================================
function progressBar(current, total, label) {
  const pct = Math.round((current / total) * 100);
  return `<div class="quiz-progress-wrap">
    <div class="quiz-progress-label"><span>Question ${current} of ${total}</span><span>${label}</span></div>
    <div class="quiz-progress-track"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
  </div>`;
}

function accuracyRow(name, correct, total) {
  const pct      = total > 0 ? Math.round((correct / total) * 100) : 0;
  const barClass = pct >= 80 ? 'bar-good' : pct >= 50 ? 'bar-mid' : 'bar-weak';
  const color    = pct >= 80 ? 'var(--secondary)' : pct >= 50 ? 'var(--primary)' : 'var(--accent-warn)';
  return `<div class="summary-pat-row">
    <div class="summary-pat-name">${escHtml(name)}</div>
    <div class="summary-pat-bar-wrap"><div class="summary-pat-bar ${barClass}" style="width:${pct}%"></div></div>
    <div class="summary-pat-score" style="color:${color}">${correct}/${total}</div>
  </div>`;
}
