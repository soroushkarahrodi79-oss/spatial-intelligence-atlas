# DESIGN_CONTRACT.md — Spatial Intelligence Atlas

**Version:** 0.1.0
**Status:** BINDING. This document constrains form. `SPEC.md` constrains meaning.
Where a visual choice is not covered here, choose the more restrained option.

Everything in this document is a **limit**, not a suggestion. A limit stated as
a number is a hard maximum. "MUST NOT" means the implementation is incorrect if
it does it.

---

## 1. Visual philosophy

### 1.1 The target register

**Research-grade, spatial, minimal, editorial, technical.** Think a well-set
technical monograph or a cartographic plate rendered for a dark screen — ink,
hairlines, generous margins, disciplined type, and colour used only where it
carries meaning.

The artifact should look like it was **printed**, then dimmed for the screen.

### 1.2 Four governing rules

- **Colour is a semantic, not a decoration.** The only chromatic elements in the
  entire artifact are the six evidence classes (§3.3). Everything else —
  chrome, type, panels, hairlines, node fills, focus rings — is achromatic.
  If you want to add a colour, the answer is no.
- **Hairline over fill.** Structure is drawn with 1px rules and outlines.
  Filled shapes are reserved for node cores and the current-mode indicator.
- **The graph is the page.** The graph canvas is the single largest element.
  Chrome is subordinate: no oversized header, no hero, no sidebar navigation.
- **Nothing moves unless the user moved it.** No ambient motion, ever (§6).

### 1.3 Explicitly forbidden

The following are specification violations, not stylistic disagreements:

**Sci-fi / cyberpunk register** — neon, glow, bloom, outer-glow filters,
scanlines, CRT effects, terminal green, HUD framing, corner brackets, targeting
reticles, radar sweeps, "holographic" translucency, monospace-everything,
glitch effects, animated grids or starfields.

**SaaS dashboard register** — KPI card grids, big-number stat tiles with
percentage deltas, donut/gauge charts, coloured status pills for non-evidence
data, gradient buttons, avatar rows, "Powered by" strips, onboarding tours,
toast notifications, skeleton shimmer loaders.

**Game register** — score counters, progress bars, badges, achievements,
levels, XP, confetti, celebratory states, sound.

**Generic decoration** — drop shadows used for depth, glassmorphism / backdrop
blur, bevels, inner shadows, rounded-everything (radius limits in §2.6),
decorative gradients, background images, textures, illustration, stock imagery,
emoji anywhere in the UI, icon fonts, 3D perspective, isometric projection.

**Typographic decoration** — more than one uppercase context (§4.5), letter-
spacing used for effect, italic used for emphasis in UI chrome, text shadow,
outlined text, more than two font families.

---

## 2. Spatial layout principles

### 2.1 Grid

- Base spacing unit: **8px**. All margins, padding, and gaps are multiples of 8.
  A 4px half-step is permitted **only** for optical alignment of type against a
  rule; nowhere else.
- Type is set on a 4px vertical rhythm.

### 2.2 Page frame (viewport ≥ 1024px)

```
┌────────────────────────────────────────────────────────────────┐
│  HEADER RAIL            (fixed height 96px, hairline bottom)   │
│  title · subtitle · non-integration notice · mode control      │
├──────────────────────────────────────────┬─────────────────────┤
│                                          │                     │
│  GRAPH CANVAS                            │  DETAIL PANEL       │
│  fills remaining space                   │  fixed 320px        │
│  min-height 480px                        │  hairline left      │
│                                          │                     │
├──────────────────────────────────────────┤                     │
│  LEGEND  (fixed height 64px, hairline)   │                     │
├──────────────────────────────────────────┴─────────────────────┤
│  PROVENANCE FOOTER      (fixed height 40px, hairline top)      │
└────────────────────────────────────────────────────────────────┘
```

- Outer page margin: 24px. No element bleeds to the viewport edge except the
  hairline rules, which run full width.
- The detail panel is **always present**, never a modal, never an overlay. When
  nothing is selected it shows an empty state.

### 2.3 Deterministic coordinates (binding)

