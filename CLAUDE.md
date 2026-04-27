# CLAUDE.md — Project Context for Claude Code

## What this project is

A senior-software-engineer interview cheat-sheet — content covers data structures, algorithmic patterns, recognition cues, and pattern-DS pairings. It will eventually serve three use cases:

1. **Daily 5-minute scan** — review weak spots, build pattern-recognition speed
2. **Pre-interview deep prep** — full reference
3. **Active practice** — quiz feature where I'm given a problem and pick the right pattern + DS combination

The owner is a senior-level Java backend engineer. Default code samples to **Java**, default tone to **concise and senior-level** — no hand-holding, no "first, let's understand variables" preamble.

## Repository layout

```
interview-cheatsheet/
├── data/                       ← source of truth (YAML)
│   ├── data-structures.yaml
│   ├── patterns.yaml
│   ├── recognition-cues.yaml
│   ├── pairings.yaml
│   └── problems.yaml           ← starter; expand later
├── cheatsheet.md               ← human-readable rendered version
├── index.html                  ← (TO BUILD) interactive single-page app
├── styles.css                  ← (TO BUILD) styles + color tiers
├── app.js                      ← (TO BUILD) loads YAML, renders, filters
├── README.md                   ← (TO BUILD) for GitHub Pages visitors
└── CLAUDE.md                   ← this file
```

## Critical principle: YAML is the source of truth

- `data/*.yaml` files are the **only** source of truth.
- `cheatsheet.md` is a generated/maintained view of the same data, structured for direct GitHub viewing.
- The HTML app reads YAML at runtime via `js-yaml` (CDN, no build step).
- **Never** hand-edit `cheatsheet.md` to add new entries — add to YAML, then regenerate the relevant section in the markdown.

## Color palette (consistent across MD and HTML)

**Visual reference:** owner's [Python guide](https://sharmavipin1608.github.io/python-guide/index.html) — match that visual feel exactly. The full stylesheet is included as `styles-reference.css` in the repo root for inspection. Reuse its palette, typography, spacing, and component patterns.

### Theme: dark-only

Match python-guide. Do **not** add a light mode — visual consistency across the owner's guides matters more than user choice here.

### Core palette (from styles.css)

```css
:root {
  /* base */
  --bg:            #0d0d0d;   /* page background */
  --surface:       #141414;   /* cards, plan-box, qr-item */
  --surface-alt:   #0a0a0a;   /* shell-block, deeper inset */
  --border:        #2a2a2a;   /* default borders */
  --border-soft:   #1f1f1f;   /* dividers within cards */

  /* text */
  --text:          #e0e0e0;   /* default body */
  --text-muted:    #c0c0c0;   /* paragraph body */
  --text-dim:      #888;      /* meta info */
  --text-faint:    #555;      /* faint labels (qr-label) */

  /* accents (already used in python-guide — reuse, don't reinvent) */
  --primary:       #f0e040;   /* yellow — links, h1, primary highlight */
  --secondary:     #40e0b0;   /* teal — h3, success, takeaways */
  --accent-warn:   #ff6b35;   /* orange — projects, stretch-box */
  --accent-blue:   #7090ff;   /* blue — Java-related elements */
}
```

### Typography (from styles.css)

```css
body { font-family: 'Syne', sans-serif; line-height: 1.7; }
code, pre, .mono { font-family: 'JetBrains Mono', monospace; }
```

Load via Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
```

### Complexity tier colors (background-tinted cell or chip)

These extend the `.callout` / `.callout-teal` / `.stretch-box` patterns already in styles.css.

| Tier | Range | Background | Border (left, 3px) | Text |
|---|---|---|---|---|
| 🟢 Green | O(1), O(log n), O(α(n)) | `#0f1a18` | `#40e0b0` | `#40e0b0` |
| 🟡 Yellow | O(n), O(n log n), O(L), O(V+E) | `#1a1410` | `#f0e040` | `#f0e040` |
| 🟠 Orange | O(n²), O(V²) | `#1a120a` | `#ff6b35` | `#ff6b35` |
| 🔴 Red | O(2ⁿ), O(n!), O(n·W) | `#1a0a0a` | `#ff5050` | `#ff8a8a` |

For inline complexity chips inside table cells, reduce padding and use a smaller font, but keep the same color tokens.

### Category accent colors (left border of category section / card)

