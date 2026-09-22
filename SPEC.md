# SPEC.md — Spatial Intelligence Atlas

**Artifact:** Spatial Intelligence Atlas — Tourism, Risk & Decision Systems

**Target version:** 0.2.0

**Document state:** GATE 1 APPROVED — GATE 2 APPROVED — GATE 3 IMPLEMENTATION
DRAFTED (this branch) — GATE 4 VERIFICATION/RELEASE UNAUTHORISED

**Gate record:** GitHub issue #5

**Historical baseline:** releases `v0.1.0` and `v0.1.1` remain immutable.

This document is the source of truth for v0.2 meaning and behaviour. The
maintainer approved Gate 2's semantic content freeze on 2026-09-22 and
authorised Gate 3 implementation. `index.html`, `styles.css`, `app.js`, and
`data/atlas.json` have been migrated to this contract on a review branch
(`impl/v0.2-gate3`) and are not yet merged to `main` or released. Merging to
`main` makes this the live GitHub Pages artifact, so it is treated as
requiring the same explicit maintainer confirmation as Gate 4.

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
- **A15** — A separate content gate approves exact content and pinned sources
  before any implementation gate or runtime/dataset change.

---

## 11. Gate sequence

1. **Gate 1 — specification — APPROVED:** `SPEC.md` and
   `DESIGN_CONTRACT.md`, merged through PR #6.
2. **Gate 2 — content freeze — APPROVED (2026-09-22):** the semantic payload in
   §12 is frozen; content drafted through PR #7 and approved by the maintainer
   in issue #5.
3. **Gate 3 — implementation — DRAFTED, PENDING MERGE:** the runtime and
   `data/atlas.json` have been migrated to this contract on branch
   `impl/v0.2-gate3`. Not yet merged to `main`.
4. **Gate 4 — verification/release — UNAUTHORISED:** test invariants,
   accessibility, responsive behaviour, claim wording, links, and release
   provenance; cut a v0.2 release. Because GitHub Pages deploys from `main`,
   merging the Gate 3 branch is treated as part of this gate and requires
   explicit maintainer confirmation, not merge-alone.

No later gate is implied by approval of an earlier one.

---

## 12. Gate 2 semantic content freeze

**State:** APPROVED (2026-09-22). The records below are the complete semantic
payload for v0.2 and have been migrated into `data/atlas.json` on branch
`impl/v0.2-gate3` under Gate 3.

### 12.1 Scope clarification

The HATI case in v0.2 is the frozen **pedestrian-heat extension**, not the
original DOI-bound HATI-Madrid pilot. The published pilot is relevant context,
but its research question and locked results MUST NOT be combined with the
extension's `ABSTAIN / NO ROBUST DIFFERENCE` outcome.

### 12.2 Entities

| id | kind | label | role | research question | research status | reviewed_at | source_ids |
|---|---|---|---|---|---|---|---|
| `c-hati-pedestrian` | `case` | HATI — Pedestrian Heat Extension | Frozen robustness case for evidence-first pedestrian heat comparison | Across the two frozen Atocha–Puerta de Alcalá routes and tested departure times, does the modelled thermal evidence remain strong enough under justified canopy-vintage and side-of-street perturbations to establish either route as robustly cooler? | `frozen` | `2026-09-22` | `s-hati-gate3b`, `s-hati-status` |
| `c-snto-pnsg` | `case` | SNTO — PNSG Decision Evidence | Bounded destination-management case using environmental and governance evidence | With the evidence currently ingested, which PNSG public-use units, if any, justify priority management review or monitoring for the 2027 planning cycle, and where is evidence insufficient to establish priority? | `active` | `2026-09-22` | `s-snto-brief`, `s-snto-readme` |
| `c-chalus` | `case` | CHALUS — Western Mazandaran Pilot | Closed historical road-accessibility verification case | Do paired January and route-bounded June 2024 historical-network reconstructions meet the pre-registered verification standard required before Earth-observation processing and any later tourism-accessibility claim? | `closed` | `2026-09-22` | `s-chalus-closeout`, `s-chalus-readme` |
| `i-fieldos` | `instrument` | FieldOS | Offline-first supporting instrument for structured tourism field evidence capture | `null` | `active` | `2026-09-22` | `s-fieldos-run`, `s-fieldos-readme` |

