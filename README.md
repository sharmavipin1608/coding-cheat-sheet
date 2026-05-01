# Senior SWE Interview Cheat-Sheet

An interactive reference for senior software engineering technical interviews — data structures, algorithmic patterns, recognition cues, Java snippets, and a pattern-recognition quiz.

**👉 [Open the app](https://sharmavipin1608.github.io/coding-cheat-sheet/)** ← GitHub Pages

---

## What's inside

### 9 tabs

| Tab | What it covers |
|---|---|
| **Data Structures** | 21 structures — Java type, complexity chips, senior insight, gotchas, concurrency |
| **Patterns** | 27 patterns — mental cue, time/space, DS pairings, classic problems, gotchas |
| **Recognition Cues** | 47 signal → pattern mappings — "if you see X, think Y" |
| **Pairings** | Pattern + DS rationale + 7 composite designs (LRU, Dijkstra, Streaming Median…) |
| **Senior-Only** | Concurrency cheat-sheet, DS senior insights, pattern gotchas, cue annotations |
| **Algorithms** | 26 algorithms — sorting, graph traversal, shortest path, MST, string matching |
| **Java** | Input size → complexity guide, memory reference, collections decision table, gotchas, code snippet gallery |
| **Dashboard** | Live coverage overview from confidence dots + quiz accuracy by pattern |
| **Quiz** | 154 problems (NeetCode 150) — pick pattern + DS, track accuracy, see weak spots |

### Key features

- **Confidence dots** on every row — click to cycle ⚫ not reviewed → 🟡 shaky → 🟢 know cold. Persisted in `localStorage`.
- **Daily Scan mode** — hides rows you've marked know-cold so you only review weak spots.
- **Study / Scan modes** — Study expands rows on click; Scan is dense read-only.
- **Filter chips** — by category, complexity tier, confidence level.
- **Search** — fuzzy match across name, cues, when-to-use, classic problems.
- **Java snippets** — 30 canonical implementations with syntax highlighting (Union-Find, Trie, LRU Cache, BFS/DFS, Dijkstra, KMP, all binary search templates, backtracking, DP skeletons…).
- **Cross-references** — clicking a DS or pattern tag jumps to that row in its tab.
- **Quiz** — 10 questions per session, single/multi-select by difficulty, accuracy tracked per pattern.

---

## Repository layout

```
index.html              ← app entry point
styles.css              ← dark-only theme (matches python-guide)
utils.js                ← helpers: escHtml, getTier, chipHtml, highlightJava…
render.js               ← all tab rendering functions
quiz.js                 ← quiz state and logic
app.js                  ← controller: state, routing, filter/search

data-structures.yaml    ← 21 structures (source of truth)
patterns.yaml           ← 27 patterns
recognition-cues.yaml   ← 47 signal → pattern cues
pairings.yaml           ← pattern + DS pairings + composites
algorithms.yaml         ← 26 algorithms
problems.yaml           ← 154 problems (NeetCode 150)
java-snippets.yaml      ← 30 Java code templates

cheatsheet.md           ← static Markdown reference (GitHub-readable)
CLAUDE.md               ← project context for AI-assisted development
```

## Running locally

```bash
git clone https://github.com/sharmavipin1608/coding-cheat-sheet.git
cd Coding-cheat-sheet
python3 -m http.server 8000
# open http://localhost:8000
```

The app uses `fetch()` to load YAML files — requires HTTP, not `file://`.

## Tech

Vanilla JS, no framework, no build step. YAML loaded at runtime via [js-yaml CDN](https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js). State persisted in `localStorage`. Deployable directly to GitHub Pages.

## License

Personal study material. Use freely.
