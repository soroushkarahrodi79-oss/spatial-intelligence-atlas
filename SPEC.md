# SPEC.md — Spatial Intelligence Atlas

**Artifact:** Spatial Intelligence Atlas — Research Explorer

**Target version:** 0.3.0 (schema `0.3.0`)

**Document state:** GATE 1 — IN REVIEW. Gate 0 was approved through PR #15
(`ea93956`).

**Deployed release:** `v0.2.1` (schema `0.2.0`). It remains governed by
`SPEC.md` at tag `v0.2.1`, which is preserved and unchanged. This document
governs the v0.3.0 target only. Releases `v0.1.0`, `v0.1.1`, `v0.2.0` and
`v0.2.1` remain immutable.

**Companion:** `DESIGN_CONTRACT.md` constrains form; this document
constrains meaning, content model and behaviour. The direction comes from
`docs/gate0/V0.3_RESEARCH_EXPLORER_GATE0.md`. Where the two documents
differ, this document governs meaning.

---

## 1. Purpose

The Atlas is a static, client-side research explorer. For a deliberately
selected set of geospatial and tourism research items, it shows:

1. **what was asked**;
2. **where the work is situated**, using verifiable geography only;
3. **how it was done** (sourced methodology);
4. **what evidence is documented**, and of what kind;
5. **what result was reached**, including abstention, insufficient
   evidence, conditional, hold, mixed or no-go outcomes;
6. **what it does not establish** (uncertainty, limitations, claim ceiling);
7. **where the reader can verify it**.

The north star is unchanged:

> From projects to defensible decisions: what was studied, what result was
> documented, what remains unsupported, and where the reader can verify it.

The Atlas is explanatory, not operational. It renders a fixed,
hand-authored, source-pinned dataset. It performs no live analysis,
prediction, ranking, repository integration or scientific validation.

### 1.1 Selection principle (binding)

An item is included by its **class** (§4.1) and by being **publicly
verifiable**. Every public scientific claim rests on at least one
`access: public` source of its own (I11). One public source per item is not
enough. An item is never included merely because it exists, is visually
attractive, or belongs to the same portfolio.

### 1.2 Non-integration principle (binding)

Research items are separate by default. The Atlas MUST NOT imply a pipeline,
shared runtime, data exchange, common validation or product suite.

- Any relation between two items is a typed `relationship` with a declared
  `class` and at least one source (I13).
- A `technical` relation requires a source that documents the dependency
  itself. Conceptual similarity never creates a technical relation.
- **v0.3.0 contains zero relations between research items.** The vocabulary
  is specified so that a later gate can use it; no such relation is used in
  v0.3.0.
- No layout, ordering, arrow or connector may imply flow between items.

### 1.3 Evidence and result discipline (binding)

The Atlas keeps these dimensions separate and never lets one stand in for
another:

- `lifecycle_status`: where the item is in its own lifecycle;
- `input_kind`: the **nature** of an evidence record;
- `substantiation`: how well the **documentation supports** that record;
- `outcome_type` and `verdict_label`: what the reviewed source concluded;
- `editorial_status`: how an output was reviewed;
- `identifier.availability`: whether an output has a persistent identifier.

Real input does not establish validation, causality, decision sufficiency
or a positive result. Abstention, insufficient evidence, hold and no-go are
legitimate documented outcomes and are never hidden or softened.

### 1.4 Pin discipline (binding)

Original evidence pins are preserved. A source's `pinned_ref` changes only
when a new pin is scientifically justified, and the change is recorded in
`pin_change` (I18). New items receive their first pin at Gate 2.

---

## 2. Audience

Design conflicts resolve toward the higher-priority reader.

| # | Reader | First-30-second need |
|---|---|---|
| 1 | Research reviewer or examiner | Question, method, documented result, limitation, source |
| 2 | Spatial-planning or tourism peer | Territory, data provenance, decision boundary |
| 3 | Academic or institutional reader | Citable dossiers, outputs, editorial status, licences |
| 4 | Technical reader | Content model, reproducibility, non-integration limits |

