# DESIGN_CONTRACT.md — Spatial Intelligence Atlas

**Target version:** 0.3.0 · **Status:** GATE 1 — IN REVIEW.

The deployed `v0.2.1` stays governed by `DESIGN_CONTRACT.md` at tag
`v0.2.1`. This document constrains v0.3.0 **form**; `SPEC.md` constrains
meaning and behaviour.

Everything here is a limit, not a suggestion. "MUST" and "MUST NOT" are
binding. A number is a hard value unless it is marked as a target. Where
something is not covered, choose the more restrained option.

**Reused from PR #14** (`1246293`, not merged):

- the document-first form;
- the reading order;
- the always-present verification rail;
- first-cited source ordering;
- native `<details>` disclosure;
- "n of N" navigation;
- the 44 px target rule;
- the verification protocol.

---

## 1. Visual identity

### 1.1 Register

**A cartographic research monograph, on screen.** Paper and ink, hairline
rules, numbered sections, plates with full cartographic apparatus, figures
with credit lines, and a coordinate line under every situated title. It
should read as a carefully set atlas from a geographic institute, not as a
portfolio, a dashboard or a product page.

The identity is built from six elements. All of them are required.

| # | Element | What it is | Where it is specified |
|---|---|---|---|
| 1 | Paper-and-ink palette | Warm paper (light) and night plate (dark). Chrome is achromatic. | §3 |
| 2 | Three-voice typography | Serif for reading, sans for interface, mono for coordinates, identifiers and pins | §4 |
| 3 | Numbered sections | `01 Question`, `02 Territory`…, set as a mono number plus a sans label above a hairline | §6.3 |
| 4 | Cartographic plates | Achromatic study-area plates with graticule ticks, scale bar, grid-north mark and caption block | §8 |
| 5 | Coordinate line | `40.3918° N · 3.7372° W · EPSG:25830` under situated titles, from offline geometry metadata | §8.4 |
| 6 | Research figures | Original figures on a paper mat, numbered, with caption and credit line | §9 |

Each element carries information. None of them is decoration.

### 1.2 Governing rules

- **Colour carries meaning.** Chromatic colour is reserved for the six
  evidence `input_kind`s (§3.4). Everything else, including chrome, plates,
  outcomes, classes, links and focus, is achromatic. Research figures keep
  their original colours (§9).
- **Hairline over fill.** Structure is drawn with 1 px rules. Fills are
  limited to plate study areas, the figure mat and the current-filter state.
- **The document is the page.** Reading measure governs layout. There is no
  canvas, hero image or card grid.
- **Nothing moves unless the reader acts** (§10).

### 1.3 Forbidden (contract violations)

- **Sci-fi or "geo-tech" register:** neon, glow, scanlines, HUD frames,
  corner brackets, targeting reticles, radar sweeps, animated grids, globes,
  3D terrain, starfields.
- **SaaS or dashboard register:** KPI tiles, big-number cards, deltas,
  donut or gauge charts, coloured status pills, gradient buttons, toasts,
  skeleton shimmer, onboarding tours.
- **Portfolio register:** a hero with a headshot, a skills grid, logos,
  testimonials, "hire me" calls to action, social icons.
- **Game register:** scores, badges, progress bars, levels, confetti.
- **Decoration:**
  - drop shadows used for depth, glassmorphism, blur;
  - gradients and textures, background images, stock imagery, illustration;
  - emoji, icon fonts;
  - outcome icons (ticks, crosses, warning signs).
- **Typographic decoration:** text shadow, outlined text, italic for UI
  emphasis, letter-spacing outside the `label` step.

---

## 2. Layout

The wireframes in this document fix structure, order and proportion. Every
coordinate, count, date, tolerance, hash, provenance string and pin shown
in them is an **illustrative placeholder**, not frozen content. Real values
come only from the Gate 2 freeze.

### 2.1 Grid and breakpoints

| Name | Width | Outer gutter | Columns | Column gap |
|---|---|---|---|---|
| compact | 360–639 px | 16 px | 4 | 16 px |
| medium | 640–1023 px | 24 px | 8 | 24 px |
| wide | ≥ 1024 px | 40 px | 12 | 24 px |

- The page content is capped at **1280 px** and centred.
- The reading measure is capped at **68 ch** (about 680 px at body size).
- The minimum supported width is 360 px. There is **no horizontal page
  scroll** at any width of 360 px or more.
- Wide tables become stacked records at compact width (§6.8). Tables never
  scroll horizontally.

### 2.2 Spacing scale

All spacing values come from one scale.

| Token | px |
|---|---|
| `--s1` | 4 |
| `--s2` | 8 |
| `--s3` | 12 |
| `--s4` | 16 |
| `--s5` | 24 |
| `--s6` | 32 |
| `--s7` | 48 |
| `--s8` | 64 |
| `--s9` | 96 |

| Use | Token |
|---|---|
| Between numbered sections in a dossier | `--s8`; `--s7` at compact |
| Between a section heading and its content | `--s4` |
| Between evidence records, outputs and timeline entries | `--s5` |
| Inside components | `--s2` to `--s4` |
| Page top below the header | `--s7` wide, `--s6` medium and compact |

### 2.3 Rules, radius, elevation

- **Rules:** 1 px `--rule` between rows; 1 px `--rule-strong` above
  numbered sections and around plates.
- **Radius:** 0 everywhere, except **2 px** on buttons, checkboxes and the
  figure mat. There are no pills.