### 12.3 Territories

| id | label | kind | basis | source_ids |
|---|---|---|---|---|
| `t-madrid` | Madrid — Atocha to Puerta de Alcalá | bounded urban route-comparison context | The HATI extension freezes two candidate pedestrian routes between Atocha and Puerta de Alcalá. | `s-hati-gate3b` |
| `t-pnsg` | Parque Nacional de la Sierra de Guadarrama | protected-area destination | The SNTO decision brief concerns PNSG public-use units and the 2027 planning cycle. | `s-snto-brief` |
| `t-western-mazandaran` | Western Mazandaran — Chalus, Nowshahr and Kelardasht | bounded regional accessibility study area | CHALUS evaluates three destinations from south, east and west gateways for the June 2024 event context. | `s-chalus-readme`, `s-chalus-closeout` |

FieldOS has no case-specific territory. No null-territory node is created.

### 12.4 Evidence records

| id | entity | input_kind | substantiation | statement | limitation | source_ids |
|---|---|---|---|---|---|---|
| `ev-hati-modelled-routes` | `c-hati-pedestrian` | `simulated` | `source_stated` | A modelled two-route thermal comparison was stress-tested at two departure times against justified canopy-source-vintage and side-of-street perturbations. | The ensemble does not establish observed pedestrian exposure, health, safety, preference, or a robust route winner. | `s-hati-gate3b`, `s-hati-status` |
| `ev-snto-s2-inputs` | `c-snto-pnsg` | `acquired` | `source_stated` | Real Sentinel-2 observations cover 21 PNSG campaign assets from January 2021 through June 2026. | Satellite vegetation signal is environmental context, not visitor pressure, tourism impact, or causal attribution. | `s-snto-brief` |
| `ev-snto-trends` | `c-snto-pnsg` | `derived` | `source_stated` | NDVI/NDMI/EVI series and Mann–Kendall/Sen results are derived per asset; six assets green, fourteen show no trend, and one declines significantly. | Derived environmental trends do not establish trail condition, ecological impact, or cause. | `s-snto-brief` |
| `ev-snto-prug` | `c-snto-pnsg` | `acquired` | `source_stated` | Official PNSG PRUG protection zoning is available as a real management layer. | Zoning is not evidence of visitor volume, condition, or impact. | `s-snto-brief` |
| `ev-snto-visitor-gap` | `c-snto-pnsg` | `unestablished` | `not_established` | No visitor-use evidence exists at asset or trail scale in the reviewed source set. | Without a matching use denominator, a physical-intervention priority cannot be established. | `s-snto-brief` |
| `ev-chalus-osm-source` | `c-chalus` | `acquired` | `source_stated` | The January OSM binary source was recovered by recorded SHA-256 and used with the bounded June reconstruction inputs. | OSM-attested network state is not independent confirmation that decisive motorway sections were operational at the historical cutoff. | `s-chalus-closeout` |
| `ev-chalus-routes` | `c-chalus` | `derived` | `source_stated` | Paired retrospective networks produced reproducible modelled distances for nine gateway–destination pairs and eighteen route states; the maximum January–June difference was 0.011%. | Numeric stability alone does not satisfy the pre-registered historical-verification standard. | `s-chalus-closeout` |
| `ev-chalus-verification-gap` | `c-chalus` | `unestablished` | `not_established` | Full Haraz correspondence, complete June turn restrictions, and independent decisive-motorway operational status were not established. | These gaps trigger the frozen no-go rule regardless of the stable modelled distances. | `s-chalus-closeout` |
| `ev-fieldos-iphone-run` | `i-fieldos` | `observed` | `owner_attested` | One 60–120 minute offline field workflow on a physical iPhone completed on 2026-08-31; tested capture, close/reopen persistence, export, and backup passed with no intended data loss reported. | The result is one first-party session without independent audit; observation counts, exact duration, device/OS details, timing metrics, and storage-pressure results were not recorded. | `s-fieldos-run`, `s-fieldos-readme` |
| `ev-fieldos-android-gap` | `i-fieldos` | `unestablished` | `not_established` | No physical Android test had been run at the reviewed commit. | Cross-platform reliability is not established. | `s-fieldos-readme` |

