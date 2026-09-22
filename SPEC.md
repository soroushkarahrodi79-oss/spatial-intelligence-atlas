# SPEC.md — Spatial Intelligence Atlas

**Artifact:** Spatial Intelligence Atlas — Tourism, Risk & Decision Systems

**Target version:** 0.2.0

**Document state:** GATE 1 DRAFT — REVIEW REQUIRED — IMPLEMENTATION NOT
AUTHORISED

**Gate record:** GitHub issue #5

**Historical baseline:** releases `v0.1.0` and `v0.1.1` remain immutable.

This document is the proposed source of truth for v0.2 meaning and behaviour.
It does not alter the released v0.1 artifacts and does not authorise changes to
`index.html`, `styles.css`, `app.js`, or `data/atlas.json`. On approval, this
document and `DESIGN_CONTRACT.md` become the implementation contract for v0.2.

---

## 1. Purpose

The Spatial Intelligence Atlas is a small, static, client-side research map
that shows, for a deliberately selected set of tourism and spatial-decision
projects:

1. **where the work is situated**;
2. **what evidence or input is actually documented**; and
3. **what result was reached, including abstention, insufficient evidence, or
   no-go outcomes**.

The north star is:

> From projects to defensible decisions: what was studied, what result was
> documented, what remains unsupported, and where the reader can verify it.

The atlas is explanatory, not operational. It renders a fixed, hand-authored
and source-pinned dataset. It performs no live analysis, prediction, ranking,
repository integration, or scientific validation.

### 1.1 Selection principle (binding)

Inclusion is earned by a documented research question, a reviewable evidence
record, and a bounded result. A repository is not included merely because it
exists, is visually attractive, or belongs to the same portfolio.

The initial v0.2 scope is:

| Entity | Role | Required presentation |
|---|---|---|
| HATI | Core research case | Published/frozen case with its documented abstention result and claim ceiling |
| SNTO | Core research case | Active bounded research with real Sentinel-2 inputs and an insufficient-evidence result |
| CHALUS | Core research case | Closed no-go case whose verification standard was not met |
| FieldOS | Supporting instrument | Functionally tested field-capture instrument; not an equal scientific case |

FIRSTLOOK-MAD and FAB remain part of the immutable v0.1 history but are not
primary v0.2 entities. Dizin, SNTO Alpine, Iran Soil, JOB, and other portfolio
repositories remain excluded until a later gate establishes a documented
question, evidence record, result, and reason for inclusion.

### 1.2 Non-integration principle (binding)

The included entities are separate. The atlas MUST NOT imply a pipeline,
technical integration, shared runtime, data exchange, common validation, or
product suite.

- There is no project-to-project relationship in the v0.2 schema.
- Adding any direct entity relationship requires a later gate that names its
  semantics and pins a primary source; it cannot be improvised as content.
- Conceptual similarity may be described in bounded prose; it does not create
  an edge.
- FieldOS has no entity-to-entity edge in v0.2. A later documented executed use
  may justify a new gate, but does not authorise an ad hoc content edit.
- No directional flow, arrow, or layout may imply data passing between cases.

The set of project-to-project relationships in v0.2 is required to be empty.

### 1.3 Evidence and result discipline (binding)

The atlas keeps three dimensions separate:

- **research status** — where an entity sits in its own lifecycle;
- **evidence record** — what input, observation, derivation, simulation, or
  owner attestation is documented;
- **research outcome** — what the reviewed source actually concluded.

None is a proxy for the others. Real input does not establish validation,
causality, decision sufficiency, or a positive result. A no-go or abstention is
a legitimate documented outcome, not a failed card to hide.

---

## 2. Audience

Design conflicts resolve toward the higher-priority reader.

| # | Reader | First-30-second need |
|---|---|---|
| 1 | Research reviewer / examiner | Question, documented result, limitation, source |
| 2 | Tourism or spatial-planning peer | Territory, evidence provenance, decision boundary |
| 3 | Technical reader | Data model and explicit non-integration limits |
| 4 | Institutional reader | A legible overview without maturity or operational hype |

The atlas is not for operational end users, customers, incident response, or
live destination management.

---

## 3. Conceptual model

The atlas is one typed graph rendered through three projections. The graph does
not model software architecture.

