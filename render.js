'use strict';

// ============================================================
// Tab: Data Structures
// ============================================================
function renderDS() {
  const panel = document.getElementById('panel-ds');
  const { structures, categories } = data.ds;
  let html = '';

  [...categories].sort((a, b) => a.order - b.order).forEach(cat => {
    const rows = structures.filter(s => s.category === cat.id);
    if (!rows.length) return;
    html += `<h2 class="section-heading">${escHtml(cat.name)}</h2>
      <div class="sheet-table-wrap"><table class="sheet-table">
        <thead><tr>
          <th class="dot-cell"></th><th>Name</th><th>Java</th>
          <th>Key Operations</th><th>Space</th><th>When To Use</th>
        </tr></thead><tbody>`;
    rows.forEach(s => { html += renderDSRow(s); });
    html += `</tbody></table></div>`;
  });
  panel.innerHTML = html;
}

function renderDSRow(s) {
  const dot     = dotHtml('ds', s.id);
  const opsHtml = Object.entries(s.operations || {}).slice(0, 3).map(([k, v]) =>
    `<div style="white-space:nowrap">
      <span style="font-family:monospace;font-size:0.68rem;color:var(--text-faint)">${escHtml(k.replace(/_/g,' '))}:</span>
      ${chipHtml(v)}
    </div>`
  ).join('');
  const firstUse = s.when_to_use ? escHtml(s.when_to_use[0]) : '';
  return `
    <tr class="data-row ds-row row-cat-${s.category}" data-id="${s.id}" data-rtype="ds">
      <td class="dot-cell">${dot}</td>
      <td class="cell-name">${escHtml(s.name)}</td>
      <td class="cell-java"><code>${escHtml(s.java)}</code></td>
      <td><div class="ops-cell">${opsHtml}</div></td>
      <td>${chipHtml(s.space)}</td>
      <td class="cell-when">${firstUse}</td>
    </tr>
    <tr class="expand-row" id="exp-ds-${s.id}"><td colspan="6">${renderDSExpand(s)}</td></tr>`;
}

function renderDSExpand(s) {
  let h = `<div class="expand-content">`;
  h += `<div><div class="expand-subtitle">All Operations</div><table class="ops-table"><tbody>`;
  Object.entries(s.operations || {}).forEach(([k, v]) => {
    h += `<tr><td>${escHtml(k.replace(/_/g,' '))}</td><td>${chipHtml(v)}</td></tr>`;
  });
  h += `</tbody></table></div>`;
  if (s.when_to_use?.length) h += `<div><div class="expand-subtitle">When To Use</div>
    <ul class="ul-plain">${s.when_to_use.map(w => `<li>${escHtml(w)}</li>`).join('')}</ul></div>`;
  if (s.senior_insight) h += `<div class="callout"><strong>Senior Insight</strong>${escHtml(s.senior_insight.trim())}</div>`;
  if (s.gotchas?.length) h += `<div class="stretch-box"><strong>Gotchas</strong>
    <ul class="ul-plain" style="margin-top:6px">${s.gotchas.map(g => `<li>${escHtml(g)}</li>`).join('')}</ul></div>`;
  if (s.concurrency) h += `<div class="callout-teal"><strong>Concurrency</strong>${escHtml(s.concurrency.trim())}</div>`;
  if (data.snippets[s.id]) h += snippetHtml(data.snippets[s.id]);
  return h + `</div>`;
}

// ============================================================
// Tab: Patterns
// ============================================================
function renderPatterns() {
  const panel = document.getElementById('panel-patterns');
  const { patterns, categories } = data.patterns;
  let html = '';

  [...categories].sort((a, b) => a.order - b.order).forEach(cat => {
    const rows = patterns.filter(p => p.category === cat.id);
    if (!rows.length) return;
    html += `<h2 class="section-heading">${escHtml(cat.name)}</h2>
      <div class="sheet-table-wrap"><table class="sheet-table">
        <thead><tr>
          <th class="dot-cell"></th><th>Pattern</th><th>Mental Cue</th>
          <th>Time</th><th>Space</th><th>DS Pairings</th>
        </tr></thead><tbody>`;
    rows.forEach(p => { html += renderPatternRow(p); });
    html += `</tbody></table></div>`;
  });
  panel.innerHTML = html;
}

