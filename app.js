'use strict';

// ============================================================
// State
// ============================================================
const state = {
  tab: 'ds',
  search: '',
  studyMode: true,
  dailyScan: false,
  filters: {
    ds:       { category: null, tier: null, confidence: null },
    patterns: { category: null, tier: null, confidence: null },
    cues:     { confidence: null },
    algo:     { category: null, tier: null },
    pairings: {}, senior: {}, java: {}, dash: {}, quiz: {}
  }
};

let data = {};

// ============================================================
// Bootstrap
// ============================================================
async function init() {
  try {
    const [dsRaw, patternsRaw, cuesRaw, pairingsRaw, problemsRaw, algoRaw, snipRaw] = await Promise.all([
      fetchYaml('data-structures.yaml'),
      fetchYaml('patterns.yaml'),
      fetchYaml('recognition-cues.yaml'),
      fetchYaml('pairings.yaml'),
      fetchYaml('problems.yaml'),
      fetchYaml('algorithms.yaml'),
      fetchYaml('java-snippets.yaml')
    ]);

    data.ds         = dsRaw;
    data.patterns   = patternsRaw;
    data.cues       = cuesRaw;
    data.pairings   = pairingsRaw;
    data.problems   = problemsRaw;
    data.algorithms = algoRaw;
    data.snippets   = snipRaw.snippets || {};

    data.dsById      = {};
    data.patternById = {};
    data.ds.structures.forEach(s  => { data.dsById[s.id]      = s; });
    data.patterns.patterns.forEach(p => { data.patternById[p.id] = p; });

    renderAll();
    wireEvents();
    document.getElementById('loading').style.display = 'none';
  } catch (err) {
    document.getElementById('loading').innerHTML =
      `<div style="color:#ff6b35;font-family:monospace;padding:40px;text-align:center">
        <div style="font-size:1rem;margin-bottom:12px">Failed to load YAML data</div>
        <div style="font-size:0.8rem;color:#888">${escHtml(err.message)}</div>
        <div style="font-size:0.75rem;color:#555;margin-top:16px">
          Run: <code style="color:#f0e040">python3 -m http.server 8000</code>
        </div>
      </div>`;
  }
}

async function fetchYaml(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return jsyaml.load(await res.text());
}

// ============================================================
// Render all static tabs
// ============================================================
function renderAll() {
  renderDS();
  renderPatterns();
  renderCues();
  renderPairings();
  renderSenior();
  renderAlgorithms();
  renderJava();
  renderQuiz();
  updateFilterBar();
}

// ============================================================
// Filter bar
// ============================================================
function updateFilterBar() {
  const bar = document.getElementById('filter-bar');
  const tab = state.tab;
  let html  = '';

  if (tab === 'ds') {
    html += filterLabel('Category');
    [...data.ds.categories].sort((a, b) => a.order - b.order).forEach(cat =>
      html += filterChip('ds-cat', cat.id, cat.name, state.filters.ds.category === cat.id)
    );
    html += `<div class="filter-divider"></div>`;
    html += filterLabel('Complexity') + tierChipHtml('ds-tier', state.filters.ds.tier);
    html += `<div class="filter-divider"></div>` + confChipHtml('ds-conf', state.filters.ds.confidence);

  } else if (tab === 'patterns') {
    html += filterLabel('Category');
    [...data.patterns.categories].sort((a, b) => a.order - b.order).forEach(cat =>
      html += filterChip('pat-cat', cat.id, cat.name, state.filters.patterns.category === cat.id)
    );
    html += `<div class="filter-divider"></div>`;
    html += filterLabel('Time') + tierChipHtml('pat-tier', state.filters.patterns.tier);
    html += `<div class="filter-divider"></div>` + confChipHtml('pat-conf', state.filters.patterns.confidence);

  } else if (tab === 'cues') {
    html += confChipHtml('cue-conf', state.filters.cues.confidence);

  } else if (tab === 'algo') {
    html += filterLabel('Category');
    [...data.algorithms.categories].sort((a, b) => a.order - b.order).forEach(cat =>
      html += filterChip('algo-cat', cat.id, cat.name, state.filters.algo.category === cat.id)
    );
    html += `<div class="filter-divider"></div>`;
    html += filterLabel('Worst-Case') + tierChipHtml('algo-tier', state.filters.algo.tier);
  }

  bar.innerHTML = html;
}

