# SPEC.md — Spatial Intelligence Atlas

**Artifact:** Spatial Intelligence Atlas — Tourism, Risk & Decision Systems
**Version:** 0.1.0 (specification stage; no implementation exists)
**Status of this document:** SOURCE OF TRUTH. Where this document and any other
statement disagree, this document wins. `data/atlas.json` is the source of truth
for *content*; this document is the source of truth for *meaning and behaviour*;
`DESIGN_CONTRACT.md` is the source of truth for *form and limits*.

---

## 1. Purpose

The Spatial Intelligence Atlas is a small, static, client-side visual artifact
that **explains the relationships between five existing research/software
systems** by placing them in a shared conceptual space.

It answers three questions, and only these three:

1. **Where does this work happen?** (TERRITORY)
2. **What is it actually founded on?** (EVIDENCE)
3. **What decisions could it inform?** (DECISIONS)

The atlas is an **explanatory** artifact, not an operational one. It renders a
fixed, hand-authored dataset. It performs no computation over live data, makes
no predictions, and does not execute any part of the systems it describes.

### 1.1 The non-integration principle (binding)

The five systems described here are **separate**. The atlas MUST NOT imply, by
visual language, wording, or layout, that they form a pipeline, a product suite,
a data flow, or a technically integrated stack.

Consequences that are binding on implementation:

- Project-to-project relationships use exactly one edge type,
  `conceptually_adjacent`, which is **symmetric and non-directional**.
- No arrowheads, no flow animation, and no directional gradients may be drawn on
  `conceptually_adjacent` edges.
- The five projects MUST be laid out as **siblings**, never as a chain or funnel.
- No copy anywhere in the UI may use the words *pipeline*, *integration*,
  *stack*, *platform*, *end-to-end*, or *unified system* in reference to the
  relationship between projects.

### 1.2 The evidence-discipline principle (binding)

The atlas asserts an evidence status **only where the source project description
explicitly supports it**. Everything else is labelled `PROVISIONAL` (asserted,
not substantiated) or `MISSING` (not declared at all).

This is deliberate. A visibly provisional graph is a correct result, not a
defect. The implementation MUST NOT "fill in" a more confident status to make
the visualisation look richer.

---

## 2. Audience

Ordered by priority. Design conflicts resolve toward the higher-priority reader.

| # | Reader | What they need in the first 30 seconds |
|---|--------|----------------------------------------|
| 1 | **Research reviewer / examiner** | What these systems are, what they rest on, where the claims are weak |
| 2 | **Domain peer** (tourism, climate risk, geospatial) | Territory, method vocabulary, evidence provenance |
| 3 | **Technical reader** (engineer, data scientist) | The conceptual model and its explicit limits |
| 4 | **Institutional / non-specialist reader** | A legible, non-hyped overview that does not overstate maturity |

Not in the audience: end users of any of the five systems, prospective
customers, and anyone expecting an operational tool.

---

## 3. Conceptual model

The atlas is a **single typed graph** rendered through three fixed projections.
There is one dataset; the three modes are three views of it, not three datasets.

```
                    ┌──────────────┐
        operates_in │  TERRITORY   │  where the work is situated
        ┌──────────►└──────────────┘
        │
┌───────┴──────┐  applies_method   ┌──────────────┐  yields_evidence  ┌──────────────┐
│   PROJECT    ├──────────────────►│    METHOD    ├──────────────────►│   EVIDENCE   │
└───────┬──────┘                   └──────┬───────┘                   │    CLASS     │
        │                                 │                           └──────────────┘
        │        supports_decision        │  supports_decision
        │        ┌────────────────────────┘
        ▼        ▼
   ┌──────────────────┐
   │     DECISION     │  a question the work could help answer
   └──────────────────┘

   PROJECT ◄──── conceptually_adjacent ────► PROJECT   (symmetric, NOT integration)
```

Three rules govern the whole model:

- **R1 — Verbatim vocabulary.** Every `method` node label is a term taken
  verbatim from a source project description. Terms that were folded into
  another node are recorded in that node's `folds` array; nothing is silently
  discarded.
- **R2 — Decisions are questions, not outputs.** Every `decision` node is
  phrased as an interrogative. The atlas does not claim any system produces a
  decision; it claims a system could *inform* a question. This avoids asserting
  capability that the source descriptions do not establish.