function renderPatternRow(p) {
  const dot    = dotHtml('pattern', p.id);
  const dsTags = (p.ds_pairings || []).map(id => {
    const ds = data.dsById[id];
    return `<span class="tag tag-ds tag-link" data-goto="ds" data-goto-id="${id}" title="Jump to ${ds ? ds.name : id} in Data Structures tab">${ds ? ds.name : id}</span>`;
  }).join('');
  return `
    <tr class="data-row pat-row row-cat-${p.category}" data-id="${p.id}" data-rtype="pattern">
      <td class="dot-cell">${dot}</td>
      <td class="cell-name">${escHtml(p.name)}</td>
      <td class="cell-cue">${escHtml(p.mental_cue)}</td>
      <td>${chipHtml(p.time)}</td>
      <td>${chipHtml(p.space)}</td>
      <td><div class="tag-row">${dsTags}</div></td>
    </tr>
    <tr class="expand-row" id="exp-pattern-${p.id}"><td colspan="6">${renderPatternExpand(p)}</td></tr>`;
}

function renderPatternExpand(p) {
  let h = `<div class="expand-content">`;
  if (p.when_to_use?.length) h += `<div><div class="expand-subtitle">When To Use</div>
    <ul class="ul-plain">${p.when_to_use.map(w => `<li>${escHtml(w)}</li>`).join('')}</ul></div>`;
  if (p.classic_problems?.length) h += `<div><div class="expand-subtitle">Classic Problems</div>
    <div class="tag-row">${p.classic_problems.map(prob => `<span class="tag">${escHtml(prob)}</span>`).join('')}</div></div>`;
  const pairing = data.pairings.pairings?.find(pa => pa.pattern === p.id);
  if (pairing) {
    const dsTags = (pairing.structures || []).map(id => {
      const ds = data.dsById[id];
      return `<span class="tag tag-ds tag-link" data-goto="ds" data-goto-id="${id}" title="Jump to ${ds ? ds.name : id} in Data Structures tab">${ds ? ds.name : id}</span>`;
    }).join('');
    h += `<div><div class="expand-subtitle">DS Pairings</div>
      <div class="tag-row" style="margin-bottom:8px">${dsTags}</div>
      <div class="callout"><strong>Why</strong>${escHtml(pairing.why.trim())}</div></div>`;
  }
  if (p.gotchas?.length) h += `<div class="stretch-box"><strong>Gotchas</strong>
    <ul class="ul-plain" style="margin-top:6px">${p.gotchas.map(g => `<li>${escHtml(g)}</li>`).join('')}</ul></div>`;
  if (data.snippets[p.id]) h += snippetHtml(data.snippets[p.id]);
  return h + `</div>`;
}

// ============================================================
// Tab: Recognition Cues
// ============================================================
function renderCues() {
  const panel = document.getElementById('panel-cues');
  let html = `<div class="qr-grid">`;
  data.cues.cues.forEach((cue, idx) => {
    const dot     = dotHtml('cue', `cue-${idx}`);
    const patTags = (cue.patterns || []).map(id => {
      const p = data.patternById[id];
      return `<span class="tag tag-link" data-goto="pattern" data-goto-id="${id}" title="Jump to ${p ? p.name : id} in Patterns tab">${p ? p.name : id}</span>`;
    }).join('');
    const dsTags = (cue.extra_ds || []).map(id => {
      const ds = data.dsById[id];
      return `<span class="tag tag-ds tag-link" data-goto="ds" data-goto-id="${id}" title="Jump to ${ds ? ds.name : id} in Data Structures tab">${ds ? ds.name : id}</span>`;
    }).join('');
    html += `<div class="qr-item cue-item" data-cue-idx="${idx}">
      <div class="qr-signal">${dot}<span>${escHtml(cue.signal)}</span></div>
      <div class="qr-patterns">${patTags}${dsTags}</div>
      ${cue.note ? `<div class="qr-note">${escHtml(cue.note)}</div>` : ''}
    </div>`;
  });
  panel.innerHTML = html + `</div>`;
}

