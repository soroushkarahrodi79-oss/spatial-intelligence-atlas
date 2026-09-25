# SPEC_PROPOSAL.md — Spatial Intelligence Atlas v0.3 (experimental)

**This is NOT `SPEC.md`.** `SPEC.md` remains the sole authoritative
specification for the deployed `v0.2.1` artifact. This document proposes
what a future, separately gated v0.3 could specify. It has no force until a
maintainer runs a real Gate 0–4 sequence against it (`PROJECT_STATUS.md`
§5–§6). Nothing here authorises touching a governed file.

Companion documents: `UX_DIRECTION.md` (why), `DESIGN_CONTRACT_PROPOSAL.md`
(form), `MOTION_CONTRACT.md` (motion), `IMPLEMENTATION_PLAN.md` (how this
would actually get built if approved).

---

## 0. Non-negotiables carried forward unchanged from v0.2

These are restated, not reinterpreted. Any prototype or future
implementation that violates one of these is wrong, regardless of what else
this document says:

- Zero entity-to-entity relationships (`SPEC.md` I7). HATI, SNTO, CHALUS,
  and FieldOS remain independent. There is no pipeline, suite, or shared
  runtime.
- `input_kind` and `substantiation` remain two separate, never-collapsed
  axes (`SPEC.md` §4.3, I10).
- `outcome_type` values remain categorical, not ordinal; `ABSTAIN`,
  `INSUFFICIENT EVIDENCE`, `NO-GO`, and `FUNCTIONAL TEST` are achromatic and
  are not failure states.
- FieldOS remains `kind: "instrument"`, visually and structurally separated
  from the three cases, never presented as an equal case.
- Every substantive claim resolves to exactly one declared, commit-pinned
  source (`SPEC.md` §4.5, I4–I6).
- Territories remain declared context, never geometry (§7 of this document
  is, if anything, stricter than `SPEC.md` §4.2 on this point).
- The dataset (`data/atlas.json`) remains the single source of truth; no
  scientific content, wording, or numeric result changes to serve a v0.3
  layout. Where v0.3 needs presentation-only metadata (e.g. a reading-order
  index) not already in the schema, it is derived at render time or kept in
  a clearly-labelled non-semantic prototype file, never mixed into the
  frozen §12 payload.
- No sixth interaction family beyond what §4 of this document enumerates,
  and no interaction that v0.2 forbids (pan, drag, filter, search,
  multi-select, export, URL state, persistence) reappears.

---

## 1. Purpose

Unchanged from `SPEC.md` §1: a small, static, client-side research map
showing where work was situated, what evidence is documented, and what
result was reached — explanatory, not operational, performing no live
analysis, prediction, ranking, or validation.

What v0.3 changes is **how that purpose is organized on screen**: from
"one graph, three projections, assembled by the reader across mode
switches" to "one case, three questions, answered together, chosen from an
overview." The north star sentence is unchanged: *from projects to
defensible decisions: what was studied, what result was documented, what
remains unsupported, and where the reader can verify it.*

---

## 2. Audience

Unchanged from `SPEC.md` §2's priority table. v0.3's structural change is a
direct response to it: audience #1 (research reviewer, 30-second need:
question → result → limitation → source) is best served by a linear reading
order, which v0.2's mode-split structurally could not offer without three
mode visits (`UX_DIRECTION.md` §1.4).

---

## 3. Information architecture

### 3.1 Two screens, not three modes

1. **Overview** — a list of the four entities (three core cases, then
   FieldOS, visually separated as `SUPPORTING INSTRUMENT`), each showing:
   label, one-line role, territory (text), outcome verdict (text,
   achromatic), and an evidence-input-kind summary (the distinct glyphs
   present, not a count or bar — no quantity comparison across cases). This
   is orientation and navigation, not a comparison grid; it is presented as
   an ordered list (dataset order), never sortable, filterable, or
   re-rankable.
2. **Case reader** — opened by selecting an entity from the Overview. A
   single continuous, ordered document per entity:
   `question → evidence → result → claim ceiling → verification`. For
   FieldOS (no research question), the equivalent order is
   `role → evidence → functional result → limitations → verification`,
   matching `SPEC.md` §7's existing instrument ordering.

There is no third screen. TERRITORY, EVIDENCE, and DECISIONS survive as
**sections within the case reader**, not as separate views: every case
reader shows its territory, its evidence records, and its outcome, in that
fixed order, together.

### 3.2 Conceptual model

```text
ENTITY (case | instrument)
  ├── territory ───────────── declared text context (case only)
  ├── research_question ───── exact bounded question (case) or role (instrument)
  ├── evidence_records[] ──── input_kind + substantiation + basis + limitation + sources
  ├── outcome ──────────────── outcome_type + statement + claim_ceiling + sources
  └── sources[] ────────────── every source cited above, deduplicated, in one list
```