- **Elevation:** none. No shadows. Separation comes from rules and space.

### 2.4 Global frame (wide)

```
┌──────────────────────────────────────────────────────────────────────┐
│ ▦ Spatial Intelligence Atlas   Research Atlas Evidence Outputs       │ 64px
│   Research Explorer · v0.3.0   Timeline About                        │ rule
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   VIEW CONTENT  (max 1280, centred, 12 columns)                      │
│                                                                      │
├──────────────────────────────────────────────────────────────────────┤
│ v0.3.0 · schema 0.3.0 · reviewed 2026-… · How to cite · Licences     │
│ Inputs, status, and outcomes are separate. Real input does not       │
│ establish validation or decision sufficiency.                        │
└──────────────────────────────────────────────────────────────────────┘
```

The header is static, not sticky, so it never covers content or the focus
ring. At compact width the navigation wraps onto a second row below the
wordmark. There is no hamburger menu and no hidden navigation.

### 2.5 Overview `#/` (wide)

```
  SPATIAL INTELLIGENCE ATLAS                         ← label, ink-3
  Evidence-first geospatial research,                ← display, serif
  documented separately.
  ─────────────────────────────────────────────────── rule-strong
  What this is · How to read a dossier · What it does NOT claim   (3 cols)
  ─────────────────────────────────────────────────── rule
  ⓘ Separate research items. Relations appear only when documented
    and typed; none exist in this release.                (notice)

  DOCUMENTED RESEARCH                                ← label
  ┌────────────┐ HATI-Madrid pilot            [verdict frozen at Gate 2] ›
  │ plate thmb │ Madrid · 40.41° N 3.70° W
  └────────────┘ Thermal representation as a decision variable…
  ─────────────────────────────────────────────────── rule
  ┌────────────┐ HATI pedestrian heat extension  [ABSTAIN / NO ROBUST…] ›
  │ plate thmb │ Madrid — Atocha to Puerta de Alcalá
  └────────────┘ …
  (… SNTO — PNSG [INSUFFICIENT EVIDENCE] · Network accessibility [MODIFY])

  RESEARCH PLATFORMS                     INSTRUMENTS
  Madrid Urban Evidence Lens ›           FieldOS  [FUNCTIONAL TEST] ›
  SNTO observatory ›                     No case-specific territory
```

- Each item row has a 160 × 120 plate thumbnail, the title (heading step),
  the territory and coordinate line (micro), the summary (body-s) and the
  verdict label (§6.4).
- Items without geometry show no thumbnail. They never get a placeholder
  image.
- Platforms and instruments sit in a separate two-column band below. They
  are never interleaved with documented research.

### 2.6 Research index `#/research`

The research index is the Overview list without the introduction, as a
table at wide and medium width.

```
  Research                                                  ← title
  Seven items, grouped by class. Not ranked.                ← body-s
  DOCUMENTED RESEARCH
  Title                 Territory        Result             Outputs
  HATI-Madrid pilot     Madrid           (Gate 2)           Preprint · DOI
  HATI pedestrian ext.  Madrid — Atoc…   ABSTAIN / NO RO…   (Gate 2)
  SNTO — PNSG           Guadarrama       INSUFFICIENT EV…   (Gate 2)
  Network access.       San Isidro       MODIFY             Dataset · DOI
  RESEARCH PLATFORMS …  INSTRUMENTS …
```

- Rows are in dataset order. There are no sortable headers.
- At compact width each row becomes a stacked record (§6.8).
- Table cells never truncate the verdict label. The `…` in the sketch above
  is only for the sketch; real cells wrap.

### 2.7 Dossier `#/research/<id>` (wide)

```
  Research / HATI pedestrian heat extension                 ← breadcrumb
  DOCUMENTED RESEARCH · FROZEN · v… · reviewed 2026-09-22   ← label/micro
  HATI — Pedestrian Heat Extension                          ← title, serif
  40.4120° N · 3.6905° W · EPSG:25830                       ← coordinate line
  [ABSTAIN / NO ROBUST DIFFERENCE]               2 of 7 ‹ ›  Print
  ═══════════════════════════════════════╤════════════════════════════
  01 QUESTION                            │ VERIFICATION         (rail)
  Across the two frozen …?               │ 1 HATI Gate 3B decision
                                         │   closeout · c69688e7 ·
  02 TERRITORY                           │   accessed 2026-09-22 ·
  ┌──────────────────────────┐           │   public ↗
  │ plate (reading width)    │           │ 2 HATI project status …
  └──────────────────────────┘           │
  03 RESULT                              │ OUTPUTS
  [ABSTAIN / NO ROBUST DIFFERENCE]       │ —
  The route-difference sign reversed …   │
  04 CLAIM CEILING                       │ LICENCES
  Neither route is established as …      │ Code MIT · Data … · Text …
  05 METHODOLOGY                         │
  06 FINDINGS  (+ uncertainty)           │ REPRODUCIBILITY
  07 FIGURES                             │ inspectable · instructions ↗
  08 EVIDENCE                            │
  09 LIMITATIONS                         │ HOW TO CITE
  10 OUTPUTS · 11 REPRODUCIBILITY        │ Karahrodi, S. (2026)…
  ───────────────────────────────────────┴────────────────────────────
  ‹ 1 of 7  HATI-Madrid pilot          SNTO — PNSG  3 of 7 ›
```

