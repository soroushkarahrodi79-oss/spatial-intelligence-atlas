# UX_DIRECTION.md — Spatial Intelligence Atlas v0.3 (experimental proposal)

**Status:** EXPERIMENTAL PROPOSAL — NOT AN AUTHORIZATION TO MERGE. Lives on
branch `experiment/atlas-v0.3-experience`, off `main` at `v0.2.1`
(`ed57ed5`). Does not modify `main`, does not touch the `v0.2.0` or `v0.2.1`
tags, does not change `SPEC.md`, `DESIGN_CONTRACT.md`, `data/atlas.json`,
`index.html`, `styles.css`, or `app.js`. Any of those files being touched by
this branch's diff would trip `.github/GOVERNANCE_GATE.md` and require the
`gate-approved` label — none is applied, and none should be until a
maintainer runs a real Gate 0.

---

## 0. Baseline truth (Phase 0)

Verified directly against the repository, not assumed:

| Fact | Verified state |
|---|---|
| Current tag | `v0.2.1` at `ed57ed50d17aa7e8afe1f57b4222b98600f16ea9`, merged as PR #13 |
| `main` merge history | PR #1–#13 all merged; PR #10 (immersive-globe) was merged **by accident** and explicitly reverted at `d122822` — see below |
| Prior tags | `v0.2.0` (`54128ea`), `v0.1.1` (`f116b7c`), `v0.1.0` (`d3f399c`) — all immutable |
| Governance | `.github/GOVERNANCE_GATE.md` + `governance-gate.yml` CI check exist and are live: any PR touching `SPEC.md`, `DESIGN_CONTRACT.md`, `data/atlas.json`, `index.html`, `app.js`, or `styles.css` fails the required check unless labelled `gate-approved` |
| Content model | 4 entities (3 core cases, 1 supporting instrument) · 3 territories · 10 evidence records · 4 outcomes · 8 commit-pinned sources · 17 relationships. Zero entity-to-entity relationships. |
| Runtime | `index.html` (41 lines) + `styles.css` (122 lines) + `app.js` (464 lines) + `data/atlas.json` (347 lines), inline SVG, vanilla JS, zero dependencies, zero network requests beyond user-initiated source links |
| v0.2.1 delta over v0.2.0 | Accessibility/readability maintenance only (text-enlargement support, forced-colors focus visibility, evidence-mode label-spacing fix) — no content-model or IA change |

### The PR #10 incident (why this document treats the globe experiment as evidence, not a starting point)

`prototype/immersive-globe/` (on `experiment/immersive-globe`, 6 commits) is a
genuinely well-executed prototype: a Globe.GL/Three.js 3D globe for
TERRITORY, a case-by-case evidence-to-outcome reading strip, and its own
honest `README.md` and `SOURCES_AND_LICENSES.md`. Its own README already
lists six things that would require a new design contract before
integration: WebGL + a vendored third-party library, exceeding the four-file
budget, real geographic coordinates (even "representative" ones) where v0.2
forbids coordinates entirely, ambient auto-rotate motion, camera interaction
beyond the five authorised interactions, and a canvas that is not
keyboard-focusable.

That prototype was, at one point, merged into `main` as PR #10 — by
accident — and then explicitly reverted (`d122822`), which is the direct
reason `.github/GOVERNANCE_GATE.md` exists today. This is not a story about
a bad prototype; the prototype's own self-audit was correct and is echoed
below. It is a story about why v0.3 direction-setting has to happen on an
isolated branch with an explicit non-merge posture, and why "salvage
techniques, don't resurrect the artifact" (per the brief) is the right
instruction here, not a formality.

What is salvaged from it into this proposal: the instinct that TERRITORY
deserves a stronger sense of place than an abstract SVG rectangle, and the
case-by-case "reading strip" *structure* — one continuous document per
case rather than a graph — in a dependency-free, non-WebGL,
no-real-coordinates form (§3, Direction C). The globe prototype's own
section order (question → evidence → limitations → outcome → claim
ceiling) is not carried over unchanged: `SPEC_PROPOSAL.md` §3.1 resolves the
final v0.3 order as question → territory → result → claim ceiling →
evidence, front-loading the headline result and its boundary ahead of the
itemised evidence, for the reason given there.