```text
CASE ── situated_in ──> TERRITORY
  │
  ├── documents ──────> EVIDENCE_RECORD
  │
  └── reports ────────> OUTCOME

INSTRUMENT ── documents ──> EVIDENCE_RECORD

```

The detail panel, not the edge count, carries the scientific meaning. Every
core case exposes its question, result, claim ceiling, lifecycle status,
review date, and primary sources.

---

## 4. Content model

### 4.1 `entity`

An entity has `kind: "case" | "instrument"` and these required fields:

| Field | Requirement |
|---|---|
| `id` | Stable unique identifier |
| `kind` | `case` or `instrument` |
| `label` | Public project name |
| `role` | One-sentence reason for inclusion |
| `research_question` | Exact bounded question, or `null` for an instrument |
| `research_status` | `active`, `frozen`, `closed`, or `maintenance` |
| `reviewed_at` | ISO date of the source review |
| `source_ids` | Sources supporting identity, question, and lifecycle status |
| `layout` | Deterministic coordinates for all three modes |

`instrument` is a distinct kind, not a weaker case. FieldOS MUST use
`kind: "instrument"`, carry no research question invented by the atlas, and be
visually separated from the three cases.

Results, claim ceilings, territories, and evidence records are linked through
relationship objects (§4.6). They MUST NOT be duplicated as entity fields.
`research_status` describes lifecycle only. Publication is represented by a
source object, functional testing by an outcome, and neither changes the
lifecycle vocabulary.

### 4.2 `territory`

A territory is a declared spatial context, not geometry. Required fields are
`id`, `label`, `kind`, `basis`, and `source_ids`.

The initial territory set covers Madrid, Sierra de Guadarrama, and the bounded
Northern Iran / Western Mazandaran study area used by CHALUS. FieldOS has no
territory node merely to fill a gap; its lack of a case-specific territory is
stated in its detail content.

No basemap, coordinates, administrative precision, or boundary geometry is
implied.

### 4.3 `evidence_record`

An evidence record describes a documented input or evidence-producing step. It
is not a quality score. Required fields:

| Field | Allowed values / rule |
|---|---|
| `id`, `label` | Stable identifier and concise public label |
| `input_kind` | `observed`, `acquired`, `derived`, `simulated`, `reported`, or `unestablished` |
| `substantiation` | `source_stated`, `owner_attested`, or `not_established` |
| `basis` | Exact bounded paraphrase or short quotation |
| `limitation` | What this record does not establish |
| `source_ids` | At least one pinned source; `not_established` points to the reviewed source set in which support was absent |

`input_kind` and `substantiation` MUST NOT be collapsed into a single scale.
The interface MUST NOT rank them or calculate a maturity score.

Input-kind definitions are binding:

| Value | Meaning |
|---|---|
| `observed` | Direct observation recorded for the bounded study or test |
| `acquired` | Existing real-world data obtained from a declared external source |
| `derived` | Produced from other records through a declared transformation |
| `simulated` | Produced by a model under stated assumptions or conditions |
| `reported` | Supplied as a report or assertion rather than directly observed by the project |
| `unestablished` | The reviewed sources do not establish an input kind |

Substantiation values are mutually exclusive and use this precedence:

- `owner_attested` — a first-party action or observation is claimed by the
  owner but has not been independently verified;
- `source_stated` — a pinned source documents the record and it is not being
  represented specifically as an unverified owner attestation;
- `not_established` — the reviewed source set does not establish the record.

### 4.4 `outcome`

An outcome is the result documented by a reviewed source. Required fields:
`id`, `outcome_type`, `statement`, `claim_ceiling`, `source_ids`, and
`reviewed_at`.

Allowed `outcome_type` values are:

- `bounded_finding`
- `abstain`
- `insufficient_evidence`
- `no_go`
- `functional_test`

These values are categorical, not ordinal. Publication belongs in
`research_status`, not in `outcome_type`. A `bounded_finding` is not
automatically stronger than `no_go`; the underlying question and evidence
boundary control interpretation.

The initial content MUST preserve these distinctions:

- HATI: the exact reviewed abstention / no-robust-difference result;
- SNTO: insufficient evidence to prioritise the reviewed management action;
- CHALUS: no-go because the historical-verification standard was not met;
- FieldOS: a bounded owner-attested functional field run, not scientific
  validation or production readiness.