The Atlas is not for operational end users, customers, live destination
management or recruitment marketing.

---

## 3. Scope of v0.3.0 (closed)

### 3.1 Included items (exactly seven)

| Atlas id | Item | Class | Territory | Documented result (to be frozen at Gate 2) |
|---|---|---|---|---|
| `r-hati-pilot` | HATI-Madrid pilot | `documented_research` | Madrid (central pilot area) | Preprint result, extracted verbatim at Gate 2 |
| `r-hati-pedestrian` | HATI pedestrian heat extension | `documented_research` | Madrid — Atocha to Puerta de Alcalá | `ABSTAIN / NO ROBUST DIFFERENCE` |
| `r-snto-pnsg` | SNTO — PNSG decision evidence | `documented_research` | Parque Nacional de la Sierra de Guadarrama | `INSUFFICIENT EVIDENCE` |
| `r-network-pilot` | Pedestrian Network Accessibility Pilot | `documented_research` | Madrid — barrio 113 San Isidro (Carabanchel) | `MODIFY`, with the follow-up municipal-indicator audit `HOLD` |
| `i-fieldos` | FieldOS | `instrument` | none (no case-specific territory) | `FUNCTIONAL TEST` |
| `p-snto` | SNTO observatory | `research_platform` | Parque Nacional de la Sierra de Guadarrama | none (platform) |
| `p-lens` | Madrid Urban Evidence Lens | `research_platform` | Madrid | none (platform) |

The HATI pilot and the HATI pedestrian extension are separate items. Their
questions, results and outputs MUST NOT be combined. This carries forward
v0.2 `SPEC.md` §12.1.

### 3.2 Excluded or deferred (binding for v0.3.0)

| Item | Decision |
|---|---|
| CHALUS | Excluded. The repository is private, so I11 cannot be met. It remains preserved in the `v0.2.x` tags; re-entry needs a new gate. |
| Madrid Evidence MCP and evaluations | Deferred to v0.3.x (licence and pinned report required). |
| Madrid Transit Graph, Madrid Isovist demo | Deferred to v0.3.x. |
| All other repositories in the owner's portfolio | Out of scope (Gate 0 §3). |

Adding, removing or reclassifying an item requires a new gate.

---

## 4. Content model (schema `0.3.0`)

`data/atlas.json` holds one object per collection below. Every id is stable
and unique across the whole file. Every `*_id` or `*_ids` value resolves
(I1). Dates are ISO 8601 (`YYYY-MM-DD`).

### 4.1 `research`

| Field | Rule |
|---|---|
| `id`, `title` | Stable id; public title |
| `class` | `documented_research` · `experiment` · `research_platform` · `instrument` · `proposal` · `archived_artifact` |
| `summary` | One factual sentence: why it is included. No promotional language. |
| `research_question` | Exact bounded question for `documented_research` and `experiment`; `null` otherwise. Never invented by the Atlas. |
| `lifecycle_status` | `active` · `frozen` · `closed` · `maintenance` · `paused` |
| `territory_ids[]` | 0..n territories; empty only with a stated reason in `territory_note` |
| `methodology` | `{summary, source_ids[]}`. **Required** for `documented_research` and `experiment` (I15). It is a bounded paraphrase of the source's method, never an evaluation of it. |
| `version` | `{ref, kind: tag \| commit \| doi}`: the version of the item that the dossier describes |
| `license` | `{code, data, text}`. Each is `{value: <SPDX id> \| "custom" \| "none" \| "not_stated", source_id}` |
| `reproducibility` | `{level: rerunnable \| inspectable \| documented_only \| none, instructions_source_id \| null}` |
| `output_ids[]`, `figure_ids[]` | Outputs (§4.7) and figures (§4.8) |
| `reviewed_at`, `source_ids[]` | Review date; sources for identity, question and lifecycle |