---

## 1. Phase 1 — Information architecture audit

### 1.1 What the current IA actually is

One typed graph — 4 entities, 3 territories, 10 evidence records, 4
outcomes — rendered through three fixed projections (TERRITORY / EVIDENCE /
DECISIONS), each a separate full-screen mode with its own node-link layout.
A persistent detail panel holds the actual prose. Below 640px the graph is
replaced entirely by a structured text outline of the same data.

### 1.2 The structural fact this audit has to reckon with

Four independent entities, each with a small, fixed set of attributes
(one territory, 1–4 evidence records, one outcome, 2 sources). There are
**zero** entity-to-entity edges — that emptiness is the single most
important fact in the dataset (`SPEC.md` §1.2, invariant I7). A node-link
graph is a form optimised for showing *variable, discoverable topology*.
This dataset has no topology to discover: every edge a reader will ever see
is a spoke from one of four known hubs to one of its own attributes. The
graph form is answering a question ("how are these things connected to each
other?") that the data has already answered in the negative, and it answers
it indirectly, through absence, which is easy to misread as "not yet
connected" rather than "never connected."

This is worth stating plainly: **17 relationships sounds like a graph's
worth of structure. It is four unconnected fan-outs.** A reader's visual
system is tuned to find topology in a node-link diagram whether or not any
exists; four disconnected stars rendered close together, sharing a canvas
and a coordinate space, read as "a network" at a glance even though the
data actively denies being one. That is a communication risk the current
form carries structurally, independent of how carefully it is drawn.

### 1.3 Evaluation against the audit criteria

| Criterion | Current graph+3-modes IA | Assessment |
|---|---|---|
| Cognitive load | A reader must hold a mode (which of 3 questions am I answering?), a selection, and a remembered cross-mode picture of one case simultaneously to answer "what happened with CHALUS?" | High for the actual task. The three-way split forces the reader to do the assembly work the interface could do for them. |
| Discoverability | Mode control is a persistent tri-tab; individual nodes require hover/click to reveal identity | Fine for the aggregate view; poor for "just tell me about case X," which is the dominant real task per `SPEC.md` §2's audience table. |
| Comparison | No two cases are ever shown with the same attribute adjacent on screen | Weak. A reviewer wanting to compare claim ceilings across cases must open three detail panels in sequence and hold them in memory. |
| Provenance visibility | Sources live at the bottom of the detail panel, one hop from the node | Adequate but demoted; given `SPEC.md`'s own audience priority #1 ("research reviewer... source" within 30 seconds), source is currently the *last* thing shown, not a first-class element. |
| Mobile comprehension | The 360–639px structured-outline fallback is a **second, separately designed representation** of the same data | This is the IA's clearest tell: if the honest, accessible reading of this data at narrow width is a linear outline — not a graph — that is evidence the graph was never the right *primary* form, only the right form at ≥1024px. A representation that needs a wholesale substitute below 640px has a form/content mismatch, not just a responsive-design gap. |
| Scientific honesty | Non-integration notice is present in all three modes; zero entity-to-entity edges are real | Strong — this is the one place the current IA already gets the hard part right, and v0.3 must not weaken it. |
| Interaction cost | Reading one full case story costs: select in TERRITORY, note territory, switch to EVIDENCE, reselect same entity, read records, switch to DECISIONS, reselect again, read outcome | 3 mode switches + 3 reselections to assemble one case. This is the fragmentation the brief asks to be named explicitly (§21). |

### 1.4 What is fragmented across screens today

To answer "what happened in the CHALUS case, and what would I need to check
to trust it?" — a single, bounded, reasonable question — a reader today
must visit TERRITORY (for the territory), EVIDENCE (for the 3 evidence
records and their limitations), and DECISIONS (for the outcome and claim
ceiling), reselecting CHALUS fresh in each mode. The information was never
actually organized *by case*; it was organized *by projection*, and case
identity is reconstructed by the reader, per visit, from three passes.

### 1.5 Conclusion

The mode/graph IA should not survive into v0.3 as the *primary* structure.
It should survive as a capability: TERRITORY, EVIDENCE, and DECISIONS remain
real, correct questions (`SPEC.md` §5), and this proposal keeps them as the
three axes visible on every case — but the organizing unit changes from
"one graph, three lenses on all cases at once" to "one case, three questions
answered together, one lens at a time." §2 explores three genuinely
different structures against this finding.

---

## 2. Phase 2 — Three creative directions

Each was evaluated on IA, form, interaction, motion, mobile, accessibility,
performance, scientific-integrity risk, governance impact, and what
`SPEC.md`/`DESIGN_CONTRACT.md` sections a real adoption would need to
revise. None is assumed correct going in.

### Direction A — Comparative Research Plate

**IA.** Four columns (HATI, SNTO, CHALUS, FieldOS-separated), rows for
Territory / Question / Evidence / Result / Claim ceiling / Sources.

**Form.** A literal typed table/plate — HTML `<table>` or CSS grid, no SVG.

**Interaction.** Row selection expands that row's cells inline; no
navigation, no modes.

**Motion.** Row-expand only; no transition between "screens" because there
are none.

**Mobile.** Rows-become-cards is a natural, not bolted-on, transform —
CSS-only, no second representation needed. This already clears the
Direction-A-specific version of the failure found in §1.3.

**Accessibility.** Strongest candidate of the three — it is a table with a
correct `<caption>`, `<th scope>`, and `<td>`; screen readers already have a
mature model for reading this. No custom ARIA graph semantics needed.

**Performance.** Trivial — no rendering engine at all beyond CSS grid/table
layout.

**Scientific-integrity risk.** The real one: **placing four cases in
parallel columns visually invites ranking**, even with careful non-ranking
copy, because a grid's strongest affordance is "scan across a row and
compare." `SPEC.md` §1.2 and I10 forbid exactly this reading. It is
mitigatable (irregular row heights by design, explicit "documented
separately" language repeated per column, FieldOS's column visually
discontinuous from the three case columns) but it is a standing tax the
form imposes that has to be paid on every future edit.

**Governance implications.** None to SPEC content; `DESIGN_CONTRACT.md`'s
graph-specific sections (§2.5 node forms, §2.7 edges, §3.3 colour-on-edges)
would be replaced wholesale by a table-visual-language section — a large
rewrite for a form that still under-serves the "read one case end to end"
task (comparison and depth pull in opposite directions in a grid).

### Direction B — Evidence Constellation

**IA.** Same as today (graph + 3 modes) but node-link is replaced by a
deterministic radial cluster: each entity is a fixed anchor, its evidence
records/outcome sit at fixed angles/radii around it, proximity declared to
mean "belongs to this entity," nothing else.

**Form.** Still SVG, still SPEC §5's three modes.

**Interaction, motion, mobile.** Same shape as v0.2's, therefore inherits
the same §1.3 findings almost unchanged — including the "graph implies more
connection than exists" risk, since visually adjacent clusters on one
canvas still invite comparison across entities, and it still needs a
separate ≤639px fallback for the same reason v0.2 does.

**Verdict driver.** This direction changes *how the current form looks*
without changing *what task it optimizes for*. It answers "does this
preserve the Atlas identity while improving comprehension?" with: it
preserves identity, and improves comprehension only marginally, because the
underlying fragmentation identified in §1.4 (case story split across three
mode-visits) is untouched. Rejected as the primary direction for that
reason — not because it looks bad, but because it does not fix the
diagnosed problem.

### Direction C — Narrative Evidence Explorer (chosen — see §3)

**IA.** The organizing unit becomes the case (or instrument), not the
projection. An overview index lists all four; selecting one opens a
single-case reader that answers all three SPEC §5 questions in one
continuous, ordered view (final order resolved in `SPEC_PROPOSAL.md` §3.1:
question → territory → result → claim ceiling → evidence → verification).

**Form.** Structured HTML (headings, `<dl>`/`<ol>`, real prose), typeset
with the same restrained editorial register as v0.2, no graph, no canvas.

**Interaction.** Open a case, read down, open a source, go back. Radically
fewer interaction states than a graph: nothing to hover-highlight a
neighbourhood for, because there is no neighbourhood — a case's own record
is not a "connection," it is its content.

**Motion.** One real transition (overview → case reader, and back), plus
in-page progressive disclosure (expand a limitation, an evidence record).
Both are answers to "what becomes easier to understand because this moves"
(§4).

**Mobile.** The reading order does not change with viewport width — only
type scale and spacing do. There is no separate narrow-width
representation to design, build, or keep in sync, which directly resolves
the §1.3/§1.5 finding that a second fallback representation is itself
evidence of a form mismatch.

**Accessibility.** Strong — it is document-shaped, which is what screen
readers, text zoom, and reading-mode browser features are built for. No
custom node/edge ARIA vocabulary (`DESIGN_CONTRACT.md` §8.2) is needed at
all.

**Performance.** No SVG graph engine, no coordinate math, no layout
library — a static document render.

**Scientific-integrity risk.** Lowest of the three for the specific harm
this project cares about (implying integration or ranking): each case
reader is self-contained; there is no shared canvas, no shared coordinate
space, no adjacency between cases to misread. The overview index is a list,
not a grid of comparable cells, which sidesteps Direction A's central risk.
The one risk this direction does carry: **claim ceiling could get
buried at the bottom of a long read** the way sources currently are in
v0.2 — this proposal's explicit answer is in §3.3 and §4 (verified reads
should reach the claim ceiling as fast as the outcome, not after it).