### 4.5 `source`

Every substantive claim resolves to a declared source object:

| Field | Requirement |
|---|---|
| `id` | Stable unique identifier |
| `label` | Human-readable source title |
| `kind` | `repository`, `commit`, `release`, `publication`, `brief`, or `closeout` |
| `url` | HTTPS URL opened only by explicit user action |
| `pinned_ref` | Commit SHA, release tag, DOI, or immutable document identifier |
| `accessed_at` | ISO date |

A branch URL without `pinned_ref` is insufficient as the sole support for a
result or claim ceiling. Every outbound UI link MUST correspond to one source
object; arbitrary links in prose are forbidden.

### 4.6 `relationship`

Allowed relationship types are `situated_in`, `documents`, and `reports`.

Every relationship has only `id`, `source`, `target`, and `type`. Its legal
pairs are `case → territory`, `entity → evidence_record`, and
`entity → outcome`, respectively. The target territory, evidence record, or
outcome carries the basis and sources; duplicating them on the edge is
forbidden. There is no generic or direct entity-to-entity relationship type in
v0.2.

### 4.7 Data invariants

- **I1** — Every referenced id resolves to an existing object.
- **I2** — Every core case has a non-null question, status, review date, and
  pinned source, and is linked to at least one territory, evidence record, and
  outcome carrying the exact result and claim ceiling.
- **I3** — Every instrument is explicitly typed and visually separated from
  core cases.
- **I4** — Every outcome and evidence record, including an explicit
  `not_established` absence record, resolves to at least one declared source.
- **I5** — Every source used for a substantive claim has a `pinned_ref`.
- **I6** — Every outbound link resolves to a declared source URL.
- **I7** — No entity-to-entity relationship exists.
- **I8** — Every evidence record and outcome has exactly one incoming entity
  relationship; the parent link is not duplicated inside the target object.
- **I9** — Every visible node has deterministic coordinates for each mode.
- **I10** — No vocabulary encodes an ordinal project maturity or quality score.

---

## 5. The three modes

Exactly three modes exist. They are projections of one dataset, not separate
stories.

### 5.1 TERRITORY — Where was the work situated?

- Shows territories, core cases, and the supporting-instrument rail.
- Shows only source-backed `situated_in` relationships.
- FieldOS appears in the instrument rail with “No case-specific territory
  assigned”; it is not connected to a synthetic null place.
- Territory nodes are conceptual anchors, never map geometry.

### 5.2 EVIDENCE — What is actually documented?

- Shows entities and their evidence records.
- Each evidence record exposes `input_kind`, `substantiation`, `basis`,
  limitation, and sources.
- No evidence floor, composite score, maturity rank, or project ordering is
  calculated.
- Missing or unestablished support remains visible rather than being silently
  omitted.

### 5.3 DECISIONS — What result was documented?

- Shows entities and their outcome nodes.
- The mode question concerns documented results, not hypothetical uses.
- Outcome labels state the verdict before explanatory copy: for example
  `ABSTAIN`, `INSUFFICIENT EVIDENCE`, `NO-GO`, or `FUNCTIONAL TEST`.
- Every outcome displays its claim ceiling and primary-source link in the
  detail panel.
- The browser performs no inference over evidence records to generate an
  outcome.

---

## 6. Interaction behaviour

Exactly five interaction families are authorised:

1. **Switch mode** using the persistent three-item control.
2. **Hover or focus a node** to highlight its one-hop neighbourhood.
3. **Select a node** to populate the detail panel.
4. **Open a declared source** from the detail panel by explicit activation.
5. **Reset view** to TERRITORY mode with no selection.

Source links open with `target="_blank"` and `rel="noopener noreferrer"`. Their
accessible name includes the source label and “opens in a new tab”. Opening a
source is ordinary navigation; the application does not fetch, preview,
scrape, or validate remote content.

Selection survives a mode switch only when the selected object is visible in
the destination mode. `Esc` clears selection and returns focus. Hover and
keyboard focus produce identical highlighting.

Explicitly excluded: pan, zoom, dragging, search, filtering, multi-select,
export, URL state, persistence, edge tooltips, modal dialogs, source previews,
and automatic navigation.