Node positions are **read from `data/atlas.json`**, which stores normalised
`[0, 1]` coordinates per node per mode.

- **No force simulation. No physics. No randomness. No layout library.**
- Mapping is `px = margin + norm * (canvas_size - 2 * margin)`, with a canvas
  inset of 48px on all sides to protect labels.
- Two page loads at the same viewport size MUST produce pixel-identical output.

Rationale: determinism is what makes the artifact citable and reviewable, and it
removes the only reason a dependency would be needed.

### 2.4 Tier discipline

Each mode is a **banded** layout — anchors in one band, contributors in others.
Bands read as horizontal strata. This is what makes the artifact read as
*spatial* rather than as a hairball.

- TERRITORY: territories (upper band) / projects (middle band).
- EVIDENCE: projects (top) / methods (middle, staggered two rows) / evidence
  classes (bottom).
- DECISIONS: decisions (top) / projects (middle) / methods (bottom, staggered).

Bands may be separated by a hairline rule at 8% opacity. Nothing stronger.

### 2.5 Node forms

Form encodes type. Type is **never** encoded by colour.

| Type | Form | Size (diameter / height) |
|------|------|--------------------------|
| `project` | Filled square, sharp corners | 16px |
| `territory` | Outlined rectangle, 2px stroke, sharp corners | 20 × 12px |
| `territory` where `is_null: true` | Same rectangle, **dashed** 3-3 stroke, no fill | 20 × 12px |
| `method` | Small filled circle | 8px |
| `evidence` | Outlined circle carrying the class glyph inside | 18px |
| `decision` | Outlined diamond (square rotated 45°) | 16px |

`t-unbound` MUST use the dashed variant and MUST carry the visible label
"No territory declared". Its distinction MUST survive greyscale printing.

### 2.6 Corner radius

Maximum radius anywhere in the artifact: **2px**, permitted only on the detail
panel and the mode control. Nodes, rules, and the canvas are square. There are
no pill shapes.

### 2.7 Edges

- Stroke width: **1px** for all edges. Highlighted edges go to 1.5px — never
  thicker.
- Geometry: straight lines, or a single quadratic curve with control-point
  offset ≤ 12% of edge length. No bundling, no orthogonal routing, no bezier
  flourishes.
- Arrowheads: 5px, plain triangle, on `yields_evidence` and `supports_decision`
  only. **Never** on `conceptually_adjacent` (SPEC §1.1).
- Edges render **beneath** nodes, always.
- Maximum edge opacity at rest: 0.55. Highlighted: 1.0. Dimmed: 0.12.

### 2.8 Labels

- Every `project`, `territory`, `evidence`, and `decision` node is
  **permanently labelled**. Labels are not hover-only.
- `method` labels are permanently visible in EVIDENCE and DECISIONS modes
  (where methods are anchored in a staggered band with room for them). Methods
  are hidden entirely in TERRITORY mode, so the question does not arise.
- Labels sit 8px below their node, centred, and MUST NOT overlap. The stored
  coordinates and the two-row stagger exist precisely to guarantee this.
- No label may be truncated with an ellipsis. If a label does not fit at the
  minimum supported viewport, the responsive fallback (§7.3) takes over.

---

## 3. Colour

### 3.1 Base (achromatic) tokens

| Token | Value | Use |
|-------|-------|-----|
| `--bg` | `#0F1113` | Page ground |
| `--surface` | `#15181B` | Detail panel, legend strip |
| `--rule` | `#22262B` | Hairlines, borders |
| `--rule-strong` | `#2E343A` | Active borders, band separators |
| `--ink` | `#E8E6E3` | Primary text, project node fill |
| `--ink-2` | `#A7A9AD` | Secondary text, labels |
| `--ink-3` | `#7E8288` | Muted text, counts, provenance footer |
| `--edge` | `#3A4046` | Neutral edge (`edge.evidence == null`) |

### 3.2 Computed contrast (against `--bg`, WCAG 2.x relative luminance)