The `class` is a category, not a rank. `instrument` and `research_platform`
are not weaker research items; they answer different questions and are
presented separately.

### 4.2 `territory` and `geometry`

`territory`: `id`, `label`, `basis` (why this territory), `geometry_id |
null`, `source_ids[]`.

`geometry`: `id`, `file` (path under `data/geometry/`), `source_id`,
`publisher`, `license`, `attribution`, `crs` (of the original),
`simplification_m` (tolerance used offline), `sha256` (of the committed
file), `role` (`study_area` · `context_boundary` · `route` · `point_set`),
and `display`:

- `crs`: the projected CRS of the committed coordinates, e.g. `EPSG:25830`;
- `bbox`: in that CRS;
- `centroid_wgs84`;
- `ticks`: graticule tick positions and labels.

All `display` values are computed offline when the file is prepared. The
browser only scales projected metres to the plate frame; it performs no
projection.

A territory without `geometry_id` is rendered as text only. No geometry is
inferred, digitised by hand or drawn from memory (I12).

### 4.3 `evidence`

| Field | Rule |
|---|---|
| `id`, `research_id`, `label` | Stable id, parent item, concise label |
| `input_kind` | `observed` · `acquired` · `derived` · `simulated` · `reported` · `unestablished` |
| `substantiation` | `source_stated` · `owner_attested` · `not_established` |
| `statement` | Bounded paraphrase or short quotation |
| `basis` | Verbatim quotation or exact paraphrase from the source |
| `limitation` | What this record does not establish |
| `provenance` | `{publisher, dataset_ref, license, retrieved_at, checksum}` or `null` when the source gives none |
| `source_ids[]` | At least one; for `not_established`, the reviewed source set in which support was absent |

The `input_kind` and `substantiation` definitions are carried forward
unchanged from v0.2 (tag `v0.2.1`, `SPEC.md` §4.3). The two axes MUST NOT be
collapsed, combined or ranked (I10).

### 4.4 `finding`

`id`, `research_id`, `statement`, `uncertainty | null`, `source_ids[]`.

`uncertainty` is recorded only when the source quantifies or describes it
(for example an interval, a sensitivity range or a stated ambiguity). It is
never estimated by the Atlas.

### 4.5 `outcome`

| Field | Rule |
|---|---|
| `id`, `research_id` | One outcome per item that reports a result |
| `verdict_label` | Verbatim from the pinned source (I14), e.g. `ABSTAIN / NO ROBUST DIFFERENCE`, `MODIFY` |
| `outcome_type` | `bounded_finding` · `abstain` · `insufficient_evidence` · `conditional` · `hold` · `mixed` · `no_go` · `functional_test` |
| `statement` | What the source concluded |
| `claim_ceiling` | What may not be claimed from it. Always visible, never truncated. |
| `limitations[]` | Item-level limitations |
| `reviewed_at`, `source_ids[]` | |

`outcome_type` is categorical, not ordinal. `bounded_finding` is not
stronger than `no_go`. `conditional` covers source verdicts such as
`MODIFY`; `hold` covers `HOLD`; `mixed` covers `MIXED`/`MIXTO`. The category
never replaces the verbatim `verdict_label`.

### 4.6 `source`

| Field | Rule |
|---|---|
| `id`, `label` | |
| `kind` | `repository` · `commit` · `release` · `closeout` · `brief` · `preprint` · `dataset_record` · `publication` · `official_dataset` |
| `url` | HTTPS; opened only on explicit activation |
| `pinned_ref` | Commit SHA, release tag, DOI or immutable document id (I5) |
| `accessed_at` | ISO date |
| `access` | `public` · `restricted` |
| `last_checked_at`, `last_http_status` | Written by the development link check, never at runtime |
| `pin_change` | `{previous_ref, justification, decided_at}` or `null` (I18) |

### 4.7 `output` (Publications & Datasets)