- Reading column: 7 columns, capped at 68 ch. Rail: 4 columns, offset by
  1 column, minimum 280 px. The rail scrolls with the page; it is not
  sticky.
- The rail repeats only the verification list, outputs, licences,
  reproducibility and the citation. The reading column carries the full
  §7 order of `SPEC.md`. At medium and compact width, the rail sections
  appear in-flow after the reading column, in the same order. Nothing is
  duplicated in-flow.

### 2.8 Dossier at compact width (360 px)

```
  ▦ Spatial Intelligence Atlas
  Research Atlas Evidence Outputs
  Timeline About
  ─────────────────────────────
  Research / HATI pedestrian…
  DOCUMENTED RESEARCH · FROZEN
  HATI — Pedestrian Heat
  Extension
  40.4120° N · 3.6905° W
  [ABSTAIN / NO ROBUST
   DIFFERENCE]
  2 of 7 ‹ ›      Print
  ── 01 QUESTION ───────────────
  …
  ── 02 TERRITORY ──────────────
  [plate, full width, ticks off]
  …  (sections 03–11)
  ── VERIFICATION ──────────────
  ── HOW TO CITE ───────────────
```

### 2.9 Atlas `#/atlas` and plate `#/atlas/<territory-id>`

```
  Atlas                                                   ← title
  Study areas drawn from published, licensed geometry only.
  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
  │   plate 1     │ │   plate 2     │ │   plate 3     │   (3 cols wide,
  │               │ │               │ │               │    2 medium,
  └───────────────┘ └───────────────┘ └───────────────┘    1 compact)
  Plate 1 · Madrid — barrio 113 San Isidro  (caption, small)
  …
  TERRITORIES WITHOUT A PLATE
  Madrid (central pilot area) — text only, reason stated

  PLATE PAGE
  Atlas / Plate 2 · Madrid — Atocha to Puerta de Alcalá
  ┌──────────────────────────────────────────────┐  ← plate, 8 cols
  │ 40.41°N ┬ ticks                         ┬    │     max 880 px
  │         [ study area / routes ]              │
  │  ▕ 0 ──── 500 m      GN ↑ grid north         │
  └──────────────────────────────────────────────┘
  CAPTION BLOCK (§8.3)
  ITEMS SITUATED HERE → HATI pedestrian heat extension ›
```

### 2.10 Evidence Explorer `#/evidence`

```
  Evidence                                                ← title
  Every documented evidence record. Filtering never reorders.
  ┌ FILTERS (3 cols) ──┐  Showing 9 of 23 records   Clear filters
  │ INPUT KIND         │  ────────────────────────────────────────────
  │ ☐ ● Observed       │  Record              Item         Kind / Subst.
  │ ☐ ◐ Acquired       │  Real Sentinel-2 …   SNTO — PNSG  ◐ ACQUIRED
  │ …                  │                                   SOURCE-STATED
  │ SUBSTANTIATION     │  Limitation: Satellite signal is not …
  │ ☐ Source-stated …  │  ────────────────────────────────────────────
  │ ITEM · TERRITORY   │  …
  └────────────────────┘
```

- At wide width the filter column takes 3 columns and the table 9.
- At medium and compact width the filters sit above the table in a native
  `<details>` ("Filters (2 active)"), and each row becomes a stacked record.
- The count is a plain fact ("Showing 9 of 23 records"). It is never a
  percentage, a bar or a score.

### 2.11 Outputs, Timeline, About

```
  OUTPUTS                                 TIMELINE
  HATI-Madrid pilot                       2026-11-20  HOLD — municipal-
  Karahrodi, S. (2026). Thermal …                     indicator audit ›
  Type     Preprint                                   Network pilot
  Review   Not peer-reviewed              2026-11-16  MODIFY — Network
  ID       DOI 10.5281/zenodo.22707470 ↗              pilot ›
  ─────────────────────────────           2026-11-16  Dataset published
  Network accessibility pilot             …
  … Type Dataset · Review Not peer-
  reviewed · ID DOI 10.5281/… ↗           (date column: micro mono, 96 px)
```

About is a single reading column with numbered sections:

1. what the Atlas is;
2. how to read a dossier;
3. vocabularies (input kinds with glyphs, substantiation, outcome types,
   classes, editorial status);
4. non-integration;
5. how to cite;
6. licences;
7. governance and gates;
8. version history.

---

## 3. Colour

### 3.1 Theme selection

- Light ("paper") is the default.
- Dark ("night plate") applies under `prefers-color-scheme: dark`.
- Print always uses light.
- There is no theme toggle, because persistence is forbidden. The page
  declares `color-scheme: light dark`.

### 3.2 Achromatic tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F7F6F2` | `#0F1113` | page ground |
| `--surface` | `#FFFFFF` | `#15181B` | rail, filter panel, figure mat (light) |
| `--surface-2` | `#EEECE6` | `#1B1F23` | active filter, table header |
| `--rule` | `#D6D3CB` | `#2A2F35` | row hairlines (decorative) |
| `--rule-strong` | `#A8A49A` | `#4A525B` | section and plate frames (decorative) |
| `--ink` | `#17191C` | `#E8E6E3` | primary text, focus ring, plate strokes |
| `--ink-2` | `#3F4349` | `#B4B6BA` | secondary text |
| `--ink-3` | `#5E636A` | `#8C9096` | muted text, micro metadata (the floor) |
| `--plate-fill` | `#E6E3DB` | `#1E2328` | study-area fill |
| `--plate-context` | `#7F848B` | `#6E757D` | context boundaries, graticule ticks |
| `--mat` | `#FFFFFF` | `#F4F2EC` | figure mat (dark keeps a light mat, §9) |