| Token | Ratio | Meets |
|-------|-------|-------|
| `--ink` `#E8E6E3` | **15.3 : 1** | AAA text |
| `--ink-2` `#A7A9AD` | **8.1 : 1** | AAA text |
| `--ink-3` `#7E8288` | **4.87 : 1** | AA text (4.5) |

`--ink-3` is the floor. **No text token darker than `--ink-3` may be
introduced.** `--rule`, `--rule-strong`, and `--edge` are decorative structure
and are exempt, but MUST NOT be used for text.

### 3.3 Evidence palette — the only colour in the artifact

Each class has a colour **and** a stroke pattern **and** a glyph. All three are
required; colour alone never carries meaning (§8 accessibility, SPEC A15).

| Class | Hex | Contrast vs `--bg` | Dash pattern | Glyph |
|-------|-----|--------------------|--------------|-------|
| REAL | `#3FA98C` | **6.60 : 1** | solid | `●` filled circle |
| DERIVED | `#5B9BD5` | **6.41 : 1** | `6 3` | `◐` half circle |
| CALIBRATED | `#C9A227` | **7.88 : 1** | `2 3` | `◎` ringed circle |
| SIMULATED | `#D98B3A` | **6.99 : 1** | `8 3 2 3` | `◇` diamond |
| PROVISIONAL | `#8B9099` | **5.96 : 1** | `1 3` | `○` open circle |
| MISSING | `#C46A78` | **5.16 : 1** | `3 3` (0.5px) | `⊘` slashed circle |

Notes that are binding:

- PROVISIONAL is deliberately **near-achromatic**. Unsubstantiated should look
  unsubstantiated. Do not "improve" it into a brighter hue.
- Glyphs must be drawn as SVG shapes, **not** as text characters or an icon
  font, so that rendering is identical across platforms.
- These six values are the complete chromatic budget. No accent colour, no
  brand colour, no hover colour, no success/error colour exists.
- Focus rings, selection states, and hover states are achromatic (§8.3).

### 3.4 Colour-vision safety

The palette separates on hue **and** lightness, but the binding guarantee is
structural: **every colour distinction in the artifact is duplicated by a dash
pattern and a glyph, and every edge's class is also stated as text in the detail
panel.** The artifact must remain fully readable when rendered in greyscale.
Verification requirement: view the finished artifact with a greyscale filter and
confirm all six classes remain distinguishable by dash pattern alone.

### 3.5 Theme

Dark only in v0.1. No light mode, no theme toggle, no `prefers-color-scheme`
branch. `color-scheme: dark` is declared so form controls and scrollbars match.

---

## 4. Typography hierarchy

### 4.1 Families — maximum two, both system stacks

```
--font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
             Inter, "Helvetica Neue", Arial, sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", "Cascadia Mono",
             Consolas, "Liberation Mono", monospace;
```

**No webfonts.** No `@font-face`, no Google Fonts link, no font file in the
repository. This is not negotiable: it is what keeps the artifact zero-network
and offline-correct.

### 4.2 Scale — exactly five steps

| Step | Size / line-height | Weight | Tracking | Family | Use |
|------|--------------------|--------|----------|--------|-----|
| `display` | 28 / 32px | 500 | −0.02em | sans | Artifact title (once per page) |
| `heading` | 18 / 24px | 500 | −0.01em | sans | Mode question, detail panel node name |
| `body` | 14 / 20px | 400 | 0 | sans | Definitions, panel prose, notices |
| `label` | 12 / 16px | 500 | +0.02em | sans | Node labels, legend, mode control |
| `micro` | 11 / 14px | 400 | +0.04em | mono | Ids, counts, evidence tags, footer |

No sixth size. No size between steps. Minimum type size in the artifact is
**11px**, and 11px is reserved for `micro`.

### 4.3 Weight

Two weights only: **400** and **500**. No 600, no 700, no bold. Emphasis is
achieved with the `--ink` / `--ink-2` / `--ink-3` ladder, not with weight.

### 4.4 Measure

Body prose is capped at **68 characters** per line. The detail panel at 320px
naturally satisfies this; the header notice must be constrained explicitly.

### 4.5 Case