**Governance implications.** Full rewrite of `SPEC.md` §3 (conceptual
model), §6 (interaction), §7 (detail-panel contract), §8 (information
hierarchy), and effectively all of `DESIGN_CONTRACT.md` §2 (layout), since
the page-frame/graph-canvas physical model no longer exists. This is the
largest governance footprint of the three directions — named honestly
here, not minimised, because it is the actual cost of fixing the diagnosed
problem rather than decorating around it.

### A fourth direction considered and rejected outright

A literal map/globe (à la `experiment/immersive-globe`) was not treated as
a fourth live candidate. §10 of the brief and `SPEC.md` §9.3/§9.4's
non-integration and dependency prohibitions, combined with the PR #10
incident (§0), make this a closed question, not an open one: any geographic
graphic beyond a text locator risks implying "validated territory data"
that `PROJECT_STATUS.md` §4 explicitly disclaims, and the prototype's own
README already lists six contract violations required to ship it. It is
recorded here as considered, and rejected on the evidence already gathered,
not re-litigated.

---

## 3. Phase 2 — Chosen direction and why it is stronger

**Direction C — Narrative Evidence Explorer**, with Direction A's plate
demoted from "the interface" to "the overview index" — a light, list-like
entry screen (not a grid of comparable cells) whose only job is orientation
and navigation into a case reader.

