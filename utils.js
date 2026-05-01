'use strict';

// ============================================================
// HTML escaping
// ============================================================
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// Complexity tier detection
// ============================================================
function getTier(c) {
  if (!c) return null;
  if (/O\(2\^n\)|O\(n!\)|O\(n\s*[*·]\s*W\)/i.test(c)) return 'red';
  if (/O\(n\^2\)|O\(V\^2\)|n²|V²/i.test(c)) return 'orange';
  if (/O\(1\)|O\(log n\)|O\(α|\u03b1|amortized/i.test(c)) return 'green';
  if (/O\(n\)|O\(n log n\)|O\(L\)|O\(V\+E\)|O\(V \+ E\)|O\(m/i.test(c)) return 'yellow';
  return null;
}

function chipHtml(complexity) {
  if (!complexity) return '';
  const tier = getTier(complexity);
  const cls  = tier ? `tc-${tier}` : 'tc-dim';
  const icon = { green: '🟢', yellow: '🟡', orange: '🟠', red: '🔴' }[tier] || '';
  return `<span class="tier-chip ${cls}">${icon} ${escHtml(complexity)}</span>`;
}

// ============================================================
// Confidence dots
// ============================================================
function getConf(ctype, cid) {
  return localStorage.getItem(`swe-conf:${ctype}:${cid}`) || 'gray';
}

function setConf(ctype, cid, val) {
  localStorage.setItem(`swe-conf:${ctype}:${cid}`, val);
}

function cycleConf(ctype, cid) {
  const cur  = getConf(ctype, cid);
  const next = cur === 'gray' ? 'yellow' : cur === 'yellow' ? 'teal' : 'gray';
  setConf(ctype, cid, next);
  return next;
}

function dotHtml(ctype, cid) {
  const conf = getConf(ctype, cid);
  return `<span class="conf-dot conf-${conf}" data-ctype="${ctype}" data-cid="${cid}" title="${confTitle(conf)}"></span>`;
}

function confTitle(conf) {
  return conf === 'gray' ? 'Not reviewed' : conf === 'yellow' ? 'Shaky — need review' : 'Know cold';
}

// ============================================================
// Filter bar builders
// ============================================================
function filterLabel(txt) {
  return `<span class="filter-label">${txt}:</span>`;
}

function filterChip(filterKey, val, label, active) {
  return `<button class="filter-chip${active ? ' active' : ''}" data-fkey="${filterKey}" data-fval="${val}">${escHtml(label)}</button>`;
}

function tierChipHtml(filterKey, active) {
  return [
    { id: 'green',  label: '🟢 O(1)/log n' },
    { id: 'yellow', label: '🟡 O(n)' },
    { id: 'orange', label: '🟠 O(n²)' },
    { id: 'red',    label: '🔴 Exp/Fact' }
  ].map(t =>
    `<button class="filter-chip tier-${t.id}${active === t.id ? ' active' : ''}" data-fkey="${filterKey}" data-fval="${t.id}">${t.label}</button>`
  ).join('');
}

function confChipHtml(filterKey, active) {
  return filterLabel('Confidence') + [
    { id: 'gray',   label: '⚫ Not reviewed' },
    { id: 'yellow', label: '🟡 Shaky' },
    { id: 'teal',   label: '🟢 Know cold' }
  ].map(c =>
    `<button class="filter-chip${active === c.id ? ' active' : ''}" data-fkey="${filterKey}" data-fval="${c.id}">${c.label}</button>`
  ).join('');
}

// ============================================================
// Misc helpers
// ============================================================
function text(...parts) {
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ============================================================
// Java syntax highlighter (no external dependency)
// ============================================================
const _HJ_KEYWORDS = /\b(abstract|assert|boolean|break|byte|case|catch|char|class|continue|default|do|double|else|enum|extends|final|finally|float|for|if|implements|import|instanceof|int|interface|long|native|new|null|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|true|false|try|var|void|volatile|while)\b/g;
const _HJ_TYPES   = /\b(Arrays|ArrayList|ArrayDeque|Collections|Comparator|Deque|HashMap|HashSet|Integer|Iterator|LinkedHashMap|LinkedList|List|Map|Math|Object|Optional|PriorityQueue|Queue|Set|Stack|String|StringBuilder|System|TreeMap|TreeSet)\b/g;

function highlightJava(raw) {
  // 1. Split on string literals and line comments to avoid highlighting inside them
  const parts = [];
  let i = 0;
  while (i < raw.length) {
    if (raw[i] === '/' && raw[i+1] === '/') {
      const end = raw.indexOf('\n', i);
      const line = end === -1 ? raw.slice(i) : raw.slice(i, end);
      parts.push({ type: 'comment', text: line });
      i = end === -1 ? raw.length : end;
    } else if (raw[i] === '"') {
      let j = i + 1;
      while (j < raw.length && (raw[j] !== '"' || raw[j-1] === '\\')) j++;
      parts.push({ type: 'string', text: raw.slice(i, j + 1) });
      i = j + 1;
    } else {
      // collect until next " or //
      let j = i;
      while (j < raw.length && !(raw[j] === '"') && !(raw[j] === '/' && raw[j+1] === '/')) j++;
      parts.push({ type: 'code', text: raw.slice(i, j) });
      i = j;
    }
  }

  return parts.map(p => {
    if (p.type === 'comment') return `<span class="hj-comment">${escHtml(p.text)}</span>`;
    if (p.type === 'string')  return `<span class="hj-string">${escHtml(p.text)}</span>`;
    // code: escape first, then apply keyword/type spans
    return escHtml(p.text)
      .replace(_HJ_KEYWORDS, '<span class="hj-keyword">$1</span>')
      .replace(_HJ_TYPES,    '<span class="hj-type">$1</span>');
  }).join('');
}

function snippetHtml(code) {
  if (!code) return '';
  return `<div class="java-snippet-wrap">
    <div class="java-snippet-label">JAVA</div>
    <pre class="java-snippet-pre"><code>${highlightJava(code.trimEnd())}</code></pre>
  </div>`;
}

function loadAllAccuracy() {
  const result = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('quiz-acc:')) {
      result[key.slice(9)] = JSON.parse(localStorage.getItem(key));
    }
  }
  return result;
}
