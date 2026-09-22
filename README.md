# Spatial Intelligence Atlas

**Tourism, Risk & Decision Systems**

A small, static, client-side research map. The deployed v0.1.1 runtime explains
five existing systems; the approved v0.2 design narrows the artifact to three
research cases and one supporting instrument, with a documented result and
claim ceiling for each.

> **Deployed v0.1.1: five separate systems, related conceptually and not
> technically integrated. v0.2 is implemented on branch `impl/v0.2-gate3`,
> reviewed but not yet merged or released.**

---

**Project status:** see [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for the
canonical release state, active gate, evidence ceiling, and licensing note.

---

## Current status

**Deployed runtime: v0.1.1, released and locked. v0.2: Gate 3 implementation
drafted on a branch, pending merge and release.**

The current maintenance release of the first bounded implementation is
complete and remains what GitHub Pages serves. The original `v0.1.0` release
remains preserved at its tag.

Gate 1 (specification) and Gate 2 (semantic content freeze) are approved. The
v0.2 runtime and dataset have been migrated to the approved contract on branch
`impl/v0.2-gate3`. Because GitHub Pages deploys from `main`, merging that
branch is treated as requiring the same explicit maintainer confirmation as
Gate 4 (verification/release) — it is not implied by Gate 3 drafting alone.
Until that merge, the deployed site remains v0.1.1.

> The `v0.1.0` shown in the deployed interface footer is the dataset's
> `schema_version`, not the repository release tag. Release `v0.1.1` clarified
> evidence semantics without changing that schema. The v0.2 footer instead
> shows `schema_version: "0.2.0"` directly, since the shape changed.

| File | Role | State |
|------|------|-------|
| `SPEC.md` | v0.2 meaning, behaviour, and Gate 2 content (approved) | Gate 2 approved |
| `DESIGN_CONTRACT.md` | v0.2 form and limits | Gate 1 approved |
| `data/atlas.json` | v0.1.1 on `main`; v0.2 content on `impl/v0.2-gate3` | Gate 3 drafted |
| `README.md` | Orientation (this file) | Current |
| `index.html` / `styles.css` / `app.js` | v0.1.1 on `main`; v0.2 on `impl/v0.2-gate3` | Gate 3 drafted |

Merging the Gate 3 branch to `main`, and creating a v0.2 release, requires
separate, explicit maintainer confirmation.

---

## What the deployed v0.1.1 runtime is

An **explanatory** artifact, not an operational one. It renders a fixed,
hand-authored dataset as a typed graph, viewed through three fixed projections:

| Mode | Question it answers |
|------|--------------------|
| **TERRITORY** | Where does this work happen? |
| **EVIDENCE** | What is this actually founded on? |
| **DECISIONS** | What decisions could this inform? |

It performs no computation over live data, makes no predictions, and does not
execute any part of the systems it describes.

The v0.2 design keeps the three-mode structure but changes DECISIONS to show
documented outcomes and claim ceilings. See `SPEC.md` for the proposed content.

## What this is not

It is **not** an integration of the five systems, a data pipeline, a product
suite, a real map, a dashboard, a CV, or a claim of operational readiness. The
full list is in `SPEC.md` §9.

---

## The v0.2 implementation (Gate 3 draft, branch `impl/v0.2-gate3`)

v0.2 narrows the artifact to a selective, evidence-informed research map:
**three core cases and one supporting instrument**, each with a research
question (or role, for the instrument), a documented result, a claim ceiling,
a research status, and pinned primary sources.

| Entity | Kind | Territory | Documented result |
|---|---|---|---|
| HATI — Pedestrian Heat Extension | Core case | Madrid — Atocha to Puerta de Alcalá | `ABSTAIN` / no robust difference |
| SNTO — PNSG Decision Evidence | Core case | Parque Nacional de la Sierra de Guadarrama | `INSUFFICIENT EVIDENCE` |
| CHALUS — Western Mazandaran Pilot | Core case | Western Mazandaran | `NO-GO` |
| FieldOS | Supporting instrument | — no case-specific territory | `FUNCTIONAL TEST` |

FIRSTLOOK-MAD and FAB remain preserved in v0.1 history but are not primary
v0.2 entities (see `SPEC.md` §1.1 for the selection principle). There are
**zero** entity-to-entity relationships in v0.2 — only `situated_in`
(case → territory), `documents` (entity → evidence record), and `reports`
(entity → outcome). The dataset carries 4 entities, 3 territories, 10
evidence records, 4 outcomes, 8 commit-pinned sources, and 17 relationships.
Full content is frozen in `SPEC.md` §12.

The evidence-input vocabulary changed from v0.1.1's six classes
(`REAL`/`DERIVED`/`CALIBRATED`/`SIMULATED`/`PROVISIONAL`/`MISSING`) to a
different six-value scale defined in `SPEC.md` §4.3: `OBSERVED`, `ACQUIRED`,
`DERIVED`, `SIMULATED`, `REPORTED`, `UNESTABLISHED`. Each is paired with a
separate `substantiation` value (`SOURCE-STATED`, `OWNER-ATTESTED`, or `NOT
ESTABLISHED`) — the two are never collapsed into one scale.

Run it the same way as v0.1.1 (see **Running it locally** below) after
checking out `impl/v0.2-gate3`.

---

## The five deployed v0.1.1 systems

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

## Deployed v0.1.1 evidence semantics

Every relationship in the atlas carries an evidence status. Six classes:

| Class | Meaning | v0.1.1 count |
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

**`DERIVED` and `CALIBRATED` are unused in v0.1.1 because no source description
supports either status.** `SIMULATED` is also at zero: the one concept that
named it (*scenarios*) is held at `PROVISIONAL`, because the supplied
description names the concept but does not explicitly establish its evidence
class. All three still render in the legend, with a count of zero. A visibly
provisional graph is the correct result, not a defect — and hiding an empty
class is a specification violation.

`PROVISIONAL` means *asserted, not verified*. v0.2 does not promote these legacy
edges: its approved design replaces them with discrete source-pinned evidence
records and prohibits entity-to-entity edges.

In **DECISIONS** mode, `INPUT: MISSING`, `INPUT: PROVISIONAL`, and
`INPUT: STATED` summarise only the lowest declared evidence class among methods
linked to a question. They do **not** mean that the question has been answered,
that a causal relationship has been shown, or that a management decision is
scientifically justified.

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

## Running it locally

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