This is chosen on evidence, not aesthetics:

1. It is the only direction that resolves the fragmentation named in §1.4
   (one case's story currently requires 3 mode-visits) rather than
   re-skinning it (Direction B) or trading it for a new risk (Direction A
   alone).
2. It is the only direction that removes the need for a second, narrow-width
   representation — the §1.3 finding that a required fallback is itself
   evidence of a form/content mismatch is resolved structurally, not
   patched responsively.
3. It has the lowest scientific-integrity risk of the three for this
   project's specific concern (implying connection or ranking that does not
   exist), because it has no shared coordinate space or comparable-cell grid
   across independent entities.
4. It directly answers `SPEC.md` §2's audience table: a research reviewer's
   30-second need ("question, documented result, limitation, source") is a
   literal, in-order reading of one case reader, not an assembly task.
5. Its accessibility and performance posture is the strongest of the three,
   for a project whose entire premise is that the interface must not be the
   thing a reviewer has to trust — it must be legible enough that they don't
   have to.

It is also the most honest answer to §29's challenge questions: does Atlas
need a graph? No — the data has no topology to show. Does Atlas need
animation? Only the two kinds named in §4. Does Atlas need to look
geographic? No (§10, below). Do claim ceilings deserve first-class
placement? Yes — and this direction is the one that can put them there
without redesigning around a canvas.