Reuse the existing 4-color accent system from python-guide rather than introducing new colors.

| Category (DS) | Color | CSS var |
|---|---|---|
| Linear | `#7090ff` (blue) | `--accent-blue` |
| Hash-Based | `#f0e040` (yellow) | `--primary` |
| Trees & Heaps | `#40e0b0` (teal) | `--secondary` |
| Graphs | `#ff6b35` (orange) | `--accent-warn` |
| Advanced | `#c060ff` (purple — new, only addition) | `--accent-purple` |

For pattern categories (8 of them), reuse the same 5 colors and let two patterns share. Or use the same accent for all pattern category headers and rely on the category text label for distinction. Whichever the implementer prefers.

### Confidence dots (per-row, persisted in localStorage)

Reuse existing tokens — no new colors:

- ⚫ Gray `#555` (`--text-faint`) — not yet reviewed
- 🟡 Yellow `#f0e040` (`--primary`) — shaky / need to review
- 🟢 Teal `#40e0b0` (`--secondary`) — know cold

These drive "daily scan mode" which hides teal-marked rows.

### Reusable component patterns from styles.css

The python-guide stylesheet already defines several patterns the app should mirror — copying class names + structure keeps visual consistency:

| Component | Class | Use it for |
|---|---|---|
| Card section | `.plan-box` | Container for each table or grouping |
| Quick-reference grid | `.qr-grid` + `.qr-item` | Recognition cues page (compact, scannable) |
| Side-by-side comparison | `.side-by-side` | Pattern + DS pairings (Pattern \| Why) |
| Inline data table | `.dunder-table` / `.decision-table` | The complexity tables |
| Highlighted box | `.callout` (yellow) | Senior insights |
| Highlighted box (good) | `.callout-teal` | "Recommended" / best practice |
| Highlighted box (warn) | `.stretch-box` | Gotchas / warnings |
| Code block | `.python-block` / `.java-block` | Java code snippets (use `.java-block`) |
| Sticky topnav | `.topnav` | App nav with section links |

Use these classes verbatim where possible. Adding new components is fine; renaming or restyling existing ones is not.

### Layout constraints

- `max-width: 900px` for main content (matches python-guide)
- `padding: 40px 32px 80px` desktop, `24px 16px 60px` mobile
- Border-radius: `8px` for inline components, `10px` for prominent cards
- Mobile breakpoint: `600px` (matches python-guide)

## HTML app — what to build (Phase 2)

Build a single-page app, vanilla JS, no framework. Mobile-friendly — match python-guide's `600px` breakpoint. Tables collapse to stacked cards below 600px (each row becomes a tappable card).

### Structure

- Top nav: 5 tabs corresponding to the 5 sections of `cheatsheet.md`
  - Data Structures
  - Patterns
  - Recognition Cues
  - Pairings
  - Senior-Only
- Sticky search bar (filters across all tabs)
- Mode toggle: "Study mode" (full detail) vs "Scan mode" (collapsed, dense)
- Daily-scan button: hides rows the user has marked teal (i.e., "know cold")

### Required interactions

1. **Click a row** → expand to show: full description, gotchas, classic problems, Java code snippet (when added), link to LeetCode
2. **Click the confidence dot** → cycles gray → yellow → teal → gray. Persist per-row in localStorage keyed by `<file>:<id>`.
3. **Filter chips** at the top of each table — by category, by complexity tier, by confidence
4. **Cross-references render as links** — clicking `[two-pointers]` in pairings jumps to that pattern in the Patterns tab
5. **Search** — fuzzy match across name, when_to_use, mental_cue, classic_problems

### Tech choices