- **R3 — Support before status.** Every edge carries `support`, one of
  `stated` (present in the source description, with a `basis` quotation) or
  `authored` (asserted by the atlas author). An edge may terminate at a
  substantive evidence class (`e-real`, `e-derived`, `e-calibrated`,
  `e-simulated`) **only** if `support == "stated"`. Authored assertions must
  terminate at `e-provisional` or `e-missing`.

---

## 4. Node types

Five types. Counts are fixed for v0.1 and match `data/atlas.json` exactly.

### 4.1 `project` — 5 nodes

The five systems being related. Visual weight 3 (heaviest).

| id | Label | Territory | Notes |
|----|-------|-----------|-------|
| `p-hati` | HATI — Heat-Aware Tourism Intelligence | Madrid | Extreme heat and tourism |
| `p-firstlook` | FIRSTLOOK-MAD | Madrid, Madrid interurban | Wildfire / interurban environmental risk |
| `p-snto` | SNTO — Smart Tourism Observatory | Sierra de Guadarrama | Destination intelligence |
| `p-fieldos` | FIELDOS | *not declared* | Field observation infrastructure |
| `p-fab` | FAB | *not declared* | Visual/research interface experimentation |

`p-fab` carries `evidence_declaration: "e-missing"`. The source description
states FAB is *"not a data source unless explicitly represented as such."* No
such explicit representation exists in v0.1, therefore FAB has **zero**
`applies_method` edges and is rendered as a non-evidentiary node.

### 4.2 `territory` — 4 nodes

| id | Label | Kind |
|----|-------|------|
| `t-madrid` | Madrid | urban / municipal |
| `t-madrid-interurban` | Madrid — interurban fringe | interurban |
| `t-guadarrama` | Sierra de Guadarrama | protected destination |
| `t-unbound` | No territory declared | **null territory** (`is_null: true`) |

`t-unbound` is a **modelling device, not a place**. It exists so that an
undeclared territory is *visible* rather than silently absent. It MUST be
rendered differently from real territories (see DESIGN_CONTRACT §2.5) and MUST
be labelled in a way that makes its nature obvious.

### 4.3 `method` — 12 nodes

Analytical, technical, or procedural concepts, labelled verbatim from source
descriptions. Visual weight 1 (lightest).

`m-utci`, `m-solweig`, `m-heat-exposure`, `m-scenarios`, `m-decision-engine`,
`m-environmental-signals`, `m-real-data-acquisition`, `m-evidence-provenance`,
`m-sentinel2`, `m-open-data`, `m-evidence-classification`,
`m-field-collection`.

Folded terms (recorded in node `folds`, not lost):
- `m-sentinel2` folds *"remote sensing"*
- `m-field-collection` folds *"field evidence"*, *"observations"*,
  *"voice-to-text notes"*
- `m-heat-exposure` folds *"heat exposure"* as its own label (no fold)
- `m-evidence-provenance` and `m-evidence-classification` are **governance
  methods**: they describe how evidence is audited and labelled, not how it is
  produced. They therefore have **no** `yields_evidence` edges. This is correct,
  not an omission.

Terms promoted out of `method` into `decision` (recorded on the decision node's
`basis`): *"spatial eligibility"*, *"spatial risk"*, *"destination monitoring"*.

### 4.4 `evidence` — 6 nodes (the status vocabulary)

The six evidence classes are modelled as nodes so the atlas can display its own
epistemics. Each carries `rank`, `color`, `dash`, and `glyph`.

| id | Label | Definition | Substantiation rank |
|----|-------|------------|---------------------|
| `e-real` | REAL | Directly observed or acquired data | 2 (substantiated) |
| `e-derived` | DERIVED | Computed from other evidence via a declared transformation | 2 |
| `e-calibrated` | CALIBRATED | Adjusted or validated against an independent reference | 2 |
| `e-simulated` | SIMULATED | Produced by a model under specified conditions | 2 |
| `e-provisional` | PROVISIONAL | Asserted by this atlas but not substantiated by the source description | 1 |
| `e-missing` | MISSING | Not declared by the source description; the absence is itself the finding | 0 |