// ============================================================
// Tab: Pairings
// ============================================================
function renderPairings() {
  const panel = document.getElementById('panel-pairings');
  const { pairings, composites } = data.pairings;
  let html = `<h2 class="section-heading">Pattern → Data Structure Pairings</h2><div class="pairings-list">`;

  (pairings || []).forEach(pa => {
    const pattern = data.patternById[pa.pattern];
    const patName = pattern ? pattern.name : pa.pattern;
    const dsTags  = (pa.structures || []).map(id => {
      const ds = data.dsById[id];
      return `<span class="tag tag-ds tag-link" data-goto="ds" data-goto-id="${id}" title="Jump to ${ds ? ds.name : id} in Data Structures tab">${ds ? ds.name : id}</span>`;
    }).join('');
    html += `<div class="pairing-card">
      <div class="pairing-header">
        <span class="tag tag-link" data-goto="pattern" data-goto-id="${pa.pattern}" title="Jump to ${patName} in Patterns tab">${escHtml(patName)}</span>
        <div class="tag-row">${dsTags}</div>
      </div>
      <div class="pairing-why">${escHtml(pa.why.trim())}</div>
    </div>`;
  });
  html += `</div>`;

  if (composites?.length) {
    html += `<h2 class="section-heading" style="margin-top:40px">Composite Designs (Multi-DS)</h2><div class="pairings-list">`;
    composites.forEach(comp => {
      const dsTags  = (comp.structures || []).map(id => {
        const ds = data.dsById[id];
        return `<span class="tag tag-ds tag-link" data-goto="ds" data-goto-id="${id}" title="Jump to ${ds ? ds.name : id} in Data Structures tab">${ds ? ds.name : id}</span>`;
      }).join('');
      const probTags = (comp.classic_problems || []).map(p => `<span class="tag">${escHtml(p)}</span>`).join('');
      html += `<div class="composite-card">
        <div class="composite-name">${escHtml(comp.name)}</div>
        <div class="tag-row" style="margin-bottom:10px">${dsTags}</div>
        <div class="composite-explanation">${escHtml(comp.explanation.trim())}</div>
        ${probTags ? `<div class="tag-row" style="margin-top:10px">${probTags}</div>` : ''}
      </div>`;
    });
    html += `</div>`;
  }
  panel.innerHTML = html;
}

// ============================================================
// Tab: Senior-Only
// ============================================================
function renderSenior() {
  const panel = document.getElementById('panel-senior');
  let html = `<h2 class="section-heading">Concurrency Cheat-Sheet</h2>
    <div class="sheet-table-wrap"><table class="concurrency-table">
      <thead><tr><th>Need</th><th>Use (Java)</th><th>Avoid</th></tr></thead>
      <tbody>
        <tr><td>Thread-safe map</td><td>ConcurrentHashMap</td><td>Hashtable (legacy)</td></tr>
        <tr><td>Thread-safe bounded queue</td><td>ArrayBlockingQueue</td><td>Unbounded queue — OOM risk</td></tr>
        <tr><td>Thread-safe sorted map</td><td>ConcurrentSkipListMap</td><td>synchronizedMap(TreeMap)</td></tr>
        <tr><td>Thread-safe set</td><td>ConcurrentHashMap.newKeySet()</td><td>Collections.synchronizedSet</td></tr>
        <tr><td>Read-heavy list</td><td>CopyOnWriteArrayList</td><td>Vector (fully synchronized)</td></tr>
      </tbody>
    </table></div>`;

  html += `<h2 class="section-heading" style="margin-top:40px">Data Structure — Senior Insights</h2>
    <div class="senior-grid">`;
  data.ds.structures.forEach(s => {
    if (!s.senior_insight) return;
    html += `<div class="senior-card">
      <div class="senior-card-label">Data Structure</div>
      <div class="senior-card-name">${escHtml(s.name)}
        <code style="font-size:0.72rem;color:var(--accent-blue);margin-left:8px">${escHtml(s.java)}</code>
      </div>
      <div class="senior-card-insight">${escHtml(s.senior_insight.trim())}</div>
    </div>`;
  });
  html += `</div>`;

  html += `<h2 class="section-heading" style="margin-top:40px">Pattern Gotchas</h2><div class="senior-grid">`;
  data.patterns.patterns.forEach(p => {
    if (!p.gotchas?.length) return;
    html += `<div class="senior-card" style="border-left:3px solid var(--secondary)">
      <div class="senior-card-label">Pattern</div>
      <div class="senior-card-name">${escHtml(p.name)}</div>
      <ul class="ul-plain">${p.gotchas.map(g => `<li>${escHtml(g)}</li>`).join('')}</ul>
    </div>`;
  });
  html += `</div>`;

  const annotated = data.cues.cues.filter(c => c.note);
  if (annotated.length) {
    html += `<h2 class="section-heading" style="margin-top:40px">Recognition Cue Notes</h2><div class="qr-grid">`;
    annotated.forEach(cue => {
      const patTags = (cue.patterns || []).map(id => {
        const p = data.patternById[id];
        return `<span class="tag tag-link" data-goto="pattern" data-goto-id="${id}" title="Jump to ${p ? p.name : id} in Patterns tab">${p ? p.name : id}</span>`;
      }).join('');
      html += `<div class="qr-item">
        <div class="qr-signal"><span>${escHtml(cue.signal)}</span></div>
        <div class="qr-patterns">${patTags}</div>
        <div class="qr-note" style="color:var(--primary)">${escHtml(cue.note)}</div>
      </div>`;
    });
    html += `</div>`;
  }
  panel.innerHTML = html;
}