**Exactly one uppercase context:** the `label` step, used for the evidence class
names, the mode control, and the legend. Everything else is sentence case. Node
labels for projects, territories, methods, and decisions are **sentence case or
their canonical casing** (e.g. "SOLWEIG", "Sentinel-2", "HATI" keep their real
casing — that is canonical, not decoration).

Title case is not used anywhere.

### 4.6 Numerals

`font-variant-numeric: tabular-nums` on all counts and ids, so legend counts do
not shift when filtered.

---

## 5. Interaction limits

### 5.1 The complete interaction inventory

Exactly five, as enumerated in SPEC §7:

1. Switch mode
2. Hover / focus a node → highlight 1-hop neighbourhood + tooltip
3. Select a node → detail panel
4. Toggle an evidence class in the legend (EVIDENCE mode only)
5. Reset view

**Adding a sixth interaction is a contract violation.** Explicitly excluded:
pan, zoom, drag, search, multi-select, right-click menu, keyboard shortcuts
beyond those listed in §5.3, hover on edges, resizable panels, collapsible
sections, tabs within the panel, tooltips on chrome, and any modal.

### 5.2 State model

Total application state is three values:

```
{ mode: "territory" | "evidence" | "decisions",
  selectedNodeId: string | null,
  hiddenEvidenceClasses: Set<string> }
```

No history stack, no undo, no URL sync, no persistence. `localStorage` is not
used. Reloading returns to the initial state: TERRITORY, nothing selected,
nothing filtered.

### 5.3 Keyboard contract

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Move through: mode control → graph nodes (document order) → legend → reset → panel |
| `1` `2` `3` | Switch to TERRITORY / EVIDENCE / DECISIONS |
| `←` `→` | When the mode control has focus, move between modes |
| `Enter` / `Space` | Select the focused node; toggle the focused legend class |
| `Esc` | Deselect; return focus to the previously focused node |

Keyboard focus and pointer hover produce **identical** highlight rendering.
There is no interaction reachable by pointer that is not reachable by keyboard.

### 5.4 Hit areas

Visual node sizes are small (8–20px). Pointer and touch hit areas MUST be at
least **44 × 44px**, implemented as a transparent hit rectangle behind each
node. Where 44px hit areas would overlap, the node with the higher visual weight
wins; overlap must be avoided by the stored coordinates in the first place.

### 5.5 Latency budget

Mode switch, hover highlight, and selection must be perceptually immediate.
With 31 nodes and ~54 edges rendered as SVG, no virtualisation, throttling, or
`requestAnimationFrame` loop is required or permitted.

---

## 6. Motion limits

### 6.1 Hard limits