This is not a new graph — it is the same relational shape `SPEC.md` §3
already defines (`situated_in`, `documents`, `reports`), rendered as one
document per entity instead of as edges on a shared canvas. No new
relationship type is introduced; none is needed, because a document does
not require an edge to associate a paragraph with its own source.

### 3.3 Claim ceiling placement (binding change from v0.2)

The claim ceiling appears **immediately after the outcome statement**, before
the full evidence-record list, in every case reader. `SPEC.md` §7 currently
places claim ceiling 4th of 8 fields for a case and lets it terminate before
evidence is shown; this proposal moves it earlier because it is the answer
to the audience's stated 30-second question ("what does this NOT
establish"), not a footnote to the result.

---

## 4. Interaction inventory

| # | Interaction | Screen | Notes |
|---|---|---|---|
| 1 | Open a case/instrument | Overview → Case reader | Replaces "select a node"; same cost, clearer destination |
| 2 | Return to Overview | Case reader → Overview | Replaces "reset view"; always returns to the same ordered list, no state retained |
| 3 | Expand/collapse an evidence record's full basis + limitation | Case reader | Records show statement + input-kind + substantiation by default; "limitation" text is always visible (§0 forbids hiding it), only the verbatim `basis` quotation collapses for prose length |
| 4 | Open a declared source | Case reader | Identical contract to `SPEC.md` §6.4 — explicit activation, `target="_blank"`, `rel="noopener noreferrer"`, declared source only |
| 5 | Move focus between cases from within a case reader | Case reader | A lightweight "previous/next in Overview order" pair — **not** a cross-case relationship; it is list navigation, and is announced as such ("2 of 4"), never drawn as a connector |

Five interactions, matching `DESIGN_CONTRACT.md` §5.1's discipline of a
closed, enumerated inventory. Pan, zoom, drag, search, filter, multi-select,
and URL state remain excluded, as in v0.2.

### 4.1 State model

```
{ screen: "overview" | "case",
  openEntityId: string | null,
  expandedRecordIds: string[] }
```

Slightly larger than v0.2's two-value model because progressive disclosure
within a case reader needs to track which records are expanded — this is
presentation state, not new application meaning. No history stack, no
persistence, no `localStorage`, no URL sync. Reloading returns to Overview.

---

## 5. Allowed / forbidden implications

Unchanged from `SPEC.md` §9, restated for the new form:

**Forbidden:**
- The Overview list MUST NOT be sortable, filterable, or rankable by any
  field. Order is fixed dataset order.
- The "previous/next" navigation (§4, interaction 5) MUST NOT be rendered
  as a line, arrow, or any graphic implying a relationship between cases —
  text and an announced position only ("2 of 4").
- No numeric score, percentage, or star rating derived from `input_kind`,
  `substantiation`, or `outcome_type` anywhere in the Overview or case
  reader.
- No claim ceiling may be abbreviated, truncated with an ellipsis, or
  hidden behind a second click; it is always-visible text.

**Allowed:**
- Grouping evidence records visually by shared `input_kind` within a single
  case reader (still per-record labelled; grouping is a within-case reading
  aid, not a cross-case comparison).
- A short, factual authorship/provenance line (§8).

---

## 6. Responsive behaviour

Because the primary form is a document, not a canvas, v0.3 does not need a
separate sub-640px representation (`UX_DIRECTION.md` §1.3, §3). One layout,
four breakpoints, re-flowing type scale, spacing, and Overview list density:

| Breakpoint | Overview | Case reader |
|---|---|---|
| ≥ 1280px | Two-column list (territory-grouped visually, not ranked) | Single reading column, max-measure prose, evidence records as a labelled two-column table of `input_kind` + statement where space allows |
| 1024–1279px | Single-column list | Single reading column |
| 640–1023px | Single-column list, reduced vertical rhythm | Single reading column |
| 360–639px | Single-column list | Single reading column, full-width; evidence "table" collapses to stacked records (this is type reflow, not a second representation) |

No horizontal scroll at any width ≥ 360px, matching `DESIGN_CONTRACT.md`
§7's existing floor.

---

## 7. Geographic representation rules (binding)

Per `UX_DIRECTION.md` §4: **no geographic graphic of any kind.** Territory
is rendered as a text field with the same typographic treatment as the
research question — never a coordinate, pin, inset map, schematic region
mark, or globe. If a future v0.3+ gate wants to revisit this, it must
propose a new rule here explicitly (not retrofit one into a "just a
locator" graphic) and must address, by name, why the PR #10 drift (§0 of
`UX_DIRECTION.md`) would not recur.

---

## 8. Author attribution rule

Atlas remains a research/evidence interface, not a CV or portfolio (brief
§7). Proposed rule: a single, small, factual line in the page footer —
maintainer name and a link to the source repository — using the same
`micro` typographic register as the provenance footer already uses in v0.2,
and nowhere else. No photo, no bio, no "about the author" section, no
social links, no recruiter-facing copy. This is deliberately smaller and
less prominent than v0.2's existing provenance footer, not larger.