### 12.5 Outcomes

| id | entity | outcome_type | statement | claim_ceiling | reviewed_at | source_ids |
|---|---|---|---|---|---|---|
| `o-hati-abstain` | `c-hati-pedestrian` | `abstain` | `ABSTAIN / NO ROBUST DIFFERENCE`: the route-difference sign reversed under at least one justified perturbation at both tested departure times and the ensemble spanned zero. | Neither route is established as cooler, preferred, accurate, comfortable, behaviourally superior, physiologically safer, lower-dose, or healthier; the result does not mean the routes are thermally identical. | `2026-09-22` | `s-hati-gate3b`, `s-hati-status` |
| `o-snto-insufficient` | `c-snto-pnsg` | `insufficient_evidence` | Evidence is insufficient to prioritise any physical intervention, closure, quota, restoration, or budget commitment; monitoring and improved data collection are the proportionate actions. | No asset/trail visitor volume, tourism causality, ground condition, ecological impact, monetary allocation, closure, or restriction claim is supported. | `2026-09-22` | `s-snto-brief` |
| `o-chalus-no-go` | `c-chalus` | `no_go` | `GATE 2A-R CLOSED — NO-GO`: the historical-verification standard was not met, so Earth-observation processing and Gate 2B remain unauthorised. | The case does not establish tourist delay, cancellations, demand, revenue loss, destination resilience, infrastructure investment need, or a verified historical motorway-operability claim. | `2026-09-22` | `s-chalus-closeout`, `s-chalus-readme` |
| `o-fieldos-functional` | `i-fieldos` | `functional_test` | One owner-attested iPhone field workflow passed the executed offline capture-to-backup checks with no intended data loss reported. | FieldOS is not thereby validated, production-ready, field-proven across conditions, independently audited, or cross-platform verified. | `2026-09-22` | `s-fieldos-run`, `s-fieldos-readme` |

### 12.6 Sources

All repository URLs below are commit-pinned. A moving branch URL is not a
substitute.

| id | kind | label | pinned_ref | accessed_at | url |
|---|---|---|---|---|---|
| `s-hati-gate3b` | `closeout` | HATI Gate 3B evidence-sufficiency decision | `c69688e7827f1faaf855fdb58a8e80a497d73830` | `2026-09-22` | https://github.com/soroushkarahrodi79-oss/heat-adaptive-tourism-madrid/blob/c69688e7827f1faaf855fdb58a8e80a497d73830/docs/research/pedestrian-heat/gate3b/GATE3B_DECISION.md |
| `s-hati-status` | `closeout` | HATI canonical project status | `c69688e7827f1faaf855fdb58a8e80a497d73830` | `2026-09-22` | https://github.com/soroushkarahrodi79-oss/heat-adaptive-tourism-madrid/blob/c69688e7827f1faaf855fdb58a8e80a497d73830/PROJECT_STATUS.md |
| `s-snto-brief` | `brief` | SNTO PNSG Public-Use Decision Evidence Brief 2026/27 | `2c65fe2ac9a09662cddef4cfa68290e0cd6e1278` | `2026-09-22` | https://github.com/soroushkarahrodi79-oss/snto-smart-tourism-observatory/blob/2c65fe2ac9a09662cddef4cfa68290e0cd6e1278/docs/PNSG_DECISION_EVIDENCE_BRIEF.md |
| `s-snto-readme` | `repository` | SNTO repository status snapshot | `2c65fe2ac9a09662cddef4cfa68290e0cd6e1278` | `2026-09-22` | https://github.com/soroushkarahrodi79-oss/snto-smart-tourism-observatory/blob/2c65fe2ac9a09662cddef4cfa68290e0cd6e1278/README.md |
| `s-chalus-closeout` | `closeout` | CHALUS Gate 2A-R final closeout report | `eaa50dccd499b85204982d838ccf340d4d499992` | `2026-09-22` | https://github.com/soroushkarahrodi79-oss/CHALUS/blob/eaa50dccd499b85204982d838ccf340d4d499992/docs/GATE2AR_FINAL_REPORT.md |
| `s-chalus-readme` | `repository` | CHALUS repository status snapshot | `eaa50dccd499b85204982d838ccf340d4d499992` | `2026-09-22` | https://github.com/soroushkarahrodi79-oss/CHALUS/blob/eaa50dccd499b85204982d838ccf340d4d499992/README.md |
| `s-fieldos-run` | `closeout` | First FieldOS field run | `271d3a77c58361f43459d068f4e8a100611a87fd` | `2026-09-22` | https://github.com/soroushkarahrodi79-oss/fieldos/blob/271d3a77c58361f43459d068f4e8a100611a87fd/docs/FIRST_FIELD_RUN.md |
| `s-fieldos-readme` | `repository` | FieldOS repository status snapshot | `271d3a77c58361f43459d068f4e8a100611a87fd` | `2026-09-22` | https://github.com/soroushkarahrodi79-oss/fieldos/blob/271d3a77c58361f43459d068f4e8a100611a87fd/README.md |