// ============================================================
// Event wiring
// ============================================================
function wireEvents() {
  document.getElementById('tab-buttons').addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (btn) switchTab(btn.dataset.tab);
  });

  document.getElementById('search-input').addEventListener('input', e => {
    state.search = e.target.value.toLowerCase().trim();
    applyFilters();
  });

  document.getElementById('study-btn').addEventListener('click', () => setMode(true));
  document.getElementById('scan-btn').addEventListener('click',  () => setMode(false));

  document.getElementById('daily-scan-btn').addEventListener('click', () => {
    state.dailyScan = !state.dailyScan;
    document.getElementById('daily-scan-btn').classList.toggle('active', state.dailyScan);
    applyFilters();
  });

  document.getElementById('filter-bar').addEventListener('click', e => {
    const chip = e.target.closest('[data-fkey]');
    if (chip) handleFilter(chip.dataset.fkey, chip.dataset.fval);
  });

  document.getElementById('main-content').addEventListener('click', e => {
    const dot = e.target.closest('.conf-dot');
    if (dot) {
      e.stopPropagation();
      const next = cycleConf(dot.dataset.ctype, dot.dataset.cid);
      dot.className = `conf-dot conf-${next}`;
      dot.title = confTitle(next);
      applyFilters();
      return;
    }
    const gotoEl = e.target.closest('[data-goto]');
    if (gotoEl) { e.stopPropagation(); gotoItem(gotoEl.dataset.goto, gotoEl.dataset.gotoId); return; }
    if (!state.studyMode) return;
    const row = e.target.closest('tr.data-row');
    if (row) toggleExpand(row.dataset.rtype, row.dataset.id, row);
  });
}

// ============================================================
// Tab switching
// ============================================================
function switchTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.tab-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
  document.querySelectorAll('.tab-panel').forEach(p =>
    p.classList.toggle('active', p.id === `panel-${tab}`)
  );
  // Quiz hides search/filter; dashboard re-renders fresh every visit
  document.body.classList.toggle('quiz-active', tab === 'quiz' || tab === 'dash');
  if (tab === 'dash') renderDashboard();
  updateFilterBar();
  applyFilters();
}

// ============================================================
// Study / Scan mode
// ============================================================
function setMode(study) {
  state.studyMode = study;
  document.getElementById('study-btn').classList.toggle('active', study);
  document.getElementById('scan-btn').classList.toggle('active', !study);
  if (!study) {
    document.querySelectorAll('.expand-row.open').forEach(r => r.classList.remove('open'));
    document.querySelectorAll('.data-row.expanded').forEach(r => r.classList.remove('expanded'));
  }
}

// ============================================================
// Filter handling
// ============================================================
function handleFilter(key, val) {
  const toggle = (obj, prop) => { obj[prop] = obj[prop] === val ? null : val; };
  if      (key === 'ds-cat')    toggle(state.filters.ds,       'category');
  else if (key === 'ds-tier')   toggle(state.filters.ds,       'tier');
  else if (key === 'ds-conf')   toggle(state.filters.ds,       'confidence');
  else if (key === 'pat-cat')   toggle(state.filters.patterns, 'category');
  else if (key === 'pat-tier')  toggle(state.filters.patterns, 'tier');
  else if (key === 'pat-conf')  toggle(state.filters.patterns, 'confidence');
  else if (key === 'cue-conf')  toggle(state.filters.cues,     'confidence');
  else if (key === 'algo-cat')  toggle(state.filters.algo,     'category');
  else if (key === 'algo-tier') toggle(state.filters.algo,     'tier');
  updateFilterBar();
  applyFilters();
}