**Ranking is deliberately coarse.** Ranks express *substantiation*, not quality.
The four rank-2 classes are **not** ordered relative to one another; SIMULATED is
not "worse" than DERIVED. The implementation MUST NOT sort, colour-ramp, or
score the rank-2 classes against each other.

**Unused classes in v0.1.** `e-derived` and `e-calibrated` have **zero**
incoming edges, because no source description explicitly supports either status.
This is a correct outcome of §1.2. The legend MUST still render both classes,
with an explicit count of `0`. Hiding an empty class is a specification
violation.

### 4.5 `decision` — 5 nodes

Interrogatives (rule R2). Visual weight 2.

| id | Question | Grounded in |
|----|----------|-------------|
| `d-eligibility` | Where is intervention spatially eligible? | HATI: "spatial eligibility", "decision engine" |
| `d-scenario` | How do outcomes differ across scenarios? | HATI: "scenarios" |
| `d-risk` | Where is spatial risk concentrated? | FIRSTLOOK-MAD: "spatial risk" |
| `d-monitoring` | Is the destination changing? | SNTO: "destination monitoring" |
| `d-observed` | What was actually observed on the ground? | FIELDOS: "field evidence, observations" |

**Total: 32 nodes.**

---

## 5. Edge types

Five types. Every edge carries `id`, `type`, `source`, `target`, `support`
(`stated` | `authored`), `basis` (string), and `evidence`
(evidence-class id or `null`).

| type | source → target | Directed? | Arrowhead? | Meaning |
|------|-----------------|-----------|------------|---------|
| `operates_in` | project → territory | yes | no | The project declares activity in this territory |
| `applies_method` | project → method | yes | no | The project's description names this method |
| `yields_evidence` | method → evidence | yes | yes | Applying this method produces evidence of this class |
| `supports_decision` | project \| method → decision | yes | yes | This could inform this question |
| `conceptually_adjacent` | project ↔ project | **no** | **never** | Sibling relationship. **Not integration.** (§1.1) |

### 5.1 Edge styling invariant (binding)

**Every edge's colour and stroke pattern is driven by `edge.evidence` and
nothing else.** When `edge.evidence` is `null`, the edge renders as a neutral
hairline. There is no per-edge-type colour. This keeps colour meaning
one-dimensional and is the reason the palette is restricted (DESIGN_CONTRACT §3).

### 5.2 Data invariants (must be checkable by inspection)

- **I1** — Every `edge.source` and `edge.target` resolves to an existing node id.
- **I2** — Every edge's `(source.type, target.type)` pair is legal for its `type`
  per the table above.
- **I3** — For `yields_evidence` edges, `edge.evidence == edge.target`.
- **I4** — If `edge.evidence ∈ {e-real, e-derived, e-calibrated, e-simulated}`
  then `edge.support == "stated"` and `edge.basis` is a non-empty quotation.
- **I5** — Every node has `layout` coordinates for all three modes, each in
  `[0, 1]`.
- **I6** — `p-fab` has zero `applies_method` edges.
- **I7** — No `conceptually_adjacent` edge is duplicated in reverse.

---

## 6. The three interaction modes

Exactly three. No fourth mode may be added in v0.1. Modes are switched, never
combined.

### 6.1 TERRITORY

**Question:** Where does this work happen?

- **Anchors:** the 4 `territory` nodes, in a row across the upper third.
- **Visible node types:** `territory`, `project`.
- **Visible edge types:** `operates_in`, `conceptually_adjacent`.
- **The point of the mode:** two of five projects have no declared territory.
  `t-unbound` must make this legible at a glance.

### 6.2 EVIDENCE

**Question:** What is this actually founded on?

- **Anchors:** the 6 `evidence` nodes, in a row across the lower area, in fixed
  vocabulary order: REAL, DERIVED, CALIBRATED, SIMULATED, PROVISIONAL, MISSING.
- **Visible node types:** `evidence`, `method`, `project`.
- **Visible edge types:** `applies_method`, `yields_evidence`.
- **Layout:** three tiers — projects (top), methods (middle, staggered),
  evidence classes (bottom).
- **Legend:** all six classes, always, with counts. `DERIVED 0` and
  `CALIBRATED 0` are shown, not hidden (§4.4).
- **Filter:** legend entries toggle their class on/off. This is the only filter
  in the artifact.