### 3.3 Computed contrast (WCAG 2.x relative luminance)

| Pair | Light | Dark | Requirement |
|---|---|---|---|
| `--ink` on `--bg` / `--surface` / `--surface-2` | 16.29 / 17.61 / 14.91 | 15.19 / 14.31 / 13.31 | text ≥ 4.5 |
| `--ink-2` on `--bg` / `--surface` / `--surface-2` | 9.20 / 9.95 / 8.42 | 9.32 / 8.78 / 8.16 | text ≥ 4.5 |
| `--ink-3` on `--bg` / `--surface` / `--surface-2` | 5.60 / 6.05 / 5.12 | 5.90 / 5.55 / 5.17 | text ≥ 4.5 |
| `--ink` on `--plate-fill` (labels inside a study area) | 13.73 | 12.71 | text ≥ 4.5 |
| `--ink-3` on `--plate-fill` | 4.72 | 4.93 | text ≥ 4.5 |
| `--plate-context` on `--bg` / `--surface` | 3.48 / 3.77 | 4.06 / 3.82 | graphics ≥ 3 |
| Focus ring (`--ink`) on `--bg` | 16.29 | 15.19 | graphics ≥ 3 |

`--ink-3` is the text floor in both themes: no text token may be lighter in
light mode or darker in dark mode. `--rule`, `--rule-strong` and
`--plate-fill` are decorative and MUST NOT carry text or be the only cue
for meaning.

### 3.4 Evidence `input_kind` palette: the only chromatic UI colour

Each kind has a colour **and** a dash pattern **and** a glyph **and** a
text label. All four are required everywhere a kind is shown.

| Kind | Dark | vs `--bg` / `--surface` | Light | vs `--bg` / `--surface` | Dash | Glyph |
|---|---|---|---|---|---|---|
| OBSERVED | `#3FA98C` | 6.55 / 6.17 | `#1E7A62` | 4.84 / 5.23 | solid | filled circle |
| ACQUIRED | `#5B9BD5` | 6.39 / 6.02 | `#2B67A3` | 5.44 / 5.88 | `6 3` | half circle |
| DERIVED | `#C9A227` | 7.82 / 7.37 | `#7F6400` | 5.21 / 5.64 | `2 3` | ringed circle |
| SIMULATED | `#D98B3A` | 6.94 / 6.54 | `#A55A14` | 4.77 / 5.16 | `8 3 2 3` | diamond |
| REPORTED | `#8B9099` | 5.90 / 5.56 | `#5F656E` | 5.43 / 5.88 | `1 3` | open circle |
| UNESTABLISHED | `#C46A78` | 5.12 / 4.82 | `#A1435A` | 5.60 / 6.06 | `3 3` | slashed circle |

- The dark values are the v0.2 palette, unchanged. The light values are new,
  with the same hue order.
- Kind colour is applied only to the glyph and to the evidence record's
  2 px left rule (§6.5). The kind's **text label stays in `--ink`**.
- Substantiation, outcome, class, editorial status and lifecycle status are
  text only and get no colour.
- The Atlas must remain fully legible in greyscale: kinds stay
  distinguishable by dash pattern and glyph alone.

### 3.5 Forced colours

Under `forced-colors: active` the page uses system colours. Kind glyphs,
dash patterns, the verdict outline and focus outlines stay visible, set
with `CanvasText` and `Highlight`. No meaning depends on a colour that
forced-colours mode removes.

---

## 4. Typography

### 4.1 Families: three system stacks, no web fonts

```
--font-serif: Charter, "Bitstream Charter", "Sitka Text", "Iowan Old Style",
              Cambria, Georgia, serif;
--font-sans:  ui-sans-serif, system-ui, -apple-system, "Segoe UI",
              "Helvetica Neue", Arial, sans-serif;
--font-mono:  ui-monospace, "SF Mono", "Cascadia Mono", Consolas,
              "Liberation Mono", monospace;
```

| Family | Used for |
|---|---|
| Serif | titles, reading prose, captions, citations |
| Sans | navigation, labels, tables, controls |
| Mono | coordinates, CRS, ids, pins, dates, section numbers |

There is no `@font-face` and no font file. The serif fallback (Georgia or
Cambria) is the tested baseline, and every metric below must hold with it.

### 4.2 Scale: eight steps, rem-based

All sizes are rem-based, so they respect the reader's font setting.

| Step | Size / line | Family | Weight | Use |
|---|---|---|---|---|
| `display` | 2.5 / 2.75 rem (40/44) | serif | 400 | Overview statement only |
| `title` | 1.875 / 2.25 rem (30/36) | serif | 400 | view and dossier titles (the `<h1>`) |
| `heading` | 1.3125 / 1.75 rem (21/28) | serif | 600 | item titles in lists, plate titles |
| `body` | 1.0625 / 1.75 rem (17/28) | serif | 400 | reading prose |
| `body-s` | 0.9375 / 1.375 rem (15/22) | serif | 400 | summaries, captions, citations |
| `ui` | 0.9375 / 1.375 rem (15/22) | sans | 400, 600 | navigation, tables, controls, filters |
| `label` | 0.75 / 1 rem (12/16) | sans | 600 | section labels, class, verdict, kind names |
| `micro` | 0.75 / 1 rem (12/16) | mono | 400 | coordinates, pins, dates, section numbers |