// ============================================================
// Tab: Algorithms
// ============================================================
function renderAlgorithms() {
  const panel = document.getElementById('panel-algo');
  const { algorithms, categories } = data.algorithms;
  let html = '';

  [...categories].sort((a, b) => a.order - b.order).forEach(cat => {
    const rows = algorithms.filter(a => a.category === cat.id);
    if (!rows.length) return;
    html += `<h2 class="section-heading">${escHtml(cat.name)}</h2>
      <div class="sheet-table-wrap"><table class="sheet-table">
        <thead><tr>
          <th class="dot-cell"></th><th>Algorithm</th><th>Avg Time</th>
          <th>Worst Time</th><th>Space</th><th>Stable</th><th>Java</th>
        </tr></thead><tbody>`;
    rows.forEach(a => { html += renderAlgoRow(a); });
    html += `</tbody></table></div>`;
  });
  panel.innerHTML = html;
}

function renderAlgoRow(a) {
  const dot        = dotHtml('algo', a.id);
  const stableCell = a.stable === true  ? `<span style="color:var(--secondary);font-size:0.8rem">✓ stable</span>`
                   : a.stable === false ? `<span style="color:var(--accent-warn);font-size:0.8rem">✗ unstable</span>`
                   : `<span style="color:var(--text-faint);font-size:0.75rem">—</span>`;
  return `
    <tr class="data-row algo-row row-algo-${a.category}" data-id="${a.id}" data-rtype="algo">
      <td class="dot-cell">${dot}</td>
      <td class="cell-name">${escHtml(a.name)}</td>
      <td>${chipHtml(a.time_avg)}</td>
      <td>${chipHtml(a.time_worst)}</td>
      <td>${chipHtml(a.space)}</td>
      <td>${stableCell}</td>
      <td class="cell-java" style="font-size:0.75rem;max-width:180px">${escHtml(a.java)}</td>
    </tr>
    <tr class="expand-row" id="exp-algo-${a.id}"><td colspan="7">${renderAlgoExpand(a)}</td></tr>`;
}

function renderAlgoExpand(a) {
  let h = `<div class="expand-content">`;
  h += `<div><div class="expand-subtitle">Complexity</div>
    <table class="ops-table"><tbody>
      <tr><td>Best</td><td>${chipHtml(a.time_best)}</td></tr>
      <tr><td>Average</td><td>${chipHtml(a.time_avg)}</td></tr>
      <tr><td>Worst</td><td>${chipHtml(a.time_worst)}</td></tr>
      <tr><td>Space</td><td>${chipHtml(a.space)}</td></tr>
    </tbody></table></div>`;
  if (a.when_to_use?.length) h += `<div><div class="expand-subtitle">When To Use</div>
    <ul class="ul-plain">${a.when_to_use.map(w => `<li>${escHtml(w)}</li>`).join('')}</ul></div>`;
  if (a.senior_insight) h += `<div class="callout"><strong>Senior Insight</strong>${escHtml(a.senior_insight.trim())}</div>`;
  if (a.gotchas?.length) h += `<div class="stretch-box"><strong>Gotchas</strong>
    <ul class="ul-plain" style="margin-top:6px">${a.gotchas.map(g => `<li>${escHtml(g)}</li>`).join('')}</ul></div>`;
  if (data.snippets[a.id]) h += snippetHtml(data.snippets[a.id]);
  return h + `</div>`;
}

// ============================================================
// Tab: Java Reference (new)
// ============================================================
function renderJava() {
  const panel = document.getElementById('panel-java');

  panel.innerHTML = `
    ${javaConstraintsSection()}
    ${javaMemorySection()}
    ${javaCollectionsSection()}
    ${javaGotchasSection()}
    ${javaSnippetsGallery()}
  `;
}

function javaSnippetsGallery() {
  if (!data.snippets || !Object.keys(data.snippets).length) return '';

  // Group snippets: patterns first, then algorithms, then DS
  const groups = [
    {
      label: 'Pattern Templates',
      ids: data.patterns.patterns
        .filter(p => data.snippets[p.id])
        .map(p => ({ id: p.id, name: p.name }))
    },
    {
      label: 'Algorithm Implementations',
      ids: data.algorithms.algorithms
        .filter(a => data.snippets[a.id])
        .map(a => ({ id: a.id, name: a.name }))
    },
    {
      label: 'Data Structure Implementations',
      ids: data.ds.structures
        .filter(s => data.snippets[s.id])
        .map(s => ({ id: s.id, name: s.name }))
    }
  ].filter(g => g.ids.length > 0);

  const groupHtml = groups.map(g => {
    const cards = g.ids.map(({ id, name }) => `
      <div class="snip-card">
        <div class="snip-card-title">${escHtml(name)}</div>
        ${snippetHtml(data.snippets[id])}
      </div>`
    ).join('');
    return `<h3 class="snip-group-heading">${escHtml(g.label)}</h3>
      <div class="snip-grid">${cards}</div>`;
  }).join('');

  return `<h2 class="section-heading" style="margin-top:40px">Snippets Gallery</h2>
    <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:24px">
      All canonical implementations in one place. Same snippets appear in the expand panel of their respective rows.
    </p>
    ${groupHtml}`;
}