| Field | Rule |
|---|---|
| `id`, `research_id` | Every output belongs to exactly one item |
| `citation` | Full reference text, as it should be cited |
| `date` | Publication or release date |
| `publication_type` | `journal_article` · `conference_paper` · `preprint` · `thesis` · `report` · `book_chapter` · `dataset` · `software` · `other` |
| `editorial_status` | `peer_reviewed` · `editorially_reviewed` · `under_review` · `not_peer_reviewed` · `unpublished` |
| `identifier` | `{availability: pid \| no_pid, scheme: doi \| handle \| isbn \| issn \| arxiv \| null, value \| null, scope: version \| concept \| null}` |
| `url`, `license` | Optional |
| `source_id` | The source that verifies the output exists as cited (I16) |

These three properties are independent:

- **publication type**: what the output is;
- **editorial status**: how it was reviewed;
- **identifier availability**: whether it has a PID.

A reference **without** a PID is valid when its `source_id` verifies it.
`availability` is always stated, never inferred from a missing value.
Citability is not the same as persistent identification.

### 4.8 `figure`

`id`, `research_id`, `file` (under `assets/figures/`), `caption`, `alt`,
`source_id`, `pinned_ref`, `license`, `rights_holder`, `kind` (`chart` ·
`map` · `diagram` · `photo`).

A figure is included only if it is taken unaltered from a pinned source,
apart from a format conversion recorded in `caption`, and its licence
permits reuse (I17). The Atlas never redraws, recolours or annotates a
research figure in a way that changes its content.

### 4.9 `relationship`

`id`, `type`, `class`, `source`, `target`, `source_ids[]`.

| Class | Type | Legal pair |
|---|---|---|
| `structural` | `situated_in` | research → territory |
| `structural` | `documents` | research → evidence |
| `structural` | `reports` | research → outcome |
| `structural` | `has_finding` | research → finding |
| `structural` | `has_output` | research → output |
| `conceptual` | `uses_method` | research → method (v0.3.x) |
| `technical` | `consumes_artifacts_of`, `supports` | research → research (not used in v0.3.0) |

Structural relations may omit `source_ids`, because their target carries
the sources. Conceptual and technical relations MUST carry them (I13).

### 4.10 `meta`

`schema_version`, `release`, `reviewed_at`, `title`, `subtitle`, `notice`
(the non-integration notice), `citation` (how to cite the Atlas, §8.3),
`license` (D4 status, §8.4), and the six `input_kinds` definitions.

### 4.11 Invariants (mechanically checkable)

| # | Invariant |
|---|---|
| I1 | Every referenced id resolves to an existing object of the expected collection. |
| I2 | Every `documented_research` and `experiment` item has a non-null `research_question`, `methodology`, `lifecycle_status`, `reviewed_at`, at least one evidence record and exactly one outcome. |
| I3 | Every `instrument` and `research_platform` has `research_question: null` and is listed apart from documented research in every view. |
| I4 | Every evidence record, finding, outcome, output and figure resolves to at least one source. |
| I5 | Every source has a non-empty `pinned_ref`; a URL pointing to a branch head is not a pin. |
| I6 | Every outbound URL rendered anywhere equals the `url` of a declared source, output or geometry source. |
| I7 | There are zero `technical` or `conceptual` relationships in v0.3.0. |
| I8 | Every evidence record, finding, outcome, output and figure has exactly one parent item, and the parent link appears once. |
| I9 | Each view's order is fully determined by dataset order (§5); no runtime sorting by any value. |
| I10 | No field, view or computation encodes an ordinal score, maturity rank or composite of `class`, `input_kind`, `substantiation`, `outcome_type` or `editorial_status`. |
| I11 | **Every public scientific claim cites at least one `access: public` source in its own `source_ids` or `source_id`.** A public source attached elsewhere in the same item does not count. The claims that must each satisfy this depend on the item's `class`; see the list after this table. Claims a class does not have (for example a platform's question or outcome) are not required. |
| I12 | Every drawn geometry resolves to a `geometry` object whose `sha256` matches the committed file and whose `license` and `attribution` are non-empty. |
| I13 | Every `conceptual` or `technical` relationship declares `class` and at least one source; `technical` requires a source documenting the dependency. |
| I14 | Every `verdict_label` is a verbatim substring of the cited source at its `pinned_ref`; checked once at Gate 2 and recorded. |
| I15 | Every `documented_research` and `experiment` item has `methodology.summary` and at least one `methodology.source_ids` entry. |
| I16 | Every `output` has a `source_id`, and `identifier.availability` is present. `pid` requires `scheme` and `value`; `no_pid` requires both to be `null`. |
| I17 | Every `figure` has `caption`, `alt`, `source_id`, `pinned_ref` and a `license` that permits reuse; the file exists. |
| I18 | A `pinned_ref` that differs from the previously frozen value has a non-null `pin_change` with a justification. |