| Property | Limit |
|----------|-------|
| Mode transition (node reposition) | **≤ 400ms** |
| All other transitions (opacity, stroke, panel) | **≤ 240ms** |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` or `ease-out`. Nothing else. |
| Animatable properties | `opacity`, `transform`, `stroke-opacity`, `stroke-width`, `fill-opacity` — **only** |
| Simultaneous animated properties per element | **≤ 2** |
| Staggered/sequenced animations | **Forbidden** |

### 6.2 Forbidden motion

No looping animation of any kind. No autoplay. No entrance animation on load.
No parallax. No scroll-triggered animation. No scroll-jacking. No pulsing,
breathing, shimmering, or "living" nodes. No animated dash offset (marching
ants). No spring physics. No bouncing. No animated gradients. No transitions on
`width`, `height`, `top`, `left`, `margin`, or `filter`.

### 6.3 Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

Under reduced motion, mode switches are **instant repositions**. No fallback
cross-fade, no "gentler" animation. Instant.

---

## 7. Responsive behaviour

Three breakpoints. Minimum supported width: **360px**. No horizontal page scroll
at any width ≥ 360px, in any mode, ever.

### 7.1 Wide — ≥ 1024px

The full frame of §2.2. Graph canvas and 320px detail panel side by side.

### 7.2 Medium — 640px to 1023px

- Detail panel becomes a **bottom sheet**: full width, max-height 40vh,
  hairline top, occupying the bottom of the layout. It is still not a modal and
  still shows an empty state.
- Graph canvas takes full width; canvas inset reduces from 48px to 32px.
- Header rail wraps to two rows; the non-integration notice stays visible.
- `method` labels may reduce to the `micro` step (11px). No further reduction.

### 7.3 Narrow — 360px to 639px: structured fallback

Below 640px the node-link graph is **not** rendered. Attempting to shrink it
produces an illegible hairball and violates §2.8 (no truncated labels).

Instead the artifact renders a **structured outline** of the same data, from the
same `atlas.json`, honouring the current mode:

- Mode control becomes a full-width segmented control at the top.
- The current mode's anchors become section headings (territories / evidence
  classes / decision questions).
- Under each anchor, its connected nodes are listed with their evidence glyph,
  dash swatch, and class name as text.
- Tapping a row opens the same detail content inline beneath it.
- The legend becomes a horizontal, wrapping row of class chips with counts.

This fallback is **not** a degraded experience to be apologised for; it is the
correct rendering of a graph at that width, and it must be designed with the
same typographic care as the wide layout.

### 7.4 Canvas sizing

The SVG uses `viewBox` with `preserveAspectRatio="xMidYMid meet"` and resizes
with its container. Node **radii and stroke widths do not scale** — they are
authored in absolute pixels and re-derived from the current canvas size, so a
1px hairline is always 1 device-independent pixel.

---

## 8. Accessibility requirements

Target: **WCAG 2.2 Level AA**. The following are binding minimums.

### 8.1 Structure

- One `<h1>` (the artifact title). Headings descend without skipping levels.
- Landmarks: `<header>`, `<main>`, `<aside>` (detail panel), `<footer>`.
- The mode control is a `role="tablist"` with `role="tab"` items and
  `aria-selected`, or a fieldset of radios. Either is acceptable; a `<div>` of
  click handlers is not.
- Legend toggles are real `<button>` elements with `aria-pressed`.

### 8.2 The graph

- The `<svg>` carries `role="group"` and an `aria-label` naming the current mode
  and its question.
- Each node is individually focusable (`tabindex="0"`) with an `aria-label` of
  the form: *"HATI, project, Madrid, 5 connections"*.
- Node focus order follows a documented, stable order: by type in SPEC §4 order,
  then by dataset order within type.
- Edges are `aria-hidden="true"`; edge information is conveyed through the node
  `aria-label` and the detail panel, which is the accessible representation of
  the relationships.
- An `aria-live="polite"` region announces: mode changes, selection changes, and
  legend filter changes. It announces **state**, not decoration
  (e.g. *"Evidence mode. 3 of 6 classes shown."*).

### 8.3 Focus

- Visible focus ring: **2px solid `--ink`, 2px offset**, on every focusable
  element including SVG nodes. Never removed, never replaced by a colour change
  alone.
- Focus ring is achromatic so it never collides with evidence-class colour.
- `:focus-visible` is used for pointer users; keyboard focus is always shown.

### 8.4 Colour independence (binding, SPEC A15)

No information is conveyed by colour alone, anywhere:

- Evidence class → colour **+** dash pattern **+** glyph **+** text label.
- Current mode → colour **+** `aria-selected` **+** a filled underline rule
  **+** weight change on the label.
- Selected node → colour **+** a 2px achromatic outline ring **+** its presence
  in the detail panel.
- Null territory → dashed stroke **+** the literal label "No territory declared".

### 8.5 Other

- Contrast: as computed in §3.2 and §3.3. Text ≥ 4.5:1; graphical objects and
  focus indicators ≥ 3:1.
- Touch targets ≥ 44 × 44px (§5.4).
- Text is resizable to 200% without loss of content or horizontal scrolling.
- No content flashes more than three times per second (trivially satisfied:
  nothing flashes).
- The page is fully operable and readable with CSS transitions disabled.
- `lang="en"` on `<html>`.

---

## 9. Maximum implementation scope

### 9.1 The file budget (binding)

After this preparation stage, the complete runtime implementation may add
**no more than three files**:

```
index.html
styles.css
app.js
```

Plus `data/atlas.json`, which already exists and is **modifiable in content but
not in schema**.

### 9.2 The one-asset exception, narrowly defined

One additional **local** asset is permitted only if it is *objectively
necessary* — meaning the artifact cannot satisfy `SPEC.md` without it.

To pre-empt misuse, the following are declared **not** objectively necessary and
are therefore forbidden: a favicon, a webfont, a logo, an icon sprite, a
background image, a texture, a screenshot, a basemap, a GeoJSON file, a licence
badge, a second stylesheet, a second script, a service worker, a manifest, a
config file, and a minified copy of anything.

As of v0.1 the exception is **not invoked**. If a future implementer invokes it,
they MUST record the file and the justification in `README.md`.

### 9.3 Absolute technical prohibitions

The artifact is **static and client-side**. It MUST NOT include or require:

- A backend, server-side code, or serverless function
- Authentication, accounts, sessions, or cookies
- A database or any persistence, including `localStorage` and `sessionStorage`
- An API, `fetch` to any origin other than the artifact's own directory, or
  WebSocket
- Runtime AI, model inference, or LLM calls of any kind
- External research, scraping, or repository integration
- Telemetry, analytics, error reporting, or any third-party script
- A CDN reference, `<script src>` to a remote host, or `@import` of a remote
  stylesheet
- A package manager, `node_modules`, `package.json`, lockfile, bundler,
  transpiler, or build step
- A framework or library of any kind — no React, Vue, Svelte, D3, jQuery,
  Tailwind, or graph-layout library
- A test suite, CI configuration, or deployment configuration

### 9.4 Implementation technique constraints

- **Rendering:** inline **SVG**, authored via DOM APIs. Not `<canvas>` (loses
  focusable elements and accessible names), not WebGL, not CSS-positioned divs.
- **JavaScript:** vanilla ES2020, no modules requiring a build, no TypeScript.
  A single `<script defer src="app.js">` with no `type="module"` requirement
  beyond what plain browsers support.
- **CSS:** a single stylesheet using custom properties for the §3 tokens. No
  preprocessor, no CSS-in-JS, no utility framework.
- **Data loading:** `app.js` fetches `data/atlas.json` at runtime.
  `atlas.json` content MUST NOT be duplicated or inlined into `index.html` or
  `app.js` — one source of truth (SPEC A1). Because `file://` blocks `fetch`,
  the artifact requires a local static server; this is documented in `README.md`
  and handled by the explicit error state required by SPEC A22.