- **YAML loading:** `https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js`
- **No framework:** vanilla DOM + minimal templating. Keeps the project zero-dependency for GitHub Pages.
- **Persistence:** `localStorage` only (no backend)
- **Styling:** plain CSS with CSS variables for the color tiers. No Tailwind unless I add a build step (don't).

### Accessibility

- All interactive elements keyboard-navigable
- Color tiers must also have a text label or icon — never color-only (red-green colorblindness). Use the emoji 🟢🟡🟠🔴 prefix or a `Tier-N` text class alongside the color.
- Dark theme only (matches python-guide). Do not implement `prefers-color-scheme` — keep visuals consistent across the owner's guide collection.
- Sufficient contrast on the dark theme: body text `#e0e0e0` on `#0d0d0d` ≈ 14:1 (AAA). Don't drop below `#888` for important text.

## Quiz module (Phase 3 — separate concern)

A separate tab in the same app. Uses `data/problems.yaml`.

### UX flow

1. User clicks "Start quiz" → picks difficulty (Easy / Medium / Hard / Mixed)
2. App shows: problem name + difficulty badge + (optional) brief description
3. Two questions:
   - "Which pattern(s) apply?" — multi-select for Hard, single-select for Easy/Medium
   - "Which data structure(s)?" — multi-select for Hard
4. After answer:
   - Show correct answer
   - Show explanation (`blurb` from problems.yaml)
   - Link to relevant rows in Patterns / DS tabs (cross-reference)
   - Track accuracy per pattern in localStorage
5. After 10 questions: show summary — "You're shaky on Topological Sort, review it"

### Scoring rule

- Easy/Medium: full credit if pattern + DS both correct
- Hard: full credit if user picked all required patterns + DS; partial credit if got the primary right

### Problem data backfill

- Seed: NeetCode 150 list (already pattern-tagged on GitHub: `neetcode-gh/leetcode`)
- Add: Blind 75 (some overlap)
- Manual additions: hard combination problems (Trie+DFS, two heaps, etc.)
- **Do NOT** scrape LeetCode directly — fragile, no official API, legally gray.

## YAML file conventions

### Required fields per entity

**`data-structures.yaml`** — every structure must have:
- `id` (kebab-case, stable, used for cross-references)
- `name` (display)
- `category` (from `categories:` list)
- `java` (concrete Java type)
- `operations` (map of operation → complexity string)
- `space`
- `when_to_use` (list)
- `senior_insight` (multiline string — this is what differentiates senior from mid)
- Optional: `concurrency`, `gotchas` (list)

**`patterns.yaml`** — every pattern must have:
- `id`, `name`, `category`
- `when_to_use` (list)
- `mental_cue` (single short phrase — used for daily scan)
- `time`, `space`
- `ds_pairings` (list of DS ids)
- `classic_problems` (list)
- Optional: `gotchas`

**`problems.yaml`** — every problem must have:
- `id`, `name`, `leetcode_num` (or null), `difficulty`
- `patterns` (list of pattern ids)
- `structures` (list of DS ids)
- `blurb` (1-3 sentence explanation of the canonical approach)
- Optional: `composite` (name from pairings.yaml)

### When adding new entries

1. Add to the relevant YAML file
2. Update `cheatsheet.md` in the corresponding section (manually, for now)
3. The HTML app picks up changes on reload — no rebuild

## Style guide for content

- **Be terse.** This is for someone with 8+ years of experience. Cut every phrase that doesn't earn its place.
- **Lead with the trigger, not the explanation.** "Sorted array + pair?" → Two Pointers. Not "Two Pointers is a pattern useful when..."
- **Java specifics matter.** Mention `ArrayDeque` over `Stack`, `ConcurrentHashMap` over `Hashtable`, `LinkedHashMap` for LRU.
- **Senior insight per item.** What does someone at staff level know that someone at L4 doesn't? That's the gold.
- **No emojis in YAML data.** They go in the rendered MD/HTML for the color tiers, but YAML stays clean for parsing.

## Common tasks Claude Code might do

- "Add a new pattern called X" → edit `patterns.yaml`, then add a row to the right table in `cheatsheet.md`
- "Add 10 problems from NeetCode array section" → expand `problems.yaml`
- "Build the HTML app" → create `index.html`, `styles.css`, `app.js` per the spec above
- "Add a Java code snippet field to patterns" → add `java_snippet:` field, update HTML expand-row template
- "Add Dijkstra and Bellman-Ford as graph algorithms" → these are algorithms not patterns; consider a separate `algorithms.yaml` or extend `patterns.yaml` with a category

## What NOT to do

- Do **not** restructure the YAML schema without updating CLAUDE.md and the markdown in lockstep.
- Do **not** introduce a build step (Webpack, Vite, etc.) — the appeal is that this is editable directly on GitHub.
- Do **not** add any framework (React, Vue, Svelte). Vanilla JS keeps the project portable.
- Do **not** scrape LeetCode for problems — use static curated lists.
- Do **not** add tracking, analytics, or external services beyond the YAML CDN.
- Do **not** invent new patterns or DS without asking — this list is intentionally curated for senior FAANG-style interviews.