**I11 by class.** For each class, these claims must each cite their own
public source:

- `documented_research` and `experiment`:
  - `research_question` and `summary` (via `research.source_ids`);
  - `methodology.summary`;
  - every `evidence`, `finding` and `outcome`, including the outcome's
    `verdict_label`, `statement` and `claim_ceiling`;
  - every `output` and `figure`;
  - each linked `territory`, and its `geometry` source if drawn.
- `instrument`:
  - `summary` (via `research.source_ids`);
  - `methodology.summary` when present;
  - every `evidence`, `outcome`, `output` and `figure`.
- `research_platform`:
  - `summary` and the "what the platform documents" text (via
    `research.source_ids`);
  - each linked `territory` and geometry;
  - every `output` and `figure`.
  - A platform has no question or outcome, and none is required.

**Two kinds of verification, kept separate.**

| Kind | What it establishes | Invariants | Who or what checks it |
|---|---|---|---|
| **Mechanical validation of metadata** | Structure and linkage: ids resolve; required fields are present; each claim's own source list contains an `access: public` source; pins are present; hashes match; vocabularies are valid; there are no forbidden relations or orderings. | I1–I13, I15–I18 (the structural part of I11) | `tools/validate_atlas.py`, on every pull request |
| **Human verification of scientific support** | Each cited public source, at its `pinned_ref`, actually supports the claim's content. That covers the fidelity of methodology and finding paraphrases, the verbatim verdict (I14), uncertainty as stated by the source, and the reading of figure and geometry licences. | I11 (support), I14, and the content of I15–I17 | the Gate 2 reviewer, recorded per item and per claim in the freeze |

A passing validator means the metadata is well-formed and linked. It never
means that a claim is scientifically supported. Only the recorded Gate 2
review establishes that.

---

## 5. Views

The Atlas is one dataset shown through these views. Routes are hash-based,
so every view and dossier has a stable, citable URL.

| Route | View | Question it answers | Content and order |
|---|---|---|---|
| `#/` | Overview | What is this, and what does it contain? | Identity, how to read, the Atlas claim ceiling, then the items grouped by class (documented research → platforms → instruments), each in dataset order |
| `#/research` | Research index | Which items exist? | Same grouping as Overview, one row each: title, class, territory, verdict label, output summary ("Preprint · DOI", "Dataset · DOI", "No persistent identifier") |
| `#/research/<id>` | Dossier | What exactly was done and found? | §7 |
| `#/atlas` | Atlas | Where is the work situated? | Index of cartographic plates, one per territory that has geometry, then text-only territories |
| `#/atlas/<territory-id>` | Plate | What exactly is the study area? | One plate with full cartographic metadata, then the items situated there |
| `#/evidence` | Evidence Explorer | What is documented, of what kind? | Every evidence record as a table row, in dataset order; facets filter but never reorder |
| `#/outputs` | Publications & Datasets | What can be cited? | Outputs grouped by item; each shows citation, publication type, editorial status and identifier availability |
| `#/timeline` | Timeline | When was each result documented? | Dated events taken from sources (outcome dates, releases, output dates), newest first, as a list |
| `#/about` | About | How should the Atlas be read and cited? | Method of the Atlas, non-integration, vocabularies, how to cite, licences, governance, version history |