- At compact width, `display` becomes 2 / 2.375 rem and `title` becomes
  1.625 / 2 rem. No other step changes.
- The minimum rendered size is 12 px.
- Two weights only: 400 and 600.

### 4.3 Case, numerals, measure

- **Uppercase** is used only in the `label` step, with +0.08 em tracking.
  Everything else is sentence case. Canonical casing is kept (HATI, SNTO,
  Sentinel-2, PNSG).
- **Numerals:** `font-variant-numeric: tabular-nums` on dates, counts,
  coordinates and pins. Serif prose uses the font's default numerals.
- **Measure:** at most 68 ch for prose; 48 ch for captions.
- **Hyphenation:** `hyphens: auto` only in the reading column, with
  `lang="en"`.

---

## 5. Navigation

### 5.1 Primary navigation

The primary navigation has six text links in this order: Research, Atlas,
Evidence, Outputs, Timeline, About. The wordmark links to the Overview.

| State | Treatment |
|---|---|
| default | `ui` 400, `--ink-2`, no underline |
| hover | `--ink`, 1 px underline at a 4 px offset |
| keyboard focus | 2 px solid `--ink` outline at a 2 px offset (same as every focusable element) |
| current (`aria-current="page"`) | `ui` 600, `--ink`, 2 px underline at a 6 px offset. Also set on the parent section: Research for a dossier, Atlas for a plate. |
| visited | same as default; no special colour |

### 5.2 In-page navigation

- **Breadcrumb** on dossiers and plates: `ui`, `--ink-3`, with " / " as
  the separator. The last crumb is plain text with `aria-current="page"`.
- **Previous / next:** text buttons reading "‹ 1 of 7 HATI-Madrid pilot"
  and "SNTO — PNSG 3 of 7 ›". Never arrow-only. There is no connector line.
- **Skip link:** "Skip to content" is the first focusable element. It is
  visually hidden until focused, then shown at top-left on `--surface` with
  the focus ring.

### 5.3 Links and external links

- In-text links use `--ink` with a 1 px underline at 3 px offset.
- External links end with "↗" in `micro`, and their accessible name ends
  with "(opens in a new tab)".
- Link colour does not change on visit.

### 5.4 Route changes

On a route change:

- the new view's `<h1>` (`tabindex="-1"`) receives focus;
- `document.title` becomes `<view or dossier title> — Spatial Intelligence Atlas`;
- a polite live region announces the title;
- the scroll position resets to the top, except for the back and forward
  buttons, where the browser restores it.

---

## 6. Components

All interactive targets are at least **44 × 44 px**. The focus ring is the
same everywhere: 2 px solid `--ink`, 2 px offset, never removed.

### 6.1 Wordmark

- A 16 px inline SVG mark: a square of three-by-three graticule cells, drawn
  in 1 px `--ink`.
- "Spatial Intelligence Atlas" set in `heading` serif 600, with "Research
  Explorer · v0.3.0" beneath it in `micro`.
- No logo file and no tagline beyond this.

### 6.2 Non-integration notice

- A `body-s` serif paragraph with a 2 px `--ink` left rule and 16 px left
  padding, without the ⓘ in the sketch (the sketch marks position only).
- Text: "Separate research items. Relations appear only when documented and
  typed; none exist in this release."
- On dossiers, a one-line form sits in the footer area of the reading
  column.

### 6.3 Numbered section heading

```
01  QUESTION
──────────────────────────────  rule-strong, 1px, full reading width
```

- The number is `micro` `--ink-3`; the name is `label` `--ink`.
- It sits 16 px above the content and 64 px below the previous section
  (48 px at compact).
- Each section is an `<h2>`. Numbers follow the `SPEC.md` §7 order for the
  item's class; omitted optional sections are skipped and the remaining
  numbers stay consecutive.

### 6.4 Verdict label and class label

- **Verdict:** the verbatim `verdict_label` in `label` step, `--ink` text,
  a 1 px `--ink` outline, 2 px 8 px padding, radius 0. It wraps and is
  never truncated. It is achromatic and icon-free, and it looks identical
  for every outcome type.
- **Class:** the class name as plain `label` text in `--ink-3`, with no
  outline, so it is visibly different from a verdict.
- **Lifecycle:** plain `label` text after a "·".

### 6.5 Evidence record

```
▌ ◐ ACQUIRED · SOURCE-STATED                   (label; glyph 12px)
▌ Real Sentinel-2 observations cover 21 PNSG campaign assets …   (body)
▌ Limitation — Satellite vegetation signal is environmental     (body-s,
▌ context, not visitor pressure …                                ink-2)
▌ Provenance — <publisher> · <dataset ref> · <licence>          (micro)
▌ ▸ Verbatim basis                                     (<details>, ui)
▌ Sources 1, 3                                         (micro, links)
```

- The left rule (▌) is 2 px, in the kind colour, using the kind's dash
  pattern (SVG or `border-image`). Glyph, rule and text label always
  appear together.
- The limitation is always visible.
- The `<details>` opens instantly, with no animation. When open, the basis
  is indented 16 px, in `--ink-2` serif, with a 1 px `--rule` left rule.

### 6.6 Output record