---

## 4. Geography (Phase, per brief §10)

**Decision: no geographic graphic of any kind.** Territory remains a
declared text field ("Madrid — Atocha to Puerta de Alcalá," "Western
Mazandaran — Chalus, Nowshahr and Kelardasht"), rendered as prose with the
same typographic care as the research question, never as a coordinate, pin,
inset, or schematic mark. This is stricter than v0.2 needs to be (v0.2 at
least allows a conceptual-anchor node shape) because a case-reader document
has no natural place to put a locator graphic that wouldn't visually
outrank the text it is supposed to support — and the PR #10 evidence (§0)
shows how quickly "just a reference point" drifts toward implying validated
geometry. See the decision ledger (§6) for the alternatives rejected and
why.

---

## 5. What changed conceptually from v0.2 (explicit list, per brief §E)

- **Organizing unit:** projection (mode) → case/instrument. The three SPEC
  §5 questions (territory/evidence/decisions) survive as the three things
  every case reader answers, not as three separate screens.
- **Primary form:** SVG node-link graph → structured HTML document.
- **Entry point:** a graph canvas with a mode switch → an overview index of
  four cases (three-plus-one, FieldOS visually and structurally separated).
- **Narrow-width behaviour:** a second, purpose-built fallback
  representation → the same representation at every width, re-flowed.
- **Claim ceiling:** last field in the detail panel → elevated to appear
  immediately after the outcome, before the full evidence list, in every
  case reader (see `DESIGN_CONTRACT_PROPOSAL.md` §2).
- **Geography:** conceptual-anchor node shape → text-only locator, no
  graphic at all.
- **What did not change:** zero entity-to-entity relationships, the
  input-kind/substantiation vocabulary, the outcome-type vocabulary, the
  non-integration notice, the claim-ceiling wording per entity, achromatic
  outcomes, and the requirement that every claim resolve to a pinned
  source. See `SPEC_PROPOSAL.md` §0 for the itemised non-negotiables.

---

## 6. Decision ledger (Phase, per brief §28)

| Decision | Evidence | Alternative rejected | Why |
|---|---|---|---|
| Graph/mode IA retired as primary structure | §1.2–§1.4: zero entity-to-entity edges means no real topology; 3-mode-visit cost to read one case | Keep the graph, restyle only (Direction B) | Restyling doesn't fix the diagnosed fragmentation; it is a cost with no matching benefit |
| Case-centred narrative reader chosen as primary form | §3, items 1–5 | Comparative plate as the primary interface (Direction A alone) | Grid form structurally invites cross-case ranking, which `SPEC.md` I10 forbids; also worse at the "read one case deeply" task than at comparison |
| Comparative plate demoted to overview/index only | Combines A's orientation strength with C's low ranking-risk | A full always-visible comparison table | An index列表(list) of four items does not carry the same "scan-and-rank" affordance a populated grid does |
| No geographic graphic, text locator only | §4; PR #10 incident (§0); `SPEC.md` §9.3/§9.4 | A restrained "schematic region locator" | Even a deliberately abstract mark drifts toward implying geometry once shipped; the globe prototype's own README documents exactly this drift |
| WebGL/Three.js/Globe.GL rejected outright | §2, "fourth direction rejected"; PR #10 governance incident | Salvage the globe as v0.3's TERRITORY view | Contract-incompatible on 6 counts by its own README; already caused one governance incident |
| Single narrow-width fallback eliminated (not redesigned) | §1.3, §3 "mobile" rows | A better-designed second fallback for the graph | The need for a second representation is itself the defect, not something to polish |
| Claim ceiling promoted to appear directly after the outcome | §29's explicit challenge; audience table in `SPEC.md` §2 | Leave it at the end of the record, as in v0.2 | Reviewer's 30-second need is "result, limitation, source" — ceiling is the limitation, and burying it under-serves the top-priority reader |
| Ambient/auto motion rejected; only user-triggered transitions kept | Brief §11/§29; `DESIGN_CONTRACT.md` §6 precedent | Any autoplay or looping affordance | No new justification exists in v0.3 that didn't already exist and get rejected in v0.2 |