An unknown route renders a not-found state with a link to the Overview.
Views deferred to later releases (`#/methods`, `#/relations`) are **not**
rendered in v0.3.0, and no placeholder link to them appears.

---

## 6. Interaction inventory

The inventory is closed: exactly these interactions exist.

1. **Navigate** between views with the primary navigation and in-page links.
2. **Open a dossier** from Overview, Research index, Atlas, Evidence Explorer, Outputs or Timeline.
3. **Move to the previous or next dossier** in research-index order, announced as "2 of 7". This is list traversal, never a relation.
4. **Filter the Evidence Explorer** by `input_kind`, `substantiation`, item and territory. Facets combine with AND within the selected values. The table order never changes. Facet state is written to the route query (`#/evidence?kind=derived&item=r-snto-pnsg`), so a filtered view is linkable.
5. **Disclose an evidence record's verbatim basis**, using a native `<details>` element.
6. **Open a declared source, output URL or geometry source** in a new tab (`target="_blank"`, `rel="noopener noreferrer"`). The accessible name states the label and "opens in a new tab".
7. **Open a research figure** at full size, as a same-origin link to the image file.
8. **Print** the current view with the browser's print function. A "Print dossier" button calls `window.print()`.

**Explicitly excluded:**

- search, sorting, ranking, comparison views, multi-select, drag;
- pan or zoom on plates; tooltips on chrome; modal dialogs;
- persistence (including `localStorage` and cookies);
- source previews, prefetching, auto-navigation, analytics.

**State model:**

```
route: string    // the full hash, including the Evidence Explorer query
```

All other state (open `<details>`, scroll position) belongs to the browser.
Reloading a URL reproduces the same view.

---

## 7. Dossier contract

A dossier is the citable unit. Its section order is fixed, adapting the
reading order of PR #14 (`1246293`) and adding the academic fields. The
result and claim ceiling come before itemised evidence, so the reviewer's
30-second need is met in the first screen.

**`documented_research` and `experiment`:**

1. Header: class label, title, verdict label, lifecycle status, version, `reviewed_at`, and the coordinate line (`DESIGN_CONTRACT.md` §8.4) when geometry exists.
2. Research question.
3. Territory: plate thumbnail linking to `#/atlas/<id>`, or text with `territory_note`.
4. Result: `verdict_label`, then `statement`.
5. Claim ceiling, directly after the result.
6. Methodology: `methodology.summary` with its sources cited inline.
7. Findings: each `finding.statement`, with `uncertainty` directly beneath it when present.
8. Figures, in dataset order.
9. Evidence: records in dataset order, each showing `input_kind` (glyph, rule and text), `substantiation` (text), statement, limitation (always visible), provenance, and the verbatim basis behind `<details>`.
10. Limitations: `outcome.limitations[]`.
11. Outputs: as in `#/outputs`.
12. Reproducibility and licences: `reproducibility.level` with instructions source, and the item's `license.code`, `license.data` and `license.text`.
13. Verification: every source cited above, de-duplicated, in **first-cited reading order**, each with label, kind, `pinned_ref`, `accessed_at` and access.
14. How to cite this dossier (§8.3).

**`instrument`:**

1. Header
2. Role (`summary`)
3. Documented functional result and claim ceiling
4. Methodology (if the source documents a test procedure)
5. Evidence
6. Limitations
7. Outputs
8. Reproducibility and licences
9. Verification
10. How to cite

There is no territory section; the dossier states "No case-specific territory".

**`research_platform`:**