- **The point of the mode:** the graph is provisional-heavy. That is the finding.

### 6.3 DECISIONS

**Question:** What decisions could this inform?

- **Anchors:** the 5 `decision` nodes, in a row across the upper area.
- **Visible node types:** `decision`, `project`, `method`.
- **Visible edge types:** `supports_decision`, `applies_method`.
- **Evidence floor:** for each decision, the implementation computes the
  **minimum substantiation rank** across all methods with a `supports_decision`
  edge into it, and displays it as one of three states: `MISSING` (0),
  `PROVISIONAL` (1), `SUBSTANTIATED` (2). It MUST NOT display a rank-2 class
  name as the floor, because rank-2 classes are unordered (§4.4).
  - **Governance methods are excluded.** `m-evidence-provenance` and
    `m-evidence-classification` have no `yields_evidence` edge (§4.3) and are
    skipped in the computation. They are not treated as rank 0.
  - Project-level `supports_decision` edges are also excluded; only methods
    contribute a rank.
  - Expected v0.1 result, which doubles as a correctness check:
    `d-eligibility` PROVISIONAL, `d-scenario` PROVISIONAL, `d-risk`
    PROVISIONAL, `d-monitoring` SUBSTANTIATED, `d-observed` SUBSTANTIATED.
- `p-fab` has no `supports_decision` edges and is parked at the left margin in a
  visibly inert state, labelled as such.
- **The point of the mode:** every question is reachable, but the floor beneath
  most of them is provisional.

---

## 7. Interaction behaviour

Five interactions. No sixth. (Limits are enforced in DESIGN_CONTRACT §5.)

### 7.1 Mode switch
- Control: a three-item segmented control, always visible.
- Keyboard: `1`, `2`, `3`; also arrow keys when the control has focus.
- Node positions animate between the two modes' stored coordinates.
- Selection is **preserved** across a mode switch if the selected node is
  visible in the new mode; otherwise selection clears.
- The mode change is announced via an ARIA live region.

### 7.2 Hover / focus (highlight)
- Highlights the node and its direct (1-hop) neighbourhood.
- All non-neighbourhood elements drop to a reduced opacity; **nothing is
  removed** from the DOM.
- Shows a small tooltip: node label + type + (for methods) its evidence class.
- Hover and keyboard focus produce **identical** visual results.

### 7.3 Select (click / Enter)
- Opens the detail panel for that node.
- Panel contents, in order:
  1. Label and type
  2. One-sentence definition
  3. `basis` — the source phrase the node was drawn from
  4. `folds` — any terms folded into this node (if present)
  5. Connections, grouped by edge type, each showing `support` and `evidence`
- Selecting a second node replaces the panel; it does not stack.
- `Esc` deselects and returns focus to the previously focused node.

### 7.4 Legend filter (EVIDENCE mode only)
- Toggling a class dims (never deletes) all edges and methods of that class.
- Toggle state is announced. Toggling all classes off is permitted and shows an
  explicit empty-state message.

### 7.5 Reset
- A single "Reset view" control clears selection and all filters and returns to
  TERRITORY mode.

### Explicitly excluded from v0.1
No pan. No zoom. No node dragging. No free-text search. No URL state / deep
linking. No export. No tooltips on edges. No context menus. No modals.

---

## 8. Information hierarchy

Reading order on first paint, top to bottom, is fixed:

1. **Title block** — "Spatial Intelligence Atlas" / "Tourism, Risk & Decision
   Systems", plus a one-line statement of what the artifact is.
2. **Non-integration notice** — a permanently visible, non-dismissible line:
   *"Five separate systems. Related conceptually, not technically integrated."*
   This is not a tooltip and not a footnote. It is structural.
3. **Mode control** — three modes, current mode obvious without colour alone.
4. **Mode question** — the current mode's question rendered as a subhead
   (e.g. "What is this actually founded on?").
5. **Graph canvas** — the largest element on the page.
6. **Legend** — evidence classes with counts (EVIDENCE mode), or the current
   mode's key.
7. **Detail panel** — right side on wide viewports; empty state prompts
   "Select a node".
8. **Provenance footer** — dataset version, node/edge counts, and the sentence:
   *"Evidence status is asserted only where the source description supports it.
   PROVISIONAL means asserted, not verified."*

