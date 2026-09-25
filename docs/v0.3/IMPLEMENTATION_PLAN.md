# IMPLEMENTATION_PLAN.md — Spatial Intelligence Atlas v0.3 (experimental)

---

## 1. Rendering approach comparison (brief §17)

Evaluated before writing any prototype code, against the actual information
need established in `UX_DIRECTION.md`: a document-shaped reading experience
for four entities, not a scene, not a data-dense chart.

| Approach | Fit for this need | Dependency cost | Verdict |
|---|---|---|---|
| **DOM + CSS (chosen)** | Exact fit — the content *is* a document (headings, lists, prose, a table) | Zero | **Selected.** Native accessibility, native text reflow, native focus order, zero bytes of dependency. |
| SVG + CSS | Would fit v0.2's graph; wrong tool for a document — SVG text layout is worse than HTML for long prose, and there is no longer a canvas to draw | Zero | Rejected — right tool for v0.2's problem, wrong tool for v0.3's |
| Canvas | Loses focusable elements and accessible names (`DESIGN_CONTRACT.md` §9.4 already rejects this for the graph, for the same reason it would fail a document even harder) | Zero (no library needed) but requires hand-rolled hit-testing and text layout for no benefit | Rejected |
| WebGL / Three.js / Globe.GL | No 3D scene exists in this direction; the one place WebGL was explored (`experiment/immersive-globe`) was for a globe this proposal explicitly rejects (`UX_DIRECTION.md` §2, "fourth direction") | ~600KB+ vendored (see that prototype's own `SOURCES_AND_LICENSES.md`), plus the six contract violations its own README lists | Rejected — "looks impressive" is not a justification the brief accepts, and there is no information need here it would serve |
| A small visualisation library (e.g. a lightweight table/list helper) | The whole page is ~2 templates (Overview row, case-reader section) — a library would be solving a problem this scale does not have | Any non-zero dependency, against `DESIGN_CONTRACT.md` §9.3's "no framework or library" floor, which this proposal keeps | Rejected |

**Decision: vanilla DOM + CSS, zero dependencies**, matching v0.2's own
"no framework, no build step" discipline exactly, for a form (document) that
needs it even less than v0.2's graph did.

---

## 2. Dependency and asset documentation (brief §17)

**Zero external or vendored dependencies are added.** The prototype:

- Uses the same evidence-glyph SVG path data already defined for v0.2 (six
  shapes: filled circle, half circle, ringed circle, diamond, open circle,
  slashed circle) — copied as inline `<svg>` markup, not imported from a
  library, and not pinned/versioned because it is authored content, not a
  third-party asset.
- Fetches `data/atlas.json` from the repository root via a relative path —
  no copy, no transformation, no second dataset file.
- Ships no font file, no icon font, no image, no favicon beyond an inline
  `data:` URI placeholder matching v0.2's own `<link rel="icon"
  href="data:,">`.

Because nothing is vendored, there is no license, provenance, version-pin,
or fallback-behavior documentation required beyond what this plan already
states. If a future iteration of this prototype ever proposes adding a real
dependency, it must repeat the comparison table in §1 for that specific
addition and document license/provenance/size/fallback exactly as
`prototype/immersive-globe/SOURCES_AND_LICENSES.md` already models well for
this repository.

---

## 3. File structure

```
prototype/v0.3-experience/
├── index.html      overview screen container + case-reader template regions
├── styles.css       DESIGN_CONTRACT_PROPOSAL.md tokens and layout
├── app.js           fetch, render Overview, render case reader, interaction/motion
└── README.md        how to run, scope, differences from v0.2.1, non-merge status
```

Four files, deliberately mirroring v0.2's own four-file discipline
(`index.html` / `styles.css` / `app.js` / the dataset — here read directly
from `../../data/atlas.json` rather than duplicated). No `vendor/`
directory, unlike `prototype/immersive-globe/`.

Served the same way as v0.2 and the immersive-globe prototype: from the
repository root, because `fetch` is blocked on `file://`:

```
python -m http.server 8000
# then: http://localhost:8000/prototype/v0.3-experience/
```

---

## 4. Build sequence

1. `index.html` — semantic skeleton: `<header>`, `<main>` with an
   `<section id="overview">` and `<section id="case" hidden>`, `<footer>`,
   matching `SPEC_PROPOSAL.md` §3's two-screen model.
2. `styles.css` — tokens from `DESIGN_CONTRACT_PROPOSAL.md` §3–§4
   (colour/type, copied verbatim from `DESIGN_CONTRACT.md` where unchanged),
   then the document layout system (§2 of the proposal) replacing the
   graph-canvas layout.
3. `app.js` — fetch `data/atlas.json`; build the Overview list from
   `entities` + their linked `outcome`/`territory`/evidence records via the
   existing `relationships` array (read, not re-derived — the schema
   already expresses this); render a case reader on selection; implement
   the five interactions from `SPEC_PROPOSAL.md` §4; implement the motion
   inventory from `MOTION_CONTRACT.md` §1.
4. Manual pass against both proposal checklists
   (`SPEC_PROPOSAL.md` non-negotiables, `DESIGN_CONTRACT_PROPOSAL.md` §15).
5. Screenshot + accessibility verification — `VERIFICATION_REPORT.md`.

---

## 5. What derived/prototype-only metadata is needed, and where it lives

`SPEC_PROPOSAL.md` §0 requires derived view metadata to stay out of the
frozen dataset. v0.3 needs exactly one derived thing beyond what
`data/atlas.json` already stores: **Overview list order**, which is simply
the existing `entities` array order (cases first in dataset order, FieldOS
last because it already is last in the dataset) — no new field, no new
file. No other derived metadata is required; every other piece of Overview
and case-reader content (territory, evidence records, outcome, sources) is
read directly from the existing schema via its existing relationships.
`data/atlas.json` is not modified, copied, or forked for this prototype.

---

## 6. Explicit non-goals for this prototype pass

- Not wiring the previous/next control to real keyboard shortcuts beyond
  standard tab order (no custom key bindings are introduced, matching
  `SPEC_PROPOSAL.md` §4's closed five-interaction inventory).
- Not building a second theme (dark-only, matching v0.2).
- Not adding print styles (out of scope for this design pass; noted for a
  future iteration, not attempted here to avoid scope creep beyond the
  brief's mandate).

---

## 7. Verification plan (executed in `VERIFICATION_REPORT.md`)

- Screenshots at 1440×900, 1024×768, 768×1024, 390×844, 360×740, for both
  Overview and an open case reader, using a real headless Chromium via
  Playwright (installed and confirmed available in this environment).
- Automated accessibility scan (axe-core) against both screens, if the
  scan tooling can be installed in this environment; reported as NOT
  VERIFIED rather than assumed if it cannot.
- Manual keyboard-only pass: tab through Overview, open a case, tab through
  its sections, activate a source link, return via keyboard.
- `prefers-reduced-motion: reduce` forced via Playwright's emulation and
  re-screenshotted mid-transition to confirm no cross-fade lingers.
- Greyscale filter check on the evidence glyph row, per
  `DESIGN_CONTRACT.md` §3.4's verification requirement, carried forward.

No claim of Safari testing, physical-device testing, or screen-reader
(NVDA/VoiceOver/JAWS) verification will be made — only Chromium-via-
Playwright and axe-core were available in this environment, and the report
says so explicitly rather than implying broader coverage.