1. Header
2. Role
3. Territory
4. What the platform documents
5. Claim and interpretation limits (from the platform's own sources)
6. Items in this Atlas that the platform hosts (text links)
7. Licences
8. Verification
9. How to cite

A platform has no verdict and no outcome.

No section may be replaced by promotional copy. An empty optional section
(e.g. no figures) is omitted, not shown empty. A required section that is
missing is a validation error, not an empty state.

---

## 8. Global elements

### 8.1 First-paint reading order (every view)

1. skip link;
2. site header (wordmark, primary navigation);
3. the view's title and question;
4. the non-integration notice (Overview, Research index, Atlas and Evidence Explorer; a one-line form on dossiers);
5. view content;
6. provenance footer: release, schema version, `reviewed_at`, how to cite, licences, and the statement: "Inputs, status, and outcomes are separate. Real input does not establish validation or decision sufficiency."

### 8.2 Literal role labels

`DOCUMENTED RESEARCH`, `EXPERIMENT`, `RESEARCH PLATFORM` and `INSTRUMENT`
appear as text wherever an item is listed. Shape or position alone is never
enough.

### 8.3 Citation

The Atlas is citable now, independently of any persistent identifier:

> Karahrodi, S. (2026). *Spatial Intelligence Atlas — Research Explorer*
> (Version 0.3.0) [Software and dataset]. GitHub.
> https://github.com/soroushkarahrodi79-oss/spatial-intelligence-atlas/tree/v0.3.0

A dossier citation appends the dossier title and its route URL. If a DOI is
minted at Gate 4 (with authorisation), it is added; the plain citation
remains valid.

### 8.4 Licences (D4)

Preferred direction: **MIT** for original code and **CC BY 4.0** for
original data and text. It is subject to a compatibility review (quoted
third-party material, reused figures, ODbL-derived geometry) and final
maintainer approval before Gate 4. Until then, `meta.license` states
"Licence pending maintainer approval", and no `LICENSE` file is added.
Third-party material keeps its own licence, shown next to it: figures,
geometry (for example ODbL for OpenStreetMap-derived routes), and
quotations.

---

## 9. Non-goals

The v0.3.0 Atlas MUST NOT:

1. integrate with, read from or monitor source repositories at runtime;
2. imply technical integration or data exchange between items;
3. use a basemap, map tiles, a web-map library, WebGL or 3D;
4. draw geometry that is not a declared, licensed, hashed `geometry` object;
5. claim validation, causal attribution, operational readiness or decision sufficiency beyond a pinned source;
6. infer tourism demand, visitor pressure, revenue, closure, restriction, health or investment effects not established by the reviewed source;
7. rank, score, sort by merit or compare items, or turn outcomes into a success ladder;
8. become a CV, biography or unattached publication list (outputs exist only attached to an item);
9. perform live computation over research data;
10. include a backend, database, authentication, telemetry, analytics, cookies, persistence or runtime AI;
11. load any third-party resource (scripts, styles, fonts, images, tiles, data);
12. require a framework, package manager, bundler or build step to run;
13. use promotional language, or conceal or soften abstention, hold, insufficient-evidence or no-go outcomes;
14. alter, recolour or annotate research figures.

---

## 10. Acceptance criteria for v0.3.0 (Gates 3 and 4)

| # | Criterion |
|---|---|
| A1 | The dataset contains exactly the seven items of §3.1 and none of §3.2. |
| A2 | `tools/validate_atlas.py` passes the mechanical checks (I1–I13, I15–I18, including I11 per class) with zero errors, **and** the Gate 2 freeze records human verification of scientific support for every public claim (I11 support, I14). |
| A3 | Every documented research item shows question, sourced methodology, result, claim ceiling, findings with uncertainty where sourced, evidence, limitations, outputs, reproducibility, licences and verification, in §7 order. |
| A4 | The HATI pilot and the HATI pedestrian extension are separate dossiers with separate results and outputs. |
| A5 | Every output shows publication type, editorial status and identifier availability as three separate visible facts. |
| A6 | Every plate shows source, licence/attribution, CRS, simplification tolerance and "Not for measurement". |
| A7 | Every figure shows caption, source with pin, licence and alt text. |
| A8 | No relation between research items exists; no connector or flow graphic exists. |
| A9 | No view sorts, ranks or scores items or evidence; the Evidence Explorer filters without reordering. |
| A10 | Every outbound link resolves to a declared object and opens only on explicit activation. |
| A11 | Zero third-party network requests; all runtime requests are same-origin. |
| A12 | Every route is deep-linkable and survives reload. |
| A13 | Light and dark themes follow `prefers-color-scheme`; print output is legible and complete for a dossier. |
| A14 | WCAG 2.2 AA: axe-core reports 0 violations on every view at 360, 390, 768, 1024 and 1440 px; full keyboard operation; 200 % zoom; reduced motion; forced colours. |
| A15 | No horizontal page scroll at any width ≥ 360 px. |
| A16 | `DESIGN_CONTRACT.md` checklist passes. |
| A17 | The development link check reports every source reachable, or lists exceptions explicitly in the release notes. |
| A18 | Tags `v0.1.0`–`v0.2.1` and their releases are untouched. |
| A19 | The non-integration notice and the provenance footer are present on every view. |
| A20 | Licence presentation matches the D4 status at release time. |

---

## 11. Gate sequence for v0.3

| Gate | Scope | State |
|---|---|---|
| Gate 0: audit and direction | `docs/gate0/V0.3_RESEARCH_EXPLORER_GATE0.md` | **APPROVED**, PR #15 (`ea93956`) |
| Gate 1: specification and design | `SPEC.md`, `DESIGN_CONTRACT.md`, `PROJECT_STATUS.md`, `README.md` | **IN REVIEW** |
| Gate 2: content freeze | §12 content, per item, with pinned sources, methodology, findings, outputs, figures and geometry | not started |
| Gate 3: implementation | runtime, `data/atlas.json` migration, geometry, figures, validator and CI | not started |
| Gate 4: verification and release | A1–A20, licence approval (D4), `CITATION.cff`, release `v0.3.0`, DOI only with authorisation | not started |

Each gate is a separate PR. A PR that changes a governed file requires the
maintainer's `gate-approved` label. The required governance check (ruleset
`23958517`) enforces this.