```
Karahrodi, S. (2026). Thermal representation as a decision …   (body-s)
TYPE      Preprint                                          (label / ui)
REVIEW    Not peer-reviewed
ID        DOI 10.5281/zenodo.22707470 ↗   ·  version DOI
          — or —   No persistent identifier · verified via <source> ↗
```

- The output is a `<dl>` with three rows: Type, Review and ID. They are
  never merged into one badge.
- "No persistent identifier" is written out in full. It is never shown as
  a dash or left blank.

### 6.7 Source entry (verification rail)

```
1  HATI Gate 3B evidence-sufficiency decision            (ui)
   closeout · c69688e7 · accessed 2026-09-22 · public ↗  (micro)
```

- Entries are numbered in first-cited order. Inline citations in the
  reading column use the same numbers (superscript-free, as "[1]" in
  `micro`).
- The pin shows 8 characters; the full value is in the accessible name.
- `restricted` sources cannot appear (I11).

### 6.8 Table and stacked record

- **Table (wide and medium):** `ui` text, the header row on `--surface-2`
  in `label` step, 1 px `--rule` row lines, 12 px vertical cell padding,
  top-aligned. No zebra striping and no row hover fill.
- **Stacked record (compact):** each row becomes a block. The first cell is
  set as `heading`-weight `ui` 600, and the remaining cells follow as
  `label: value` pairs. Records are separated by `--rule`.

### 6.9 Filter group (Evidence Explorer)

- A `<fieldset>` with a `<legend>` in `label` step. Each option is a native
  checkbox inside a 44 px row label.
- Kind options show their glyph next to the text.
- Selected options get a `--surface-2` row fill and 600 weight. This is the
  only fill-based state.
- "Clear filters" is a text button.
- The result count lives in a polite live region.

### 6.10 Buttons

- Text buttons only: "Print dossier", "Clear filters", previous and next.
- Style: `ui` 600, 1 px `--rule-strong` border, radius 2 px, 44 px minimum
  height, 12 px 16 px padding, transparent background.
- Hover: `--ink` border. There are no filled primary buttons.

### 6.11 Timeline entry

- A two-column grid: the date in `micro` (96 px wide), then the event in
  `ui`, followed by the item link.
- Events with the same date keep dataset order.
- There is no axis, no chart and no connector line.

### 6.12 States

| State | Treatment |
|---|---|
| **Loading** | Data loads from one same-origin file. Nothing renders until it has parsed. There is no spinner and no skeleton. If loading takes longer than 400 ms, a single `ui` line reads "Loading the Atlas data…". |
| **Data error** | The view title "The Atlas data could not be loaded", the local-server command from `README.md`, and the file path. Never a blank page. |
| **Not found** | "No view or dossier exists at this address", followed by a link to the Overview. |
| **No JavaScript** | A `<noscript>` block with the same explanation, plus a link to the repository. |
| **Empty filter result** | "No evidence records match these filters", followed by "Clear filters". |

---

## 7. Dossier detail rules

- **Header order:** class label, lifecycle, version and `reviewed_at` in
  `micro`; then the title; then the coordinate line; then the verdict
  label; then the previous/next control and the print button.
- **Inline citations:** "[n]" links jump to the rail entry. Those jumps are
  same-page anchors, not new interactions.
- **Findings:** each finding is a `body` paragraph. Its uncertainty sits
  directly beneath it as a `body-s` `--ink-2` paragraph prefixed
  "Uncertainty —". It is never placed in a tooltip or a footnote.
- **Platform dossiers** have no verdict area; the space below the title
  holds the role sentence instead.
- **Instrument dossiers** show "No case-specific territory" in `body-s` in
  place of the territory section.

---

## 8. Cartographic plates

### 8.1 Geometry handling

- Geometry is prepared **offline**. Files are clipped to the territory,
  simplified at a recorded tolerance, projected to the display CRS
  (`EPSG:25830` for every v0.3.0 territory), hashed, and committed under
  `data/geometry/`.
- The browser only scales metres into the SVG `viewBox`. There is no
  projection library, no tiles and no basemap.
- Plates are inline SVG with `role="img"` and an `aria-labelledby` pointing
  to the plate title and a text description generated from the metadata.

### 8.2 Plate anatomy

```
┌───────────────────────────────────────────── 1px rule-strong frame ┐
│ 40°25′N ┬                    ┬                     ┬               │ ticks
│                                                                     │ (micro,
│        ░░░░░░░░░░░░                                                 │ plate-
│      ░░ study area ░░░   ── route A (2px ink, solid)               │ context)
│        ░░░░░░░░░░░       ╌╌ route B (2px ink, dash 6 3)            │
│   ┄┄┄ context boundary (1px plate-context, dash 4 2)               │
│                                                                     │
│ ▕0━━━━━━━━━250━━━━━━━━━500 m        GN │ grid north (EPSG:25830)    │
└─────────────────────────────────────────────────────────────────────┘
Plate 2 · Madrid — Atocha to Puerta de Alcalá                  (heading)
```