function javaConstraintsSection() {
  const rows = [
    ['≤ 10',      'O(n!)',        '🔴', 'Brute force, all permutations',           'backtracking (no pruning)'],
    ['≤ 15',      'O(2ⁿ)',        '🔴', 'Bitmask DP, subset enumeration',          'dp[1<<n], backtracking'],
    ['≤ 20',      'O(2ⁿ · n)',    '🔴', 'TSP, bitmask DP with extra state',        'dp[1<<n][n]'],
    ['≤ 100',     'O(n³)',        '🟠', 'Floyd-Warshall, interval DP',             'int[n][n][n]'],
    ['≤ 1,000',   'O(n²)',        '🟠', '2D DP, naïve string match, Bellman-Ford', 'int[n][n]'],
    ['≤ 10,000',  'O(n² / n√n)', '🟠', 'Careful O(n²) — tight limit',            'watch constants'],
    ['≤ 10⁵',    'O(n log n)',   '🟡', 'Sort, heap, merge sort, segment tree',    'TreeMap, PriorityQueue'],
    ['≤ 10⁶',    'O(n)',         '🟡', 'Kadane, linear DP, hashing, two-pointer', 'HashMap, array'],
    ['≤ 10⁷',    'O(n)',         '🟡', 'O(n) tight — avoid HashMap overhead',     'plain int[], counting sort'],
    ['≤ 10⁸',    'O(log n)',     '🟢', 'Binary search on answer',                 'binary search predicate'],
    ['≤ 10¹⁸',  'O(1) / math',  '🟢', 'Direct formula, math insight',            'long arithmetic'],
  ];

  const tableRows = rows.map(([n, complexity, icon, fits, java]) =>
    `<tr>
      <td style="font-family:monospace;color:var(--primary);white-space:nowrap">n ${n}</td>
      <td>${icon} <span style="font-family:monospace">${escHtml(complexity)}</span></td>
      <td style="color:var(--text-muted)">${escHtml(fits)}</td>
      <td style="font-family:monospace;font-size:0.78rem;color:var(--accent-blue)">${escHtml(java)}</td>
    </tr>`
  ).join('');

  return `
    <h2 class="section-heading">Input Size → Algorithm Complexity</h2>
    <div class="callout" style="margin-bottom:16px">
      <strong>How to use</strong>
      Read the constraint on n from the problem. Pick the row — anything slower will TLE.
      This is the first thing to check in the first 60 seconds of an interview.
    </div>
    <div class="sheet-table-wrap">
      <table class="sheet-table">
        <thead><tr>
          <th>Constraint</th><th>Max Complexity</th><th>What Fits</th><th>Java Notes</th>
        </tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>`;
}

function javaMemorySection() {
  const rows = [
    ['int (4 bytes)',    '1 MB → 250K',   '16 MB → 4M',    '256 MB → 64M'],
    ['long (8 bytes)',   '1 MB → 125K',   '16 MB → 2M',    '256 MB → 32M'],
    ['int[n][n] matrix','n=500 → 1MB',   'n=2000 → 16MB', 'n=8000 → 256MB'],
    ['boolean[n][n]',   'n=1000 → 1MB',  'n=4000 → 16MB', 'n=16K → 256MB'],
    ['HashMap entry',   '~48 bytes/entry','1MB → ~21K entries','Watch for 8× overhead vs array'],
  ];

  const tableRows = rows.map(([type, mb1, mb16, mb256]) =>
    `<tr>
      <td style="font-family:monospace;color:var(--accent-blue)">${escHtml(type)}</td>
      <td style="color:var(--text-muted)">${escHtml(mb1)}</td>
      <td style="color:var(--text-muted)">${escHtml(mb16)}</td>
      <td style="color:var(--text-muted)">${escHtml(mb256)}</td>
    </tr>`
  ).join('');

  return `
    <h2 class="section-heading" style="margin-top:40px">Memory Reference</h2>
    <div class="sheet-table-wrap">
      <table class="sheet-table">
        <thead><tr><th>Type</th><th>1 MB</th><th>16 MB</th><th>256 MB (LeetCode default)</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>`;
}