### Visual weight ladder
`project` (3) > `territory` / `decision` / `evidence` (2) > `method` (1).
Edge weight never exceeds node weight; edges are hairlines throughout.

---

## 9. Explicit non-goals

The artifact **does not**, and in v0.1 must not:

1. Integrate, connect to, or read from any of the five source repositories.
2. Represent a data pipeline or runtime dependency between the projects.
3. Display a real map, basemap, tiles, coordinates, or geographic projection.
   Territories are **conceptual anchors**, not geometry.
4. Claim accuracy, validation, or operational readiness for any system.
5. Assign an evidence status not explicitly supported by the source text.
6. Represent the author's biography, CV, publication list, or career timeline.
7. Perform any computation over real data.
8. Include a backend, database, API, authentication, telemetry, analytics, or
   runtime AI of any kind.
9. Load anything over the network at runtime — no CDN, no webfont, no external
   image, no remote JSON.
10. Require a build step, bundler, package manager, or framework.
11. Rank the five projects, score them, or imply maturity ordering.
12. Use narrative, promotional, or marketing language.
13. Provide search, export, printing, sharing, or persistence features.

---

## 10. v0.1 acceptance criteria

The implementation is complete when **all** of the following are true. Each is
independently verifiable by inspection.

### Data
- **A1** — `data/atlas.json` is loaded at runtime and is the *only* source of
  graph content. No node, edge, label, or coordinate is hard-coded in `app.js`.
- **A2** — All seven invariants I1–I7 (§5.2) hold against the shipped dataset.
- **A3** — Node counts render as: 5 project, 4 territory, 12 method, 6 evidence,
  5 decision = 32.

### Modes
- **A4** — Exactly three modes exist and are reachable by pointer and keyboard.
- **A5** — Each mode shows only its declared node and edge types (§6).
- **A6** — Node positions in each mode match the stored `layout` coordinates for
  that mode; no physics simulation, no randomness, no layout library. Two loads
  produce pixel-identical layouts.
- **A7** — EVIDENCE mode renders all six legend entries, including
  `DERIVED 0` and `CALIBRATED 0`.
- **A8** — DECISIONS mode shows an evidence floor for each decision as
  MISSING / PROVISIONAL / SUBSTANTIATED, never as a rank-2 class name.

### Semantics
- **A9** — Edge colour and dash pattern derive solely from `edge.evidence`
  (§5.1); `null` renders as a neutral hairline.
- **A10** — `conceptually_adjacent` edges render with no arrowhead, no
  direction, and no animation.
- **A11** — The non-integration notice (§8.2) is present, visible in all three
  modes, and not dismissible.
- **A12** — `t-unbound` is visually distinguished from real territories and its
  label makes clear it denotes an undeclared territory.
- **A13** — `p-fab` renders with zero method edges and is described in its
  detail panel as not an evidence source.
- **A14** — Every node's detail panel shows its `basis`.

### Accessibility & form
- **A15** — Every colour-encoded distinction has a redundant non-colour encoding
  (stroke pattern **and** text label).
- **A16** — Full keyboard operation: mode switch, node traversal, select,
  deselect, legend toggle, reset.
- **A17** — `prefers-reduced-motion: reduce` removes all transitions.
- **A18** — No horizontal page scroll at any viewport width from 360px upward.
- **A19** — All contrast ratios meet the values locked in DESIGN_CONTRACT §3.

### Scope
- **A20** — The repository contains exactly `index.html`, `styles.css`,
  `app.js`, `data/atlas.json`, plus the three markdown documents. No other
  runtime file, unless DESIGN_CONTRACT §8's narrow exception is invoked and
  documented in README.
- **A21** — Opening the artifact from a local static server works with zero
  network requests beyond `index.html`, `styles.css`, `app.js`,
  `data/atlas.json`.
- **A22** — If `data/atlas.json` fails to load, the page renders a clear,
  styled explanation and the command to serve the directory — never a blank
  page and never a console-only error.

---

## 11. Deferred to v0.2+ (recorded, not authorised)

Listed so a later implementer does not mistake them for oversights:
territory geometry / real basemap; resolving PROVISIONAL edges to substantive
classes via source-owner confirmation; per-project temporal dimension;
additional projects; deep linking; printable export.

None of these may appear in v0.1.