| Mark | Specification |
|---|---|
| Frame | 1 px `--rule-strong`; inner padding 24 px |
| Study area | fill `--plate-fill`, stroke 1.5 px `--ink` |
| Context boundary | 1 px `--plate-context`, dash `4 2`, no fill |
| Route | 2 px `--ink`; the second route uses dash `6 3`. Each route is labelled in text on the plate ("Route A", "Route B"). |
| Point set | 6 px open squares, 1 px `--ink`. Kept distinct from kind glyphs, which are circles or diamonds. |
| Graticule ticks | 6 px ticks on the frame at offline-computed positions, labelled in `micro` `--ink-3` (e.g. `40°25′N`) |
| Scale bar | metric, with round lengths (100, 250, 500, 1000 m…), alternating ink/paper segments, `micro` labels. Drawn from projected metres. |
| North mark | "GN" with a 1 px arrow, labelled "grid north (EPSG:25830)". It is never presented as true north. |
| Labels | `ui` or `micro`, `--ink`, with a 3 px `--bg` halo implemented as `paint-order: stroke`, not a shadow. Every label lies inside the frame. |
| Thumbnail | 160 × 120 px (lists) or full reading width (dossiers), with no ticks and no scale bar; the frame is kept. It links to the plate page. |

Plates use no chromatic colour. Kind colours never appear on a plate.

### 8.3 Caption block (always present below a plate)

```
Plate 2 · Madrid — Atocha to Puerta de Alcalá
Source      HATI frozen routes · heat-adaptive-tourism-madrid @ c69688e7 ↗
Licence     © OpenStreetMap contributors, ODbL 1.0 (route geometry)
CRS         Displayed in EPSG:25830 · original EPSG:4326
Simplified  2 m tolerance · sha256 3f1c…
            Not for measurement. Geometry illustrates the study area
            documented by the source; it is not validated territory data.
```

- The caption is a `<dl>` in `body-s` and `micro`.
- "Not for measurement." is always the last line and is never hidden.

### 8.4 Coordinate line

- Shown under a dossier title when the item has a territory with geometry.
- Format: the WGS84 centroid to 4 decimals, then " · " and the display CRS,
  e.g. `40.4120° N · 3.6905° W · EPSG:25830`. Set in `micro` `--ink-3`.
- Values come from `geometry.display.centroid_wgs84` and are never computed
  at runtime.
- An item spanning several territories shows its first territory, followed
  by "+n".

---

## 9. Research figures

### 9.1 Figure block

```
FIGURE HATI-P·1                                                  (label)
┌ mat (--mat, 12px padding, 2px radius) ───────────────────────────────┐
│                       original figure image                          │
└──────────────────────────────────────────────────────────────────────┘
Caption in body-s serif, ≤ 48 ch per line …                   (caption)
Source: HATI preprint @ 10.5281/zenodo.22707470 · CC BY 4.0 ·  (micro)
© S. Karahrodi · Open full size ↗
```

### 9.2 Rules

- **Placement:** figures sit in the reading column at its full width. Wide
  charts may break out to 9 columns at ≥ 1024 px. Figures are never
  cropped.
- **Mat:** the image sits on `--mat`, which is light in both themes.
  Figures are never inverted, recoloured or filtered for dark mode.
- **Numbering:** `FIGURE <ITEM-CODE>·<n>`, per item, in dataset order.
- **Files:**
  - format conversion only (to WebP or PNG, or SVG if the original is
    SVG), no pixel edits;
  - longest side at most 1600 px, file size at most 300 KB;
  - explicit `width` and `height` attributes, so the layout never shifts.
- **Text:** `alt` describes what the figure shows. The caption says what it
  means, citing the source's own wording. "Open full size" links to the
  same-origin file.
- **Rights:** a figure appears only under I17. If a figure's licence is
  unclear, it is left out and its source is cited in text instead.

---

## 10. Motion

| Allowed | Duration | Properties |
|---|---|---|
| Link and button hover/focus colour | 120 ms, `ease-out` | `color`, `border-color`, `text-decoration-color` |

- Nothing else animates: route changes, `<details>`, filters and plates
  are all instant.
- There is no smooth scroll, parallax, entrance animation, looping motion
  or animated dash.
- Under `prefers-reduced-motion: reduce`, transition durations are set to
  0.01 ms. The experience is otherwise identical.

---

## 11. Responsive behaviour

| Element | compact (360–639) | medium (640–1023) | wide (≥1024) |
|---|---|---|---|
| Header | wordmark; navigation wraps below it | single row, may wrap | single row |
| Overview items | 1 column; thumbnail above text (full width, 4:3) | thumbnail left (120 px) | thumbnail left (160 px) |
| Platforms and instruments band | stacked | 2 columns | 2 columns |
| Dossier | single column; rail in-flow after section 11 | single column; rail in-flow | 7 + 4 columns with rail |
| Plate grid | 1 column | 2 columns | 3 columns |
| Plate page | full width; ticks every other label | full width | 8 columns, max 880 px |
| Evidence filters | `<details>` above the list | `<details>` above the table | left column |
| Tables | stacked records | table | table |
| Timeline | date above event | 2 columns | 2 columns |

- The type scale changes only as described in §4.2.
- Text must resize to 200 % without loss of content and without horizontal
  scrolling.

---

## 12. Print

Print is a first-class output, particularly for a dossier.

- **Theme:** light tokens. The background is white and text is `--ink`.
- **Hidden:** header navigation, the skip link, previous/next, the print
  button, filter controls and "Open full size" links.
- **Added:**
  - a running header line in the page content: the Atlas citation and the
    print date in `micro`;
  - the full URL after each external link
    (`a[href^="http"]::after { content: " <" attr(href) ">"; }`, in
    `micro`).
- **Layout:**
  - the rail prints after the reading column;
  - every `<details>` prints open (`details > *` shown);
  - `@page` margins are 18 mm, A4 and Letter safe.