function javaCollectionsSection() {
  const decisions = [
    {
      need: 'Ordered list, random access by index',
      use: 'ArrayList<E>',
      avoid: 'LinkedList<E>',
      why: 'O(1) access, amortized O(1) append. LinkedList has O(n) get(i) and poor cache locality.'
    },
    {
      need: 'Stack (LIFO) or Queue (FIFO)',
      use: 'ArrayDeque<E>',
      avoid: 'Stack<E>, LinkedList<E>',
      why: 'ArrayDeque is faster than both. Stack extends Vector (synchronized). LinkedList has pointer overhead.'
    },
    {
      need: 'Key-value lookup, O(1) average',
      use: 'HashMap<K,V>',
      avoid: 'Hashtable<K,V>',
      why: 'HashMap is unsynchronized and faster. Hashtable is legacy, fully synchronized — use ConcurrentHashMap for concurrency.'
    },
    {
      need: 'Key-value lookup with insertion-order iteration',
      use: 'LinkedHashMap<K,V>',
      avoid: 'HashMap + external list',
      why: 'Maintains insertion order with O(1) ops. Also supports access-order for LRU: new LinkedHashMap<>(cap, 0.75f, true).'
    },
    {
      need: 'Sorted keys, range queries, floor/ceiling',
      use: 'TreeMap<K,V>',
      avoid: 'HashMap + sort',
      why: 'Red-Black tree. O(log n) all ops. Supports floorKey, ceilingKey, subMap, headMap, tailMap.'
    },
    {
      need: 'Unique elements, O(1) lookup',
      use: 'HashSet<E>',
      avoid: 'ArrayList + contains()',
      why: 'contains() is O(1) avg vs O(n) on ArrayList. Backed by HashMap internally.'
    },
    {
      need: 'Sorted unique elements, min/max in O(log n)',
      use: 'TreeSet<E>',
      avoid: 'HashSet + sort',
      why: 'Backed by TreeMap. first(), last(), floor(), ceiling() all O(log n).'
    },
    {
      need: 'Repeated min/max access (top-K, heap)',
      use: 'PriorityQueue<E>',
      avoid: 'Sorting the whole list',
      why: 'Min-heap by default. For max-heap: PriorityQueue<>(Collections.reverseOrder()). peek O(1), poll/offer O(log n).'
    },
    {
      need: 'Thread-safe map',
      use: 'ConcurrentHashMap<K,V>',
      avoid: 'Collections.synchronizedMap(), Hashtable',
      why: 'Lock-striping — reads are lock-free, writes lock a single segment. Far better throughput than full-map locking.'
    },
    {
      need: 'Thread-safe bounded queue (producer-consumer)',
      use: 'ArrayBlockingQueue<E>',
      avoid: 'LinkedBlockingQueue (unbounded)',
      why: 'Fixed capacity prevents OOM in producer-consumer. LinkedBlockingQueue is unbounded by default — dangerous under load.'
    },
    {
      need: 'LRU cache',
      use: 'LinkedHashMap<K,V> (accessOrder=true)',
      avoid: 'HashMap + DoublyLinkedList (manual)',
      why: 'Override removeEldestEntry. One-liner for production. Manual DLL+HashMap is the interview implementation when asked to "design" it.'
    },
    {
      need: 'Frequency counting (character, element)',
      use: 'int[26] or HashMap<E, Integer>',
      avoid: 'TreeMap for this',
      why: 'int[26] for lowercase ASCII — array access is O(1) with zero overhead. HashMap for arbitrary keys.'
    },
  ];

  const rows = decisions.map(d => `
    <tr>
      <td style="color:var(--text);font-weight:600;font-size:0.85rem">${escHtml(d.need)}</td>
      <td><code style="color:var(--secondary)">${escHtml(d.use)}</code></td>
      <td><code style="color:var(--accent-warn);font-size:0.78rem">${escHtml(d.avoid)}</code></td>
      <td style="color:var(--text-muted);font-size:0.82rem">${escHtml(d.why)}</td>
    </tr>`
  ).join('');

  return `
    <h2 class="section-heading" style="margin-top:40px">Collections Decision Table</h2>
    <div class="sheet-table-wrap">
      <table class="sheet-table">
        <thead><tr><th>I need…</th><th>Use</th><th>Avoid</th><th>Why</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function javaGotchasSection() {
  const gotchas = [
    {
      title: 'remove(int index) vs remove(Object o) on List<Integer>',
      body: 'list.remove(1) calls remove(int) — removes index 1. list.remove(Integer.valueOf(1)) calls remove(Object) — removes the value 1. Autoboxing does NOT resolve the ambiguity — be explicit.'
    },
    {
      title: 'Integer cache: == vs .equals()',
      body: 'Integer values -128 to 127 are cached. Integer a = 127; Integer b = 127; a == b → true. Integer a = 128; Integer b = 128; a == b → false. Always use .equals() for Integer comparison.'
    },
    {
      title: 'ConcurrentModificationException on iterator',
      body: 'Modifying a collection while iterating with for-each throws CME. Fix: use Iterator.remove(), or collect items to remove in a list and remove after iteration, or use removeIf().'
    },
    {
      title: 'Stack<E> extends Vector — never use it',
      body: 'java.util.Stack is synchronized (from Vector) and has API quirks. Always use ArrayDeque<E> as a stack: push → addFirst, pop → removeFirst, peek → peekFirst.'
    },
    {
      title: 'PriorityQueue.contains() is O(n)',
      body: 'PriorityQueue has no index structure. contains() and remove(Object) scan all elements. If you need O(log n) removal, maintain a HashMap<item, count> alongside the heap and use lazy deletion.'
    },
    {
      title: 'HashMap iteration order is undefined',
      body: 'HashMap makes no ordering guarantee — not insertion order, not sorted. Use LinkedHashMap for insertion order, TreeMap for sorted order. This is a common interview trap.'
    },
    {
      title: 'int overflow in binary search midpoint',
      body: 'int mid = (lo + hi) / 2 overflows when lo + hi > Integer.MAX_VALUE. Always use mid = lo + (hi - lo) / 2. Same issue with sum-of-two-integers in general.'
    },
    {
      title: 'Arrays.sort() stability: objects vs primitives',
      body: 'Arrays.sort(int[]) uses dual-pivot quicksort — NOT stable. Arrays.sort(Integer[]) and Collections.sort() use Tim Sort — stable. If you need stable sort on primitives, box them or implement merge sort.'
    },
    {
      title: 'String concatenation in a loop is O(n²)',
      body: 'String is immutable. "s" + x + y creates two new Strings per iteration. Use StringBuilder and append(). In Java 9+, the JIT can optimize some cases, but never rely on it in interviews.'
    },
    {
      title: 'char arithmetic and casting',
      body: '"a" - "a" is a compile error. char is a numeric type: \'c\' - \'a\' == 2 (int). To build a String from chars: Character.toString(c) or String.valueOf(c). new String(charArray) for bulk conversion.'
    },
  ];

  const cards = gotchas.map(g => `
    <div class="stretch-box" style="margin-bottom:10px">
      <strong>${escHtml(g.title)}</strong>
      <p style="margin-top:6px;font-size:0.84rem;color:var(--text-muted);line-height:1.6">${escHtml(g.body)}</p>
    </div>`
  ).join('');

  return `
    <h2 class="section-heading" style="margin-top:40px">Java Gotchas</h2>
    ${cards}`;
}

// ============================================================
// Tab: Dashboard (re-rendered on every visit)
// ============================================================
function renderDashboard() {
  const panel = document.getElementById('panel-dash');

  // ── Confidence counts ─────────────────────────────────────
  const tracked = [
    {
      label: 'Data Structures',
      tab: 'ds',
      items: data.ds.structures.map(s => ({ ctype: 'ds', cid: s.id, cat: s.category, name: s.name })),
      cats: data.ds.categories
    },
    {
      label: 'Patterns',
      tab: 'patterns',
      items: data.patterns.patterns.map(p => ({ ctype: 'pattern', cid: p.id, cat: p.category, name: p.name })),
      cats: data.patterns.categories
    },
    {
      label: 'Algorithms',
      tab: 'algo',
      items: data.algorithms.algorithms.map(a => ({ ctype: 'algo', cid: a.id, cat: a.category, name: a.name })),
      cats: data.algorithms.categories
    },
    {
      label: 'Cues',
      tab: 'cues',
      items: data.cues.cues.map((c, i) => ({ ctype: 'cue', cid: `cue-${i}`, cat: 'cue', name: c.signal })),
      cats: []
    },
  ];

  // ── Coverage overview cards ────────────────────────────────
  let coverageHtml = `<div class="dash-coverage-grid">`;
  tracked.forEach(group => {
    const counts = { teal: 0, yellow: 0, gray: 0 };
    group.items.forEach(item => { counts[getConf(item.ctype, item.cid)]++; });
    const total  = group.items.length;
    const tPct   = Math.round((counts.teal   / total) * 100);
    const yPct   = Math.round((counts.yellow / total) * 100);
    const gPct   = 100 - tPct - yPct;

    coverageHtml += `
      <div class="dash-cov-card" data-goto-tab="${group.tab}" style="cursor:pointer">
        <div class="dash-cov-title">${escHtml(group.label)}</div>
        <div class="dash-cov-numbers">
          <span style="color:var(--secondary)">${counts.teal} known</span>
          <span style="color:var(--primary)">${counts.yellow} shaky</span>
          <span style="color:var(--text-faint)">${counts.gray} not reviewed</span>
          <span style="color:var(--text-dim);margin-left:auto">${total} total</span>
        </div>
        <div class="dash-stacked-bar">
          <div style="width:${tPct}%;background:var(--secondary)" title="${counts.teal} known"></div>
          <div style="width:${yPct}%;background:var(--primary)" title="${counts.yellow} shaky"></div>
          <div style="width:${gPct}%;background:var(--border)" title="${counts.gray} not reviewed"></div>
        </div>
      </div>`;
  });
  coverageHtml += `</div>`;

  // ── Per-category breakdown ─────────────────────────────────
  let categoryHtml = '';
  tracked.filter(g => g.cats.length > 0).forEach(group => {
    categoryHtml += `<h3 class="dash-cat-heading">${escHtml(group.label)}</h3><div class="dash-cat-grid">`;
    [...group.cats].sort((a, b) => a.order - b.order).forEach(cat => {
      const items  = group.items.filter(i => i.cat === cat.id);
      const counts = { teal: 0, yellow: 0, gray: 0 };
      items.forEach(i => { counts[getConf(i.ctype, i.cid)]++; });
      const total = items.length;
      const tPct  = Math.round((counts.teal / total) * 100);
      const yPct  = Math.round((counts.yellow / total) * 100);

      categoryHtml += `
        <div class="dash-cat-row">
          <div class="dash-cat-name">${escHtml(cat.name)}</div>
          <div class="dash-stacked-bar" style="flex:1;margin:0 12px">
            <div style="width:${tPct}%;background:var(--secondary)"></div>
            <div style="width:${yPct}%;background:var(--primary)"></div>
            <div style="width:${100-tPct-yPct}%;background:var(--border)"></div>
          </div>
          <div class="dash-cat-nums">
            <span style="color:var(--secondary)">${counts.teal}</span>
            <span style="color:var(--text-faint)">/ ${total}</span>
          </div>
        </div>`;
    });
    categoryHtml += `</div>`;
  });

  // ── Quiz accuracy ──────────────────────────────────────────
  const allAcc  = loadAllAccuracy();
  const accRows = Object.entries(allAcc)
    .map(([pid, a]) => ({ pid, name: data.patternById[pid]?.name || pid, ...a,
      pct: a.total > 0 ? Math.round((a.correct / a.total) * 100) : 0 }))
    .sort((a, b) => a.pct - b.pct);

  let quizHtml = '';
  if (accRows.length === 0) {
    quizHtml = `<div style="color:var(--text-dim);font-size:0.88rem;padding:16px 0">
      No quiz history yet — take a quiz to see accuracy by pattern.
    </div>`;
  } else {
    quizHtml = `<div class="dash-quiz-list">` + accRows.map(a => {
      const barColor = a.pct >= 80 ? 'var(--secondary)' : a.pct >= 50 ? 'var(--primary)' : 'var(--accent-warn)';
      return `<div class="dash-quiz-row">
        <div class="dash-quiz-name tag-link" data-goto="pattern" data-goto-id="${a.pid}" style="cursor:pointer">${escHtml(a.name)} ↗</div>
        <div class="dash-quiz-bar-wrap"><div class="dash-quiz-bar" style="width:${a.pct}%;background:${barColor}"></div></div>
        <div class="dash-quiz-score" style="color:${barColor}">${a.correct}/${a.total}</div>
      </div>`;
    }).join('') + `</div>`;
  }

  panel.innerHTML = `
    <h2 class="section-heading">Prep Coverage</h2>
    <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:20px">
      Click a card to jump to that tab. Confidence dots update in real time.
    </p>
    ${coverageHtml}

    <h2 class="section-heading" style="margin-top:40px">By Category</h2>
    ${categoryHtml}

    <h2 class="section-heading" style="margin-top:40px">Quiz Accuracy — by Pattern</h2>
    <p style="color:var(--text-dim);font-size:0.85rem;margin-bottom:16px">Sorted worst-first. Click any pattern to review it.</p>
    ${quizHtml}`;

  // Wire coverage card clicks
  panel.querySelectorAll('[data-goto-tab]').forEach(card =>
    card.addEventListener('click', () => switchTab(card.dataset.gotoTab))
  );
  // Wire pattern links
  panel.querySelectorAll('[data-goto]').forEach(el =>
    el.addEventListener('click', () => gotoItem(el.dataset.goto, el.dataset.gotoId))
  );
}