### 12.7 Relationships

| id | type | source | target |
|---|---|---|---|
| `r-hati-territory` | `situated_in` | `c-hati-pedestrian` | `t-madrid` |
| `r-hati-evidence` | `documents` | `c-hati-pedestrian` | `ev-hati-modelled-routes` |
| `r-hati-outcome` | `reports` | `c-hati-pedestrian` | `o-hati-abstain` |
| `r-snto-territory` | `situated_in` | `c-snto-pnsg` | `t-pnsg` |
| `r-snto-s2` | `documents` | `c-snto-pnsg` | `ev-snto-s2-inputs` |
| `r-snto-trends` | `documents` | `c-snto-pnsg` | `ev-snto-trends` |
| `r-snto-prug` | `documents` | `c-snto-pnsg` | `ev-snto-prug` |
| `r-snto-gap` | `documents` | `c-snto-pnsg` | `ev-snto-visitor-gap` |
| `r-snto-outcome` | `reports` | `c-snto-pnsg` | `o-snto-insufficient` |
| `r-chalus-territory` | `situated_in` | `c-chalus` | `t-western-mazandaran` |
| `r-chalus-source` | `documents` | `c-chalus` | `ev-chalus-osm-source` |
| `r-chalus-routes` | `documents` | `c-chalus` | `ev-chalus-routes` |
| `r-chalus-gap` | `documents` | `c-chalus` | `ev-chalus-verification-gap` |
| `r-chalus-outcome` | `reports` | `c-chalus` | `o-chalus-no-go` |
| `r-fieldos-run` | `documents` | `i-fieldos` | `ev-fieldos-iphone-run` |
| `r-fieldos-gap` | `documents` | `i-fieldos` | `ev-fieldos-android-gap` |
| `r-fieldos-outcome` | `reports` | `i-fieldos` | `o-fieldos-functional` |

There are zero entity-to-entity relationships.

### 12.8 Gate 2 acceptance checks

- [x] Every semantic record above has been reviewed by the maintainer.
- [x] Every claim and explicit absence resolves to a declared commit-pinned
  source.
- [x] HATI's original pilot and pedestrian extension remain distinct.
- [x] No source supports or implies an entity-to-entity edge.
- [x] No evidence record combines incompatible `input_kind` values.
- [x] No status, evidence record, or outcome functions as a maturity score.
- [x] Layout coordinates were added and visually verified at Gate 3; they carry
  no semantic meaning.
- [x] Runtime files and `data/atlas.json` were migrated under Gate 3 on branch
  `impl/v0.2-gate3`, after Gate 2 approval.