### 9.5 Complexity ceiling

Indicative, to catch scope creep early. Exceeding these is a signal that the
implementation has drifted from the contract, and should prompt a re-read of
this document rather than a refactor:

| File | Soft ceiling |
|------|--------------|
| `index.html` | ~150 lines (structure and static copy only; no data, no inline styles, no inline scripts) |
| `styles.css` | ~450 lines |
| `app.js` | ~600 lines |

---

## 10. Contract checklist

A reviewer can verify the finished artifact against this list alone.

- [ ] Only `index.html`, `styles.css`, `app.js` were added (§9.1)
- [ ] Zero network requests beyond the four local files (§9.3)
- [ ] No framework, no build step, no package manager (§9.3)
- [ ] Rendering is inline SVG (§9.4)
- [ ] Node positions come from `atlas.json`; two loads are pixel-identical (§2.3)
- [ ] Only the six evidence classes carry colour; all else achromatic (§1.2, §3.3)
- [ ] Every colour distinction is duplicated by dash pattern and glyph (§3.4, §8.4)
- [ ] Exactly five type sizes, two weights, one uppercase context (§4)
- [ ] Exactly five interactions; no pan, zoom, drag, or search (§5.1)
- [ ] No looping or ambient motion; all transitions ≤ 400ms (§6)
- [ ] `prefers-reduced-motion` yields instant repositioning (§6.3)
- [ ] Readable and operable at 360px with the structured fallback (§7.3)
- [ ] Full keyboard operation with a visible achromatic focus ring (§8.3)
- [ ] `conceptually_adjacent` edges have no arrowheads (§2.7)
- [ ] The non-integration notice is visible in all three modes (SPEC §8.2)
- [ ] Artifact remains legible in greyscale (§3.4)