---

## 7. Detail-panel contract

The detail panel is the primary accessible representation of meaning. Content
order is fixed.

For a case:

1. label and `CORE CASE`;
2. research question;
3. documented result;
4. claim ceiling;
5. research status and `reviewed_at`;
6. territory;
7. evidence records;
8. primary sources.

For an instrument:

1. label and `SUPPORTING INSTRUMENT`;
2. role;
3. documented functional result;
4. limitations;
5. research status and `reviewed_at`;
6. evidence records;
7. primary sources.

For evidence, outcome, and territory nodes, the panel shows the node statement,
basis, limitation or claim ceiling where applicable, parent entity, and
sources. No field may be replaced by marketing copy.

---

## 8. Information hierarchy

First-paint reading order is:

1. title and one-line purpose;
2. permanent non-integration notice;
3. mode control and current mode question;
4. graph canvas;
5. role/outcome key;
6. detail panel;
7. provenance footer with release, schema version, review date, and the
   statement: “Inputs, status, and outcomes are separate. Real input does not
   establish validation or decision sufficiency.”

The interface MUST make `CORE CASE` and `SUPPORTING INSTRUMENT` visible in text,
not only by shape or position.

---

## 9. Explicit non-goals

The v0.2 artifact MUST NOT:

1. integrate with or read from source repositories at runtime;
2. imply technical integration or data exchange between entities;
3. display a real map, basemap, tiles, route geometry, or projection;
4. claim scientific validation, causal attribution, operational readiness, or
   management sufficiency beyond a pinned source;
5. infer tourism demand, visitor pressure, revenue, closure, restriction, or
   investment effects not established by the reviewed source;
6. rank projects, compute maturity, or turn outcomes into a success ladder;
7. become a CV, repository catalogue, publication list, or chronological
   portfolio;
8. perform live computation over research data;
9. include a backend, database, authentication, telemetry, analytics, or
   runtime AI;
10. load remote data, scripts, styles, fonts, images, or source previews;
11. require a framework, package manager, build step, or layout library;
12. use promotional language or conceal abstention and no-go outcomes.

---

## 10. Gate 1 acceptance criteria

This design is ready for implementation review only when all are true:

- **A1** — Scope contains exactly three core cases and one supporting
  instrument unless a new gate amends the set.
- **A2** — FIRSTLOOK-MAD and FAB are absent from the primary graph and remain
  preserved in v0.1 history.
- **A3** — Every core case has a pinned primary source, exact result, claim
  ceiling, lifecycle status, and review date.
- **A4** — FieldOS is never presented as an equal research case and has no
  entity-to-entity edge; a documented executed use would require a later gate.
- **A5** — The schema separates entity, territory, evidence record, outcome,
  source, and relationship objects.
- **A6** — No all-pairs or default conceptual project graph exists.
- **A7** — No direct entity-to-entity relationship type or edge exists.
- **A8** — DECISIONS mode reports outcomes; it does not calculate them.
- **A9** — Every external link is declared in `source` data and requires an
  explicit user action.
- **A10** — No status, evidence kind, or outcome is treated as a project score.
- **A11** — All three modes remain deterministic and usable from 360px upward.
- **A12** — Full keyboard operation, non-colour redundancy, and reduced-motion
  behaviour satisfy `DESIGN_CONTRACT.md`.
- **A13** — The runtime remains fully static and makes no network request except
  user-initiated navigation to a declared source.
- **A14** — The v0.1.0 and v0.1.1 tags and release assets remain untouched.
- **A15** — A separate implementation gate approves exact content and pinned
  sources before any runtime or dataset change.

---

## 11. Gate sequence

1. **Gate 1 — specification:** review this document and
   `DESIGN_CONTRACT.md`. No runtime implementation.
2. **Gate 2 — content freeze:** verify exact questions, outcomes, claim
   ceilings, statuses, source URLs, pinned refs, and review dates.
3. **Gate 3 — implementation:** change the runtime and migrate
   `data/atlas.json` only after Gates 1 and 2 pass.
4. **Gate 4 — verification/release:** test invariants, accessibility,
   responsive behaviour, claim wording, links, and release provenance.

No later gate is implied by approval of an earlier one.