---

## 12. Content freeze (Gate 2): pending

No v0.3.0 content is frozen by this document.

**Baseline carried forward without semantic change.** The v0.2 frozen
records in `SPEC.md` §12 at tag `v0.2.1` are the Gate 2 baseline for
`r-hati-pedestrian`, `r-snto-pnsg` and `i-fieldos`. That covers their
questions, evidence records, outcomes, claim ceilings and sources, with
their original pins. Gate 2 migrates them to schema `0.3.0` field by field,
and adds:

- methodology;
- findings;
- outputs;
- figures;
- geometry;
- the missing licence and reproducibility fields.

**New items** (`r-hati-pilot`, `r-network-pilot`, `p-snto`, `p-lens`)
receive their first pins at Gate 2, from the sources identified in Gate 0
§3.

**Gate 2 review order:** `r-hati-pedestrian` → `r-snto-pnsg` →
`i-fieldos` → `r-hati-pilot` → `r-network-pilot` with `p-lens` → `p-snto`.

### 12.1 Migration map from schema 0.2.0

| 0.2.0 | 0.3.0 |
|---|---|
| `entity` (`kind: case`) | `research` (`class: documented_research`) |
| `entity` (`kind: instrument`) | `research` (`class: instrument`) |
| `entity.role` | `research.summary` |
| `entity.research_status` | `research.lifecycle_status` |
| `entity.layout` | removed (no coordinate system) |
| `territory` | `territory` (+ `geometry_id`) |
| `evidence_record` | `evidence` (+ `research_id`, `basis`, `provenance`) |
| `outcome` | `outcome` (+ `verdict_label`, `limitations[]`); the old `statement` keeps its verdict prefix as `verdict_label` |
| `source` | `source` (+ `access`, `last_checked_at`, `last_http_status`, `pin_change`) |
| `relationship` | `relationship` (+ `class`); the three v0.2 types become `structural` |
| CHALUS records | not migrated (§3.2); preserved at `v0.2.x` tags |