---

## 9. Provenance requirements

Unchanged in substance from `SPEC.md` §4.5–§4.7 (I4–I6): every evidence
record and outcome resolves to at least one declared, commit-pinned source;
every outbound link corresponds to exactly one declared source object;
`not_established` records point to the reviewed source set in which support
was absent, same as today. The case reader's "verification" section is the
full, de-duplicated list of every source cited earlier in that same reader —
not a new source vocabulary.

---

## 10. Accessibility requirements

Target unchanged: **WCAG 2.2 AA**. Because the form is now document-shaped,
several `DESIGN_CONTRACT.md` §8 requirements that exist specifically to
retrofit accessibility onto an SVG graph (custom `role="group"` graph
semantics, per-node synthetic `aria-label` sentences, an `aria-live` region
narrating mode/selection changes) are replaced by requirements native to
HTML documents:

- One `<h1>` (site title). Overview is `<h2>`; each case reader is its own
  `<h1>`-equivalent landmark (`<article>` with `aria-labelledby`) reached by
  normal navigation, not a synthetic live region.
- Landmarks: `<header>`, `<main>`, `<nav>` (previous/next), `<footer>`.
- Evidence records are a real list (`<ol>` or a table with `<th scope>`),
  not a canvas of shapes with computed accessible names.
- Source links are real `<a>` elements, `target="_blank"` +
  `rel="noopener noreferrer"`, accessible name states the source label and
  "opens in a new tab" — unchanged from `SPEC.md` §6.
- Focus order follows document order; no synthetic tab-order rule is
  required because there is no coordinate-based node order to override.
- Visible focus ring: 2px solid, 2px offset, achromatic — unchanged from
  `DESIGN_CONTRACT.md` §8.3.
- No information by colour alone — unchanged; input-kind colour is still
  paired with a text label and (§ below) a glyph.
- Touch targets ≥ 44×44px; text resizable to 200% without loss of content
  or horizontal scroll — unchanged.
- `prefers-reduced-motion` yields a complete, equivalent experience — see
  `MOTION_CONTRACT.md`.

---

## 11. Performance expectations

See `IMPLEMENTATION_PLAN.md` §3 for the comparison of rendering approaches
this proposal is based on. Summary: the case-reader form requires **less**
rendering machinery than v0.2, not more — no coordinate math, no SVG layout
pass, no synthetic hit-area geometry (`DESIGN_CONTRACT.md` §5.4). Budget:
first contentful paint of the Overview under 1 second on a mid-tier mobile
device over a throttled connection (all assets are local, so this is
realistically bounded by parse/render time, not network); case-reader
open/close transition ≤ 400ms per `MOTION_CONTRACT.md`.

---

## 12. Non-integration principle

Restated verbatim in intent from `SPEC.md` §1.2, with one addition specific
to the new form: the Overview's "previous/next" list navigation (§4.1,
interaction 5) MUST NOT be described, in copy or in code comments, using
language that implies sequence, flow, or pipeline (e.g. "next stage,"
"continues to"). It is alphabetical/dataset-order list traversal between
independent entries, and its own on-screen label must say so ("2 of 4," not
"next").

---

## 13. Every deviation from v0.2, itemised

| # | v0.2.1 | v0.3 proposal |
|---|---|---|
| 1 | 3 modes (Territory/Evidence/Decisions), each a full-screen graph | 2 screens (Overview, Case reader); the 3 questions become 3 sections inside every case reader |
| 2 | SVG node-link graph, deterministic `[0,1]` coordinates | No graph; structured HTML document, no coordinate system |
| 3 | Persistent side/bottom detail panel | Case reader *is* the detail — no separate panel, no empty state to design |
| 4 | Claim ceiling is field 4 of 8, after research status/territory | Claim ceiling immediately follows the outcome statement |
| 5 | Sub-640px: separate structured-outline fallback | One representation at all widths ≥360px; only type/spacing reflow |
| 6 | Territory is a conceptual-anchor node shape on canvas | Territory is plain text, no graphic |
| 7 | Interaction model keyed to hover/focus "1-hop neighbourhood" highlighting | No neighbourhood concept — a case reader's content already is its own neighbourhood |
| 8 | No author-attribution line specified | A single small factual attribution line, footer-only (§8) |
| 9 | Accessibility model built on synthetic graph ARIA + `aria-live` narration | Accessibility model native to documents/lists |
| 10 | `DESIGN_CONTRACT.md` §2 (page frame, graph canvas, node forms, edges) | Entirely superseded by `DESIGN_CONTRACT_PROPOSAL.md` §2 (document layout, no nodes/edges) |

No deviation changes dataset content, the evidence vocabulary, the outcome
vocabulary, or the zero-entity-to-entity-relationship invariant.
