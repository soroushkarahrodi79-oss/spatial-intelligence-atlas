# Spatial Intelligence Atlas

**Tourism, Risk & Decision Systems**

A small, static, client-side visual artifact that explains the relationships
between five existing research/software systems by placing them in a shared
conceptual space.

> **Five separate systems. Related conceptually, not technically integrated.**

---

## Current status

**Specification stage — v0.1.0. There is no application code in this
repository yet, and none should be added without reading the two contract
documents below.**

| File | Role | State |
|------|------|-------|
| `SPEC.md` | Source of truth for **meaning and behaviour** | Locked |
| `DESIGN_CONTRACT.md` | Source of truth for **form and limits** | Locked |
| `data/atlas.json` | Source of truth for **content** | Locked |
| `README.md` | Orientation (this file) | — |
| `index.html` | Structure | **Not yet written** |
| `styles.css` | Presentation | **Not yet written** |
| `app.js` | Behaviour | **Not yet written** |

Nothing else may be added. See `DESIGN_CONTRACT.md` §9.

---

## What this is

An **explanatory** artifact, not an operational one. It renders a fixed,
hand-authored dataset as a typed graph, viewed through three fixed projections:

| Mode | Question it answers |
|------|--------------------|
| **TERRITORY** | Where does this work happen? |
| **EVIDENCE** | What is this actually founded on? |
| **DECISIONS** | What decisions could this inform? |

It performs no computation over live data, makes no predictions, and does not
execute any part of the systems it describes.

## What this is not

It is **not** an integration of the five systems, a data pipeline, a product
suite, a real map, a dashboard, a CV, or a claim of operational readiness. The
full list is in `SPEC.md` §9.

---

## The five systems

| System | Territory | Domain |
|--------|-----------|--------|
| **HATI** — Heat-Aware Tourism Intelligence | Madrid | Extreme heat and tourism |
| **FIRSTLOOK-MAD** | Madrid | Wildfire / interurban environmental risk |
| **SNTO** — Smart Tourism Observatory | Sierra de Guadarrama | Smart tourism observatory, destination intelligence |
| **FIELDOS** | *not declared* | Field observation infrastructure |
| **FAB** | *not declared* | Visual/research interface experimentation |

These are separate systems. The atlas draws a single symmetric relationship
between them — `conceptually_adjacent` — which explicitly does **not** mean
technical integration. The five are laid out as siblings, never as a chain.

Two of the five declare no territory. The atlas makes that visible with an
explicit null-territory node rather than quietly omitting it.

---

## Evidence semantics

Every relationship in the atlas carries an evidence status. Six classes:

| Class | Meaning | v0.1 count |
|-------|---------|-----------|
| `REAL` | Directly observed or acquired data | 2 |
| `DERIVED` | Computed from other evidence via a declared transformation | **0** |
| `CALIBRATED` | Adjusted or validated against an independent reference | **0** |
| `SIMULATED` | Produced by a model under specified conditions | **0** |
| `PROVISIONAL` | Asserted by this atlas but not substantiated by the source | 8 |
| `MISSING` | Not declared by the source; the absence is itself the finding | 2 |

### The discipline that produced those numbers

The atlas asserts a substantive evidence status **only where the source project
description explicitly supports it**. Every edge records:

- `support` — `stated` (present in the source, with a quotation in `basis`) or
  `authored` (asserted by the atlas author)
- `basis` — the supporting quotation, or the reason the assertion is authored

An edge may terminate at `REAL`, `DERIVED`, `CALIBRATED`, or `SIMULATED` **only**
when `support == "stated"`. Authored assertions terminate at `PROVISIONAL`.

**`DERIVED` and `CALIBRATED` are unused in v0.1 because no source description
supports either status.** `SIMULATED` is also at zero: the one concept that
named it (*scenarios*) is held at `PROVISIONAL`, because the supplied
description names the concept but does not explicitly establish its evidence
class. All three still render in the legend, with a count of zero. A visibly
provisional graph is the correct result, not a defect — and hiding an empty
class is a specification violation.

`PROVISIONAL` means *asserted, not verified*. Resolving a provisional edge to a
substantive class requires confirmation from the owner of the source system, and
is deferred to v0.2.

---

## Dataset shape

`data/atlas.json` — 31 nodes, 54 edges.

**Nodes:** 5 project · 3 territory · 12 method · 6 evidence · 5 decision
**Edges:** `operates_in` (5) · `applies_method` (12) · `yields_evidence` (10) ·
`supports_decision` (17) · `conceptually_adjacent` (10)

Every node carries normalised `[0, 1]` layout coordinates for **all three
modes**. Layout is fully deterministic — no force simulation, no physics, no
randomness, no layout library. Two page loads at the same viewport size produce
pixel-identical output.

Method labels are **verbatim terms** from the source descriptions. Terms merged
into another node are recorded in that node's `folds` array, so nothing is
silently discarded.

---

## Running it (once implemented)

The artifact is fully static, but `app.js` fetches `data/atlas.json` at runtime
and browsers block `fetch` over `file://`. Serve the directory:

```
python -m http.server 8000
```

Then open `http://localhost:8000`.

The data is **not** inlined into `index.html` or `app.js` — one source of truth.
If the fetch fails, the page must render a clear, styled explanation with this
command, never a blank page.

Beyond the four local files there are **zero** network requests. No CDN, no
webfont, no external image, no remote JSON, no telemetry.

---

## Constraints on any future implementation

Read `DESIGN_CONTRACT.md` before writing a line. In brief:

- **Three files only:** `index.html`, `styles.css`, `app.js`
- **No** backend, auth, database, API, runtime AI, or persistence (including
  `localStorage`)
- **No** framework, library, bundler, package manager, or build step
- **No** external research or repository integration
- Inline **SVG** rendering, vanilla ES2020, a single stylesheet
- Colour is a semantic: only the six evidence classes carry colour, and every
  colour distinction is duplicated by a dash pattern, a glyph, and a text label
- Five type sizes, two weights, one uppercase context
- Five interactions — no pan, zoom, drag, or search
- No looping or ambient motion; all transitions ≤ 400ms;
  `prefers-reduced-motion` yields instant repositioning
- WCAG 2.2 AA, fully keyboard operable, legible in greyscale
- Readable at 360px via a structured outline fallback

The one-additional-asset exception in `DESIGN_CONTRACT.md` §9.2 is **not
invoked** in v0.1. If a future implementer invokes it, the file and its
justification must be recorded here.

---

## Reading order

1. `README.md` — orientation (you are here)
2. `SPEC.md` — purpose, model, node and edge types, modes, interaction,
   non-goals, acceptance criteria
3. `DESIGN_CONTRACT.md` — visual philosophy, layout, type, colour, motion,
   accessibility, responsive behaviour, scope ceiling
4. `data/atlas.json` — the dataset, with a `basis` on every claim

The v0.1 acceptance criteria (`SPEC.md` §10, A1–A22) and the contract checklist
(`DESIGN_CONTRACT.md` §10) are together sufficient to review a finished
implementation without re-reading the prose.