// ============================================================
// Apply filters + search
// ============================================================
function applyFilters() {
  const q     = state.search;
  const daily = state.dailyScan;

  if (state.tab === 'ds') {
    const { category, tier, confidence } = state.filters.ds;
    document.querySelectorAll('.ds-row').forEach(row => {
      const s = data.dsById[row.dataset.id]; if (!s) return;
      const conf = getConf('ds', s.id);
      hideRow(row, `exp-ds-${s.id}`, !(
        (!category || s.category === category) &&
        (!tier || dsMatchesTier(s, tier)) &&
        (!confidence || conf === confidence) &&
        !(daily && conf === 'teal') &&
        (!q || dsSearch(s, q))
      ));
    });

  } else if (state.tab === 'patterns') {
    const { category, tier, confidence } = state.filters.patterns;
    document.querySelectorAll('.pat-row').forEach(row => {
      const p = data.patternById[row.dataset.id]; if (!p) return;
      const conf = getConf('pattern', p.id);
      hideRow(row, `exp-pattern-${p.id}`, !(
        (!category || p.category === category) &&
        (!tier || patMatchesTier(p, tier)) &&
        (!confidence || conf === confidence) &&
        !(daily && conf === 'teal') &&
        (!q || patSearch(p, q))
      ));
    });

  } else if (state.tab === 'algo') {
    const { category, tier } = state.filters.algo;
    document.querySelectorAll('.algo-row').forEach(row => {
      const a = data.algorithms.algorithms.find(x => x.id === row.dataset.id); if (!a) return;
      hideRow(row, `exp-algo-${a.id}`, !(
        (!category || a.category === category) &&
        (!tier || getTier(a.time_worst) === tier) &&
        (!q || text(a.name, a.senior_insight, ...(a.when_to_use || [])).includes(q))
      ));
    });

  } else if (state.tab === 'cues') {
    const { confidence } = state.filters.cues;
    document.querySelectorAll('.cue-item').forEach(card => {
      const idx  = parseInt(card.dataset.cueIdx);
      const cue  = data.cues.cues[idx];
      const conf = getConf('cue', `cue-${idx}`);
      card.classList.toggle('row-hidden', !(
        (!confidence || conf === confidence) &&
        !(daily && conf === 'teal') &&
        (!q || cueSearch(cue, q))
      ));
    });
  }
}

function hideRow(row, expandId, hide) {
  row.classList.toggle('row-hidden', hide);
  if (hide) {
    const exp = document.getElementById(expandId);
    if (exp) exp.classList.remove('open');
    row.classList.remove('expanded');
  }
}

// ── Tier matching ─────────────────────────────────────────────
function dsMatchesTier(s, tier) {
  return Object.values(s.operations || {}).concat(s.space || '').some(v => getTier(v) === tier);
}
function patMatchesTier(p, tier) {
  return getTier(p.time) === tier || getTier(p.space) === tier;
}

// ── Search ────────────────────────────────────────────────────
function dsSearch(s, q) {
  return text(s.name, s.java, s.senior_insight, ...(s.when_to_use || [])).includes(q);
}
function patSearch(p, q) {
  return text(p.name, p.mental_cue, ...(p.when_to_use || []), ...(p.classic_problems || [])).includes(q);
}
function cueSearch(cue, q) {
  return text(cue.signal, cue.note, ...(cue.patterns || []), ...(cue.extra_ds || [])).includes(q);
}

// ============================================================
// Expand / collapse
// ============================================================
function toggleExpand(rtype, id, row) {
  const expandRow = document.getElementById(`exp-${rtype}-${id}`);
  if (!expandRow) return;
  const opening = !expandRow.classList.contains('open');
  expandRow.classList.toggle('open', opening);
  row.classList.toggle('expanded', opening);
}

// ============================================================
// Cross-reference navigation
// ============================================================
function gotoItem(rtype, id) {
  const tab = rtype === 'ds' ? 'ds' : 'patterns';
  switchTab(tab);
  setTimeout(() => {
    const row = document.querySelector(
      rtype === 'ds' ? `.ds-row[data-id="${id}"]` : `.pat-row[data-id="${id}"]`
    );
    if (!row) return;
    row.classList.remove('row-hidden');
    const expandRow = document.getElementById(`exp-${rtype}-${id}`);
    if (expandRow) expandRow.classList.add('open');
    row.classList.add('expanded');
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.add('row-flash');
    setTimeout(() => row.classList.remove('row-flash'), 1500);
  }, 30);
}

// ============================================================
// Start
// ============================================================
init();