- **Breaks:** `break-inside: avoid` on evidence records, output records,
  figures with their captions, and plates with their caption blocks. A
  heading never sits at the bottom of a page (`break-after: avoid`).
- **Colour:** kind colours print, and glyphs and dash patterns keep kinds
  legible on monochrome printers.

---

## 13. Accessibility (WCAG 2.2 AA, binding)

- **Structure:**
  - one `<h1>` per view; headings descend without skipping levels;
  - landmarks: `<header>`, `<nav aria-label="Primary">`, `<main>`, an
    `<aside>` for the rail, `<footer>`;
  - `lang="en"`.
- **Keyboard:**
  - everything is operable by keyboard in DOM order;
  - there are no keyboard traps and no custom shortcuts;
  - `<details>`, checkboxes, links and buttons are native elements.
- **Focus:**
  - the ring is 2 px solid `--ink` with a 2 px offset, visible in both
    themes and in forced colours, and is never removed;
  - route changes move focus to the `<h1>` (§5.4).
- **Names:**
  - external links say that they open a new tab;
  - kind glyphs are `aria-hidden`, because the adjacent text carries the
    meaning;
  - plates are `role="img"` with a text description;
  - figures have `alt` text.
- **Contrast:** as computed in §3.3–§3.4. Text is at least 4.5:1; graphics
  and focus indicators are at least 3:1.
- **Targets:** at least 44 × 44 px.
- **Live regions:** one polite region, announcing route titles and filter
  result counts.
- **Colour independence:** kind is shown by colour, dash, glyph and text
  together. Every other attribute is text.

---

## 14. Implementation limits

### 14.1 Runtime file budget

| Path | Rule |
|---|---|
| `index.html` | One page. Structure and static copy only; no inline script or style. |
| `styles.css` | One stylesheet with tokens, themes, print and forced colours. Soft ceiling about 1,000 lines. |
| `js/*.js` | Native ES modules, at most 8 files (e.g. `main`, `router`, `data`, `views`, `dossier`, `plates`, `explorer`, `dom`). No bundler, transpiler or framework. Soft ceiling about 1,600 lines in total. |
| `data/atlas.json` | Schema `0.3.0`; the single source of truth; never inlined. |
| `data/geometry/*.json` | Offline-prepared geometry (§8.1); total at most 150 KB. |
| `assets/figures/*` | Verified figures (§9); total at most 2 MB. |

- **Runtime targets:** transferred size at most 300 KB excluding figures
  and geometry; first contentful paint under 1 s on a local static server.
- **Forbidden at runtime:**
  - third-party requests, CDNs, web fonts;
  - analytics, cookies, `localStorage`, service workers;
  - `<canvas>` or WebGL;
  - any library, including any map or chart library.

### 14.2 Development-only tooling (never loaded by the page)

| Path | Purpose |
|---|---|
| `tools/validate_atlas.py` | Standard-library Python. Checks invariants I1–I13 and I15–I18 from `SPEC.md` §4.11 and the file budget. |
| `.github/workflows/validate.yml` | Runs the validator on every pull request. |
| `.github/workflows/link-check.yml` | Scheduled weekly and run on demand. Checks every source, output and geometry-source URL, and reports changes; it never edits `data/atlas.json`. |

This tooling replaces the v0.2 ban on tests and CI (v0.2 §9.3). The
governance workflow remains in place.

---

## 15. Licence presentation (D4)

- The footer and About state the current licence status. Until the
  maintainer approves, it reads: "Licence pending maintainer approval
  (preferred: MIT for code, CC BY 4.0 for original data and text)."
- Third-party licences appear next to the material they cover: geometry
  caption blocks (e.g. ODbL), figure credit lines, and each item's
  code/data/text licence in its dossier.
- No `LICENSE` file or badge is added before Gate 4.

---

## 16. Contract checklist

A reviewer can verify the finished artifact against this list alone.

- [ ] All six identity elements are present (§1.1); no forbidden register (§1.3)
- [ ] Layouts match §2 at 360, 768, 1024 and 1440 px; no horizontal scroll at any width ≥ 360 px
- [ ] Light and dark tokens match §3.2; contrast values hold (§3.3); kind palette per theme (§3.4)
- [ ] Every kind shows colour, dash, glyph and text together; greyscale stays legible
- [ ] Outcomes, classes and editorial status are achromatic text; verdict labels are never truncated
- [ ] Three font stacks, eight type steps, two weights, one uppercase context; no web fonts
- [ ] Navigation states match §5.1; route changes move focus and update the document title
- [ ] Dossier section order matches `SPEC.md` §7; methodology is present and sourced; uncertainty sits under its finding
- [ ] Outputs show Type, Review and ID separately; "No persistent identifier" is written out
- [ ] Every plate has its frame, ticks, scale bar, grid-north mark and full caption block, ending with "Not for measurement."
- [ ] Every figure has its mat, number, caption, source with pin, licence and alt text; no figure is altered
- [ ] Only hover/focus colour transitions (≤ 120 ms); reduced motion is honoured
- [ ] Print of a dossier is complete: rail included, details open, URLs shown, no broken records
- [ ] axe-core reports 0 violations; keyboard-only pass; 200 % zoom; forced colours
- [ ] Runtime file budget and same-origin-only requests (§14.1); validator and link check pass (§14.2)
- [ ] Licence presentation matches D4 status (§15)
