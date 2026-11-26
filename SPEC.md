# SPEC.md — Spatial Intelligence Atlas

**Artifact:** Spatial Intelligence Atlas — Research Explorer

**Target version:** 0.4.0 (schema `0.4.0`; §1–§12 describe 0.3.0, amended by §13)

**Document state:** Gate 0 approved (PR #15, `ea93956`); Gate 1 approved
(PR #17, `326d98f`); Gate 2 content freeze merged (PR #18, `23297cd`) with the
§12.10 human verification still pending; Gates 3 and 4 merged (PR #19
`8d07bf3`, PR #20 `5bf7cb4`) and deployed from `main` on 2026-11-26. Current
state: `PROJECT_STATUS.md` §6.1.

**v0.4 amendment:** §13 adds four items, a separate relationship dataset,
the Knowledge Graph view and invariants R1–R14. It states exactly which v0.3
rules it supersedes; every other rule of §1–§12 still applies. Maintainer
decisions E1–E5 are recorded in §13.0. Human verification of v0.3 (§12.10,
A2) and of v0.4 (§13.8, K2) is pending.

**Previous release:** `v0.2.1` (schema `0.2.0`). It remains governed by
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
  v0.3.0. *(v0.4: superseded by §13.3–§13.4. Relations live only in
  `data/relationships.json`, each documented by a pinned public source.)*
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
| I7 | There are zero `technical` or `conceptual` relationships in v0.3.0. *(v0.4: amended by §13.4 — `atlas.json` carries no relationships; relations are governed by R1–R14.)* |
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
rendered in v0.3.0, and no placeholder link to them appears. *(v0.4: the
Knowledge Graph is added as `#/graph`, §13.5.)*

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
- *(v0.4: inside `#/graph` only, §13.5 adds node search, pan and zoom,
  class and node-type filters and an expanded view. Sorting, ranking,
  comparison, plate pan/zoom and persistence stay excluded.)*
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
| A1 | The dataset contains exactly the seven items of §3.1 and none of §3.2. *(v0.4: superseded by §13.1 and K1: the seven records are unchanged and four items are added.)* |
| A2 | `tools/validate_atlas.py` passes the mechanical checks (I1–I13, I15–I18, including I11 per class) with zero errors, **and** the Gate 2 freeze records human verification of scientific support for every public claim (I11 support, I14). |
| A3 | Every documented research item shows question, sourced methodology, result, claim ceiling, findings with uncertainty where sourced, evidence, limitations, outputs, reproducibility, licences and verification, in §7 order. |
| A4 | The HATI pilot and the HATI pedestrian extension are separate dossiers with separate results and outputs. |
| A5 | Every output shows publication type, editorial status and identifier availability as three separate visible facts. |
| A6 | Every plate shows source, licence/attribution, CRS, simplification tolerance and "Not for measurement". |
| A7 | Every figure shows caption, source with pin, licence and alt text. |
| A8 | No relation between research items exists; no connector or flow graphic exists. *(v0.4: superseded inside `#/graph` by §13.5–§13.7; elsewhere unchanged.)* |
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
| Gate 1: specification and design | `SPEC.md`, `DESIGN_CONTRACT.md`, `PROJECT_STATUS.md`, `README.md` | **APPROVED**, PR #17 (`326d98f`) |
| Gate 2: content freeze | §12 content, per item, with pinned sources, methodology, findings, outputs, figures and geometry | **IN REVIEW** (human verification pending, §12.10) |
| Gate 3: implementation | runtime, `data/atlas.json` migration, geometry, figures, validator and CI | not started |
| Gate 4: verification and release | A1–A20, licence approval (D4), `CITATION.cff`, release `v0.3.0`, DOI only with authorisation | not started |

Each gate is a separate PR. A PR that changes a governed file requires the
maintainer's `gate-approved` label. The required governance check (ruleset
`23958517`) enforces this.

---

## 12. Content freeze (Gate 2)

**State:** FROZEN FOR REVIEW. The freeze takes effect only when the
maintainer completes the human-verification record (§12.10) and applies
`gate-approved`. **Review date:** 2026-11-25.

### 12.0 How this freeze was verified

| Kind (SPEC §4.11) | What was done | By whom or what | Status |
|---|---|---|---|
| Source check | Every claim below was compared with its pinned source on 2026-11-25. Evidence pins were preserved, and each source URL was re-checked over HTTP. DOIs were resolved through the DataCite API. **HATI pilot:** checked against the deposited PDF `HATI_Madrid_Preprint_v1.0.pdf` (MD5 `083ed0f9…66e0`, matching the Zenodo record), using its abstract, §1 research questions, §2.1 study design, the licence statement, and the Figure 1–4 captions. The text was extracted with `pdftotext`. Page images were not rendered; figure content was checked against the vector SVGs the preprint states it embeds. No other part of the full text was verified. | Claude Code (AI assistant), on the maintainer's instruction | Done. **This is AI-assisted. It is not human verification.** |
| Mechanical validation of metadata | I1–I13 and I15–I18 over `data/atlas.json`. | `tools/validate_atlas.py` | **Not yet possible.** The validator and the schema `0.3.0` dataset are built at Gate 3. A structural self-check of this section (ids resolve, every claim cites a declared public source) was run and passed. |
| Human verification of scientific support | I11 support and I14 verbatim, per item and per claim (§12.10). | The maintainer | **PENDING.** Required before `gate-approved`. |

No independent or third-party human validation of any item has occurred.
Nothing in this section claims it.

### 12.1 Sources

`access` is `public` for every source below. Every URL was checked on
2026-11-25: GitHub URLs returned HTTP 200, and each DOI resolved through
DataCite with state `findable`.

| id | kind | label | pinned_ref | accessed_at | pin_change |
|---|---|---|---|---|---|
| `s-hati-gate3b` | closeout | HATI Gate 3B evidence-sufficiency decision | `c69688e7827f1faaf855fdb58a8e80a497d73830` | 2026-09-22 | null (original pin) |
| `s-hati-status` | closeout | HATI canonical project status (extension) | `c69688e7827f1faaf855fdb58a8e80a497d73830` | 2026-09-22 | null (original pin) |
| `s-hati-routes` | commit | HATI Gate 2 freeze manifest and route hashes | `c69688e7827f1faaf855fdb58a8e80a497d73830` | 2026-11-25 | null (first pin) |
| `s-hati-preprint` | preprint | Thermal representation as a decision variable… (Zenodo v1.0; file `HATI_Madrid_Preprint_v1.0.pdf`, MD5 `083ed0f91105fd8fef48c7aad05766e0`) | DOI `10.5281/zenodo.22707470` | 2026-11-25 | null (first pin) |
| `s-hati-pilot-status` | commit | HATI project status (layer A, licences) | `97b0e40669386c29dafa8c2f5b5031f14ff71771` | 2026-11-25 | null (first pin) |
| `s-snto-brief` | brief | SNTO PNSG Public-Use Decision Evidence Brief 2026/27 | `2c65fe2ac9a09662cddef4cfa68290e0cd6e1278` | 2026-09-22 | null (original pin) |
| `s-snto-readme` | repository | SNTO repository status snapshot | `2c65fe2ac9a09662cddef4cfa68290e0cd6e1278` | 2026-09-22 | null (original pin) |
| `s-snto-license` | commit | SNTO `LICENSE` (academic and research use) | `2c65fe2ac9a09662cddef4cfa68290e0cd6e1278` | 2026-11-25 | null (first pin) |
| `s-snto-oapn-boundary` | official_dataset | OAPN PNSG boundary as committed in SNTO (`data/raw_assets/vector_data/oapn/oapn_limite_pn.geojson`, blob `39532e02`) | `2c65fe2ac9a09662cddef4cfa68290e0cd6e1278` | 2026-11-25 | null (first pin) |
| `s-snto-zenodo` | release | SNTO — Smart Nature Tourism Observatory (Zenodo software, concept record) | DOI `10.5281/zenodo.20818269` | 2026-11-25 | null (first pin) |
| `s-net-readme` | commit | Network Accessibility Pilot — design and sources | `ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f` | 2026-11-25 | null (first pin) |
| `s-net-results` | closeout | Network Accessibility Pilot — results and verdict | `ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f` | 2026-11-25 | null (first pin) |
| `s-net-attribution` | commit | Network pilot results attribution and licence notice | `ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f` | 2026-11-25 | null (first pin) |
| `s-net-audit` | closeout | Municipal sports-proximity indicator audit | `f1cd19d573d6ab3e06700b03c5189864eed23dcd` | 2026-11-25 | null (first pin) |
| `s-net-dataset` | dataset_record | OSM pedestrian-network extract, San Isidro (Zenodo v1.0.0) | DOI `10.5281/zenodo.24288645` | 2026-11-25 | null (first pin) |
| `s-lens-geography` | official_dataset | Canonical Madrid administrative geography and metadata (Ayuntamiento de Madrid, IDEAM) | `ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f` | 2026-11-25 | null (first pin) |
| `s-lens-readme` | repository | Madrid Urban Evidence Lens — README | `3035323a233e5fa83b6b4babe8a2ccf3ac7e4196` | 2026-11-25 | null (first pin) |
| `s-lens-claims` | repository | Madrid Urban Evidence Lens — claims and limitations | `3035323a233e5fa83b6b4babe8a2ccf3ac7e4196` | 2026-11-25 | null (first pin) |
| `s-lens-release` | release | Madrid Urban Evidence Lens GitHub release `v0.1.0` (published 2026-09-25) | tag `v0.1.0` | 2026-11-25 | null (first pin) |
| `s-fieldos-run` | closeout | First FieldOS field run | `271d3a77c58361f43459d068f4e8a100611a87fd` | 2026-09-22 | null (original pin) |
| `s-fieldos-readme` | repository | FieldOS repository status snapshot | `271d3a77c58361f43459d068f4e8a100611a87fd` | 2026-09-22 | null (original pin) |
| `s-oapn-catalogue` | official_dataset | datos.gob.es catalogue record "Límites de los parques nacionales españoles" (publisher: Organismo Autónomo Parques Nacionales) | record `ea0043369-limites-de-los-parques-nacionales-espanoles`, modified 2023-01-24 | 2026-11-25 | null (first pin) |
| `s-miteco-legal` | publication | MITECO legal notice (aviso legal), reuse conditions | unversioned web page; the operative text is quoted in §12.2 | 2026-11-25 | null (first pin) |

**URLs.** Each GitHub source resolves to its file at the stated commit:

```
https://github.com/soroushkarahrodi79-oss/<repository>/blob/<pinned_ref>/<path>
```

The repositories and paths are:

| Source(s) | Repository | Path |
|---|---|---|
| `s-hati-*` | `heat-adaptive-tourism-madrid` | `docs/research/pedestrian-heat/gate3b/GATE3B_DECISION.md`; `PROJECT_STATUS.md`; `docs/research/pedestrian-heat/gate2/GATE2_FREEZE_MANIFEST.json` |
| `s-snto-*` | `snto-smart-tourism-observatory` | `docs/PNSG_DECISION_EVIDENCE_BRIEF.md`; `README.md`; `LICENSE`; the boundary file above |
| `s-net-*` | `madrid-tourism-intelligence-lens` | `research/network_accessibility_pilot/{README.md, RESULTS.md, results/ATTRIBUTION.md, MUNICIPAL_INDICATOR_AUDIT.md}` |
| `s-lens-*` | `madrid-tourism-intelligence-lens` | `data/geography/madrid_admin.meta.json`; `README.md`; `docs/CLAIMS_AND_LIMITATIONS.md` |
| `s-fieldos-*` | `fieldos` | `docs/FIRST_FIELD_RUN.md`; `README.md` |

DOI sources resolve through `https://doi.org/<DOI>`. `s-oapn-catalogue` resolves to
`https://datos.gob.es/es/catalogo/ea0043369-limites-de-los-parques-nacionales-espanoles`,
and `s-miteco-legal` to `https://www.miteco.gob.es/es/atencion-al-ciudadano/aviso-legal.html`.
These two web pages are not versioned. Their operative text is quoted in
§12.2 so the basis survives any later change to them. `s-lens-release` resolves
to `https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/releases/tag/v0.1.0`.

**Pin decisions.** Every original evidence pin is preserved: HATI extension
`c69688e`, SNTO `2c65fe2`, FieldOS `271d3a7`. No pin change is justified,
for three reasons:

- HATI has 20 later commits, but none touches `docs/research/pedestrian-heat/`.
- The PNSG brief is byte-identical at SNTO's current HEAD.
- FieldOS's 5 later commits (UI reskin, a new feature, README) add no new
  field evidence.

New items are pinned as follows:

- **Network pilot:** pinned at `ad7ed9b`, the commit its Zenodo dataset
  cites. Its `RESULTS.md` differs at `main` only by a later note and wording
  about archiving the extract. Measurements, criteria and verdict are
  identical.
- **Lens:** pinned at the current HEAD of `main`, `3035323`.

### 12.2 Territories and geometry

| id | label | basis | geometry | source_ids |
|---|---|---|---|---|
| `t-madrid-central` | Madrid — Prado–Retiro–Atocha pilot box (≈3.5 km²) | The HATI-Madrid pilot's rectangular study area, pinned to named landmarks (preprint §2.1) | null. `territory_note`: the box is described in text only; the repository's study-area outputs carry no assigned licence. Figure 1(a) shows the area as published (§12.3). | `s-hati-preprint`, `s-hati-pilot-status` |
| `t-madrid-atocha-alcala` | Madrid — Atocha to Puerta de Alcalá | Two frozen, hashed pedestrian routes for OD1 | `g-hati-routes` | `s-hati-routes`, `s-hati-gate3b` |
| `t-pnsg` | Parque Nacional de la Sierra de Guadarrama | The PNSG public-use units and the 2027 planning cycle | `g-pnsg-boundary` | `s-snto-brief`, `s-snto-oapn-boundary` |
| `t-san-isidro` | Madrid — barrio 113 San Isidro (Carabanchel) | Study area of the Network Accessibility Pilot (1.8993 km²) | `g-san-isidro` (plus `g-madrid-municipality` as context) | `s-net-results`, `s-lens-geography` |
| `t-madrid` | Madrid (municipality) | Area documented by Madrid Urban Evidence Lens | `g-madrid-municipality` | `s-lens-readme`, `s-lens-geography` |

FieldOS has no case-specific territory. No geometry is drawn for CHALUS.

| geometry id | role | source file (pinned) | publisher | licence and attribution | Reuse decision |
|---|---|---|---|---|---|
| `g-san-isidro` | study_area | barrio 113 feature of `data/geography/madrid_admin.geojson` @ `ad7ed9b` (blob `244a54f5`; official EPSG:25830, served as WGS84) | Ayuntamiento de Madrid, IDEAM | **CC BY 4.0**, "(c) Ayuntamiento de Madrid" (`madrid_admin.meta.json`) | **Reusable.** Resolved. |
| `g-madrid-municipality` | context_boundary | municipality feature of the same file | Ayuntamiento de Madrid, IDEAM | **CC BY 4.0** (municipality geometry derived from the official districts, per the metadata) | **Reusable.** Resolved. |
| `g-pnsg-boundary` | study_area | `oapn_limite_pn.geojson` @ `2c65fe2` (blob `39532e02`, 519,559 bytes; CRS84). Downloaded by SNTO from the OAPN GeoServer WFS (`sigred.oapn.es/geoserverOAPN`, layer `view_red_oapn_limite_pn_visor`) | Organismo Autónomo Parques Nacionales (WFS `ProviderName`) | **No Creative Commons or other named licence.** The reuse terms below apply; the required attribution is **"Fuente: Organismo Autónomo Parques Nacionales"**. | **Reusable with attribution. Resolved (Q2).** See the applicability note below. |
| `g-hati-routes` | route | `OD1_Route_A_epsg25830.geojson` (sha256 `f2f9d8b4…dc9a6`, 2,657.8 m, 42 OSM ways) and `OD1_Route_B_epsg25830.geojson` (sha256 `fedf5ed4…6c54a`, 2,365.7 m, 38 OSM ways) @ `c69688e` | Derived by HATI from OpenStreetMap ways (way ids listed in the route files) | © OpenStreetMap contributors, **ODbL 1.0**. The HATI repository assigns no licence to derived outputs. | **Reusable under ODbL 1.0 once the maintainer confirms** (§12.9, Q1). The Atlas file must carry ODbL and attribution. |

**PNSG boundary — reuse terms and applicability (Q2, resolved).**

The terms that apply:

- `s-oapn-catalogue` (publisher OAPN) states: "Acceso público y gratuito.
  Será necesario nombrar la fuente de procedencia de la información de la
  siguiente manera: "Fuente: Organismo Autónomo Parques Nacionales"".
- `s-miteco-legal`, issued under Ley 37/2007 and RD 1495/2011, states that
  the information "puede ser utilizada en parte o en su integridad, sin
  necesidad de autorización expresa, siempre que se cite la fuente", except
  for content subject to third-party intellectual property.

Why they apply to the pinned file. The pinned geometry is OAPN-published
information:

- it was retrieved from OAPN's own GeoServer, whose WFS `ProviderName` is
  "ORGANISMO AUTÓNOMO PARQUES NACIONALES";
- it comes from the layer `LimitesParquesNacionalesZPP:view_red_oapn_limite_pn`,
  titled "Límite Parques Nacionales";
- the WFS declares `AccessConstraints: NONE` and `Fees: NONE`;
- the catalogue dataset covers the same subject from the same publisher.

**Not verified:** vertex-level identity between the WFS extract and the
catalogue's SHP distribution. The SHP access URL now redirects to a general
page, and no geometry library was available to compare them. Accordingly:

- the reuse terms are recorded as terms of OAPN-published information;
- no Creative Commons licence is assigned;
- the plate carries the required attribution.

**HATI route geometry (Q1).** Only the two route LineStrings are
authorised for the Atlas, as a separate geometry file under **ODbL 1.0**.
The file carries its own attribution ("© OpenStreetMap contributors") and
provenance: source commit `c69688e`, the source file hashes above, and the
OSM way ids. No other HATI-derived output is included. Publication requires
the maintainer's explicit approval, recorded in §12.10, before the plate
ships.

Gate 3 prepares each file offline as specified in SPEC §4.2: clip,
simplify, record `simplification_m`, `crs` and `sha256`, and compute
`display`. The original hashes above identify the source files only.

### 12.3 `r-hati-pilot` — HATI-Madrid pilot

| Field | Frozen value |
|---|---|
| class · lifecycle | `documented_research` · `frozen` (source status `RELEASE_LOCKED`, `s-hati-pilot-status`) |
| title | HATI-Madrid — Heat-Adaptive Tourism Opportunity Screening (Madrid pilot) |
| summary | Published preprint testing whether the choice of thermal representation changes heat-adaptive tourism screening decisions. |
| research_question | Does physically based (SOLWEIG/UTCI) thermal modelling materially alter tourism-feasibility classifications relative to the simple air-temperature-and-tree-presence proxy, and is any difference physically interpretable? (RQ1, verbatim, `s-hati-preprint` §1. The preprint has two further questions: RQ2 on decision-support value and RQ3 on robustness and traceability.) |
| territory | `t-madrid-central` |
| version | DOI `10.5281/zenodo.22707470` (preprint v1.0) |
| reproducibility | `inspectable`. The code, outputs and `REPRODUCIBILITY.md` are public. The Atlas did not re-run it. Instructions: `s-hati-pilot-status`. |
| licence | code **MIT** (`src/`, `tests/`, `app/` only, since 2026-11-11) · data `not_stated` (third-party data keeps its licences; derived outputs "all rights reserved") · text: preprint **CC BY 4.0** (Zenodo); repository documents `not_stated` — all `s-hati-pilot-status` |
| sources | `s-hati-preprint`, `s-hati-pilot-status` |

**Methodology** (`s-hati-preprint`: abstract and §2.1):

- **Design:** a single-city, single-day pilot of a constraint-first,
  uncertainty-aware screening architecture.
- **Study area:** the Prado–Retiro–Atocha box (≈3.5 km²).
- **Assets:** 27 tourism assets curated from OpenStreetMap (13 indoor,
  14 outdoor). This is a purposive selection, not a representative sample.
- **Time:** 21 August 2023, inside an extreme-heat episode designated by
  AEMET (20–25 August 2023), at 12:00, 15:00 and 18:00 CEST.
- **Two thermal representations:** an operational proxy (ambient
  air-temperature hazard band plus nearby tree presence), and
  SOLWEIG → Tmrt → UTCI.
- **Gate chain:** both feed one ordered gate chain (open? → reachable? →
  thermally feasible? → evidence sufficient? → meaningful improvement?).
- **Baseline:** compared with a nearest-open baseline over eight
  pre-registered decision scenarios.

**Findings** (`s-hati-preprint`: abstract and the Figure 2–4 captions):

| id | statement | uncertainty |
|---|---|---|
| `f-hati-pilot-reclass` | Changing the thermal representation reclassified one third of outdoor asset-time observations (33.3 %, 14 of 42), in both directions: in 9 the physical model was more restrictive, in 5 less restrictive. | Reclassification differs by hour: 64.3 % at 12:00, 0.0 % at 15:00, 35.7 % at 18:00. Neither method is field-validated, so the direction of divergence says nothing about correctness. |
| `f-hati-pilot-scenarios` | Relative to the nearest-open baseline, constraint-first screening changed the feasible-alternative set in 7 of 8 scenarios. The nearest-open option failed screening in 3 of 8, and one scenario (S8) returned an explicit no-defensible-alternative outcome. | null |
| `f-hati-pilot-robustness` | Under the tested uncertainty, 35 of 42 outdoor decisions were classed ROBUST, 6 BOUNDARY and 1 UNSTABLE. A satellite-derived irradiance realization changed 1 of 42 decisions; −10 % and −20 % irradiance perturbations changed none. | Robustness covers only the tested dimensions (solar forcing, plus targeted canopy geometry for two assets). It is not total uncertainty and not a validation of the modelled field. |

**Evidence:**

| id | input_kind | substantiation | statement | limitation | sources |
|---|---|---|---|---|---|
| `ev-hati-pilot-solweig` | `simulated` | `source_stated` | Physically based SOLWEIG/UTCI modelling of outdoor thermal conditions for the pilot day and times. | Modelled; there is no direct field validation of Tmrt/UTCI. | `s-hati-preprint` |
| `ev-hati-pilot-proxy` | `derived` | `source_stated` | An operational proxy combining ambient air-temperature hazard thresholds with nearby tree-presence information. | A screening proxy, not a thermal measurement. | `s-hati-preprint` |
| `ev-hati-pilot-validation-gap` | `unestablished` | `not_established` | No direct field validation of Tmrt/UTCI and no observed tourist behaviour. | Neither method's accuracy against ground truth is established. | `s-hati-preprint` |

Each record's basis is the corresponding sentence of the preprint
abstract and §2.1. Provenance is null per record: the datasets are
described in preprint §2, which was not verified beyond §2.1 at this
gate.

**Outcome `o-hati-pilot`:**

- **verdict_label:** "thermal representation is a substantive modelling
  choice in heat-adaptive tourism decision support"
- **outcome_type:** `bounded_finding`
- **statement:** The findings indicate that thermal representation is a
  substantive modelling choice, and that a constraint-first architecture
  can expose that sensitivity while keeping uncertainty, evidence and
  exclusion logic explicit.
- **claim_ceiling:** The study evaluates decision sensitivity to the choice
  of thermal method, not the accuracy of either method against ground
  truth. Results are limited to a single Madrid pilot, without direct field
  validation of Tmrt/UTCI or observed tourist behaviour. The preprint is not
  peer-reviewed.
- **limitations:** single city; single day; no field validation; no
  behavioural data.
- **sources:** `s-hati-preprint`

**Outputs:**

| id | citation | type | editorial status | identifier |
|---|---|---|---|---|
| `out-hati-preprint` | Karahrodi, S. (2026). *Thermal representation as a decision variable in heat-adaptive tourism opportunity screening: evidence from a Madrid pilot* (Version 1.0) [Preprint]. Zenodo. | `preprint` | `not_peer_reviewed` | `pid` · DOI `10.5281/zenodo.22707470` (version; concept `10.5281/zenodo.22707469`) · licence CC BY 4.0 |
| `out-hati-code` | HATI-Madrid code, GitHub release `v0.1.0` (2026-09-01). | `software` | `not_peer_reviewed` | `no_pid` |

Both outputs are verified by `s-hati-preprint` and `s-hati-pilot-status`
respectively.

**Figures.** These are **reusable**. Each is confirmed present in the
deposited preprint, which carries CC BY 4.0 both in the PDF ("License:
Creative Commons Attribution 4.0 International (CC BY 4.0)") and in its
Zenodo metadata.

| id | Figure | Deposited preprint | Notes |
|---|---|---|---|
| `fig-hati-1` | Figure 1 — Study design and constraint-first screening architecture | page 24 | Panel (a) maps OpenStreetMap-curated asset locations. Its credit line must add "Asset locations © OpenStreetMap contributors (ODbL 1.0)". The figure is vector, with no embedded basemap raster. |
| `fig-hati-2` | Figure 2 — Thermal-method choice changes feasibility classifications | page 25 | — |
| `fig-hati-3` | Figure 3 — Heat-aware screening changes the option set | page 26 | — |
| `fig-hati-4` | Figure 4 — Decision robustness under tested uncertainty | page 27 | — |

**Rules for Gate 3:**

- Take each figure from the deposited PDF by format conversion only,
  never from the repository copies, which are "all rights reserved".
- Use the preprint's own caption text, abridged without changing its
  meaning.
- Credit: "Karahrodi, S. (2026), preprint v1.0, DOI
  10.5281/zenodo.22707470, CC BY 4.0".

### 12.4 `r-hati-pedestrian` — HATI pedestrian heat extension

| Field | Frozen value |
|---|---|
| class · lifecycle | `documented_research` · `frozen` (`RESEARCH_FROZEN_AFTER_GATE_3B`) |
| title | HATI — Pedestrian Heat Extension |
| summary | Frozen robustness case for evidence-first pedestrian heat comparison. (Carried forward from v0.2.) |
| research_question | Across the two frozen Atocha–Puerta de Alcalá routes and tested departure times, does the modelled thermal evidence remain strong enough under justified canopy-vintage and side-of-street perturbations to establish either route as robustly cooler? (Carried forward from v0.2.) |
| territory | `t-madrid-atocha-alcala` |
| version | commit `c69688e` |
| reproducibility | `inspectable`. Frozen inputs and hashes, and a perturbation results CSV, are committed; the Atlas did not re-run them. Instructions: `s-hati-gate3b`. |
| licence | code `none` at the pin (MIT added for `src/`, `tests/`, `app/` on 2026-11-11, after the pin, per `s-hati-pilot-status`) · data: route geometry ODbL 1.0 (OSM-derived), other derived data `not_stated` · text `not_stated` |
| sources | `s-hati-gate3b`, `s-hati-status` |

**Methodology** (`s-hati-gate3b`, `s-hati-routes`):

- Modelled comparison of two frozen, hashed routes for OD1 (Atocha → Puerta
  de Alcalá):
  - Route A, the Paseo del Prado / Recoletos axis, 2,657.8 m;
  - Route B, the Alfonso XII park-edge, 2,365.7 m.
- Frozen study day 2023-08-24, departures 14:00 and 17:00.
- Thermal model: stateful single-call SOLWEIG producing UTCI, as a
  continuous 72-step, 15-minute sequence.
- Five frozen perturbations, including canopy source and vintage, and
  side-of-street.
- Pre-registered negative controls.
- Frozen decision rule: a sign reversal under a justified perturbation, or
  an ensemble spanning zero, yields ABSTAIN.

**Findings** (`s-hati-gate3b`):

| id | statement | uncertainty |
|---|---|---|
| `f-hati-ped-baseline` | Baseline Route A − Route B mean-UTCI difference is 0.05 °C at 14:00 and 0.37 °C at 17:00. | The perturbation ensemble spans zero at both times: −1.31…+0.23 °C (14:00) and −0.39…+0.38 °C (17:00). |
| `f-hati-ped-reversal` | The A−B sign reverses under the canopy perturbation (E-P2) at 14:00 and under side-of-street (E-P5) at 14:00 and 17:00. | null |
| `f-hati-ped-metrics` | Legitimate metrics disagree. Thermal intensity marginally favours A; exposure duration favours B (shorter route, fewer high-stress minutes). | null |
| `f-hati-ped-boundary` | Route point-max UTCI lies at 45.0–45.9 °C, next to the +46 °C extreme category boundary, across perturbations. | Category-boundary proximity (NC6 flagged). |

**Evidence.** `ev-hati-modelled-routes` is carried forward unchanged from
v0.2 (`SPEC.md` §12.4 at tag `v0.2.1`): `input_kind` `simulated`,
`substantiation` `source_stated`, and the same statement, limitation and
sources. Its basis is the source's verdict paragraph. Provenance is null
per record; the forcing and geometry inputs are named in the methodology.

**Outcome `o-hati-abstain`:**

- **verdict_label:** "ABSTAIN / NO ROBUST DIFFERENCE"
- **outcome_type:** `abstain`
- **statement and claim_ceiling:** carried forward unchanged from v0.2.
- **limitations:**
  - one OD pair, one day, two departures;
  - modelled exposure only;
  - the verdict would change only with independent pedestrian-level
    Tmrt/UTCI measurement, an authoritative current canopy model, or
    resolved side-of-street mapping (`s-hati-gate3b`).
- **sources:** `s-hati-gate3b`, `s-hati-status`

**Outputs.** None. The extension has no publication or persistent
identifier of its own.

**Figures.** None identified in the pinned extension documents.

### 12.5 `r-snto-pnsg` — SNTO, PNSG decision evidence

| Field | Frozen value |
|---|---|
| class · lifecycle | `documented_research` · `active` |
| title | SNTO — PNSG Decision Evidence |
| summary | Bounded destination-management case using environmental and governance evidence. (Carried forward from v0.2.) |
| research_question | Carried forward unchanged from v0.2. It matches the brief §1 decision question. |
| territory | `t-pnsg` |
| version | commit `2c65fe2` |
| reproducibility | `inspectable`. The time series and Mann-Kendall results are committed; the Atlas did not re-run them. Instructions: `s-snto-readme`. |
| licence | code `custom` (academic and research use; commercial use needs written permission; `s-snto-license`). The Zenodo software record states CC BY 4.0, which conflicts (Q4). · data: provider licences (Copernicus, OAPN, INE, ALMUDENA, OSM; `s-snto-readme` §11) · text `not_stated` |
| sources | `s-snto-brief`, `s-snto-readme` |

**Methodology** (`s-snto-brief`, `s-snto-readme`):

- **Time series:** monthly Sentinel-2 (`S2_SR_HARMONIZED`) NDVI, NDMI and
  EVI for 21 PNSG campaign assets, 2021-01 to 2026-06 (66 months).
- **Trend tests:** Mann-Kendall on the deseasonalised series, with tie
  correction; Sen slope with a non-parametric confidence interval; a
  Yue-Pilon pre-whitening robustness check.
- **Combined with:**
  - official PRUG zoning;
  - a two-scene ΔEHS reading of 218 OAPN trails.
- **Governing rules:**
  - the spatial resolution of a claim may not exceed that of its evidence;
  - environmental change is not tourism impact;
  - each unit gets a decision status: priority / monitor / insufficient.

**Findings** (`s-snto-brief`):

| id | statement | uncertainty |
|---|---|---|
| `f-snto-trends` | Of 21 assets with a real time series, 6 show significant greening, 14 no trend and 1 significant decline. The dominant signal is stability or recovery. | null |
| `f-snto-maliciosa` | Maliciosa-Porrones (climbing area) shows a significant NDVI decline (τ = −0.37, p ≈ 0, n = 65; change-point 2025-03), but NDMI rises significantly (τ = +0.22, p = 0.01). The signals are internally contradictory. Status: MONITOR / DATA GAP. | Evidence confidence LOW–MODERATE: strong temporal signal, poor spatial fit, no attribution evidence. |
| `f-snto-priority` | Zero units qualify for priority management review on public-use grounds. Across the 218 trails, the two-scene ΔEHS gives 165 improving and 46 worsening. | Trail aggregate: MODERATE, because there is no visitor denominator and the reading is two-scene, not a time series. |

**Evidence.** Carried forward unchanged from v0.2 with their original pins:
`ev-snto-s2-inputs` (acquired), `ev-snto-trends` (derived), `ev-snto-prug`
(acquired) and `ev-snto-visitor-gap` (unestablished). Provenance is added:

| Record | Publisher | Licence | Attribution |
|---|---|---|---|
| Sentinel-2 | ESA / Copernicus | Copernicus open data | "Contiene datos Copernicus Sentinel-2 modificados" |
| PRUG | OAPN | institutional reuse with citation | per `s-snto-readme` §11 |

**Outcome `o-snto-insufficient`:**

- **verdict_label:** "INSUFFICIENT EVIDENCE TO PRIORITISE" (verbatim, brief
  §7 and §9). v0.2 displayed the shorter "INSUFFICIENT EVIDENCE".
- **outcome_type:** `insufficient_evidence`
- **statement and claim_ceiling:** carried forward unchanged from v0.2.
- **limitations:**
  - no field validation by the author;
  - no causal attribution;
  - no visitor-use denominator;
  - point and linestring footprints are a coarse proxy.
- **sources:** `s-snto-brief`

**Outputs.** None specific to the PNSG case. The software DOI belongs to
`p-snto`.

**Figures.** None reusable (§12.9).

### 12.6 `r-network-pilot` — Pedestrian Network Accessibility Pilot

| Field | Frozen value |
|---|---|
| class · lifecycle | `documented_research` · `closed` (verdict issued; follow-up audit closed with HOLD) |
| title | Pedestrian Network Accessibility Pilot (San Isidro, Madrid) |
| summary | Isolated, bounded experiment measuring how far straight-line distance departs from pedestrian-network distance to municipal sports facilities. |
| research_question | For official address portals in one Madrid barrio, how far does the straight-line distance to the nearest official municipal basic sports facility depart from the shortest distance along the OpenStreetMap pedestrian network, and does the choice of metric change which facility is nearest? (verbatim, `s-net-readme`, with the source's bold emphasis removed) |
| territory | `t-san-isidro` |
| version | commit `ad7ed9b` |
| reproducibility | `inspectable`. The pipeline, tests and query are public, and the OSM extract is archived (`s-net-dataset`). The municipal inputs are mutable at source. The follow-up audit reproduced the input selection, but not a byte-identical rerun (`s-net-audit`). The Atlas did not re-run it. Instructions: `s-net-readme`. |
| licence | code **MIT** · data: Ayuntamiento de Madrid **CC BY 4.0**; OSM extract and derived network values **ODbL 1.0** (`s-net-attribution`) · text MIT (repository) |
| sources | `s-net-readme`, `s-net-results` |

**Methodology** (`s-net-readme`, `s-net-results`):

- **Origins:** 2,651 official address portals (`TIPO_NDP = PORTAL`,
  callejero 213605) in barrio 113.
- **Destinations:** 38 access points of municipal basic sports facilities
  (dataset 200215), within 1,000 m of the barrio.
- **Network:** an OSM pedestrian graph from an Overpass extract (the barrio
  plus 1,600 m), with 16,715 ways retained.
- **Measurement:** in EPSG:25830, for each origin the nearest facility by
  straight line and by shortest network path. Four quantities are reported:
  detour ratio, understatement, discordance and false inclusion.
- **Acceptance criteria:** four (A1–A4), documented retrospectively; the
  source states they are **not pre-registered**.
- **Sensitivity:** seven variants.

**Findings** (`s-net-results`, `s-net-audit`):

| id | statement | uncertainty |
|---|---|---|
| `f-net-detour` | Over 2,636 measured portals, the median detour ratio (same origin, same facility) is 1.354, and the mean is 1.538 over 2,634 pairs. The median understatement is 98.1 m. | Medians across the sensitivity variants range from 1.347 to 1.922 (A4 passes in every variant). The denominator rule moves the median by 0.0008. |
| `f-net-discordance` | For 21.05 % of measured portals (555 of 2,636), the straight-line-nearest facility is not the network-nearest. | Over all 2,651 selected origins: 20.94 %. |
| `f-net-false-inclusion` | A "within X m" claim made on straight-line distance fails for 35.35 % of straight-line-inside portals at 300 m (614 of 1,737) and for 19.59 % at 500 m (465 of 2,374). | Single barrio, single facility category. |
| `f-net-municipal-audit` | The follow-up audit of the municipal 500 m sports-proximity indicator concluded **"HOLD para la comparación municipal"** (2026-11-20). The indicator's executed calculation, inventory, population denominator and reference value were not located. | — |

**Evidence:**

| id | input_kind | substantiation | statement | limitation | sources |
|---|---|---|---|---|---|
| `ev-net-origins` | `acquired` | `source_stated` | 2,651 official address portals in barrio 113; all 2,651 agree with the official barrio polygon. | Portals are addresses, not residents or the population denominator. | `s-net-results` |
| `ev-net-facilities` | `acquired` | `source_stated` | 38 access points of municipal basic sports facilities, from 606 citywide records (dataset 200215). | Catalogue coordinates, not verified physical entrances (`s-net-audit`). One facility category only. | `s-net-results`, `s-net-audit` |
| `ev-net-osm` | `acquired` | `source_stated` | OSM Overpass extract of 87,364 elements, data vintage 2026-11-16T17:20:19Z, archived unmodified. | OSM pedestrian-way completeness is unaudited and uneven; it is the binding constraint (verdict condition 1). | `s-net-dataset`, `s-net-results` |
| `ev-net-distances` | `derived` | `source_stated` | Per-portal straight-line and shortest-network distances, and the four reported quantities. | Modelled walking distance, not observed walking or accessibility. | `s-net-results` |
| `ev-net-municipal-gap` | `unestablished` | `not_established` | The municipal indicator's executed calculation, inventory and population denominator were not located in public documentation. | No comparison with the municipal indicator is possible. | `s-net-audit` |

Provenance:

| Record | Publisher and dataset | Licence | Retrieval and checksum |
|---|---|---|---|
| Origins | Ayuntamiento de Madrid, 213605 | CC BY 4.0 | retrieval date recorded in the pilot's `pilot_report.json`; not re-verified at Gate 2 |
| Facilities | Ayuntamiento de Madrid, 200215 | CC BY 4.0 | as above |
| OSM | Overpass extract, DOI `10.5281/zenodo.24288645` | ODbL 1.0 | retrieved 2026-11-16T17:21:14Z; SHA-256 `74416526…085edf` |

**Outcome `o-net-modify`:**

- **verdict_label:** "MODIFY"
- **outcome_type:** `conditional`
- **statement:** The experiment is defensible: all four documented criteria
  pass and the finding survives every valid variant. It does not license a
  product feature until five conditions are met:
  1. an OSM completeness audit;
  2. replication across contrasting barrios;
  3. a facility-register source gate;
  4. a qualified ODbL review;
  5. a runtime decision.
- **claim_ceiling:**
  - A single-barrio figure must never be shown as a Madrid figure.
  - The result is a measured modelled-distance discrepancy, not an
    accessibility, equity or service-coverage assessment.
  - The criteria were documented retrospectively, not pre-registered.
  - No comparison with the municipal indicator is established (HOLD).
- **limitations:**
  - one barrio;
  - one facility category;
  - OSM completeness unaudited;
  - the ODbL status of derived outputs is contested and unresolved by the
    source.
- **sources:** `s-net-results`, `s-net-audit`

**Outputs:**

| id | citation | type | editorial status | identifier |
|---|---|---|---|---|
| `out-net-dataset` | Karahrodi, S. (2026). *OpenStreetMap pedestrian-network extract for the Madrid Network Accessibility pilot (San Isidro, Madrid, 2026-11-16)* (Version 1.0.0) [Data set]. Zenodo. | `dataset` | `not_peer_reviewed` | `pid` · DOI `10.5281/zenodo.24288645` (version; concept `10.5281/zenodo.24288644`) |

The dataset's licence is ODbL 1.0, which DataCite lists in its rights
metadata. It is verified by `s-net-dataset`.

**Figures:**

| Figure | File and pin | Content | Licence | Decision |
|---|---|---|---|---|
| `fig-net-1` | `results/figure_straightline_vs_network.png` @ `ad7ed9b` (blob `a5df9962`, sha256 `efab4198…2e6a`, 2250 × 690 px) | Three panels: (a) network vs straight-line distance for the same origin and facility; (b) cumulative detour ratio under the seven extraction variants; (c) share of straight-line-inside origins outside by network at 300, 500 and 800 m. | The image itself embeds the attribution "Official sources: Ayuntamiento de Madrid (CC BY 4.0). Contains information from OpenStreetMap, available under the ODbL 1.0, (c) OpenStreetMap contributors". Licence basis: MIT repository and `s-net-attribution`. | **Reusable**, reproduced unaltered with its embedded attribution. |

### 12.7 `p-lens` and `p-snto` — research platforms

**`p-lens` — Madrid Urban Evidence Lens**

| Field | Frozen value |
|---|---|
| class · lifecycle | `research_platform` · `active` |
| summary | A place-first, static web application for reading what official sources document about urban development in Madrid, and what that evidence does not let you conclude (`s-lens-readme`). |
| what it documents | Descriptive counts and official context for a chosen place in Madrid: barrio, registered residents, licensed tourist dwellings (VUT), registered unemployment, planning ámbito. It also covers place-to-place comparison and city-level INE hotel-demand context. Each source carries provenance, licence and an interpretation ceiling (`s-lens-readme`). |
| claim limits | It does **not** establish tourist pressure, carrying capacity, tourist behaviour or footfall, safety outcomes, tourism quality, rankings or composite scores, economic impact, causal effects of heat, real-time conditions, or city-wide heat coverage (`s-lens-claims`). |
| hosted item | `r-network-pilot` (an isolated research package; the source states that nothing in the application references it) |
| territory | `t-madrid` |
| version | commit `3035323`; GitHub release `v0.1.0` |
| licence | code **MIT** · data: per-source official licences (`s-lens-readme`) · text MIT (repository) |
| outputs | `out-lens-release`: Madrid Urban Evidence Lens, GitHub release `v0.1.0`. Type `software`, editorial status `not_peer_reviewed`, identifier `no_pid`; verified by `s-lens-release`. |
| sources | `s-lens-readme`, `s-lens-claims`, `s-lens-release` |

**`p-snto` — SNTO observatory**

| Field | Frozen value |
|---|---|
| class · lifecycle | `research_platform` · `active` |
| summary | Public research observatory turning Sentinel-2 and official OAPN cartography into environmental-change evidence for protected-area public-use management, with explicit limits on tourism attribution (`s-snto-readme`). Its source code is publicly available under a custom academic-use licence. That is not an open-source licence (Q4). |
| what it documents | Pipeline A: real Sentinel-2 indicators for the PNSG, including the 21-asset 2021–2026 trend layer and 218 OAPN trails, with official PRUG zoning. Pipeline B: a governance demonstration on 20 **synthetic** assets (`s-snto-readme` §1). |
| claim limits | From `s-snto-readme` §9 and `s-snto-brief`: field validation (#26) has not run; the three v2.2 real-data paths (MITMA mobility, SCM zones, SVI series) are built but not ingested; the economic layer is conditional scenarios; there is no causal attribution of change to tourism. The README §10 causal rationale (trampling → compaction → spectral signal) is a design hypothesis of the platform. The Atlas does **not** repeat it as an established finding. |
| hosted item | `r-snto-pnsg` |
| territory | `t-pnsg` |
| version | commit `2c65fe2` (original pin) |
| licence | code `custom` (`s-snto-license`); conflict with the Zenodo record noted (Q4) · data: provider licences · text `not_stated` |
| outputs | `out-snto-software`, described below; verified by `s-snto-zenodo` |
| sources | `s-snto-readme`, `s-snto-zenodo` |

`out-snto-software`:

- **Citation:** Karahrodi, S. (2026). *SNTO — Smart Nature Tourism
  Observatory* [Software]. Zenodo.
- **Type and review:** `software`, `not_peer_reviewed`.
- **Identifier:** `pid`, concept DOI `10.5281/zenodo.20818269`. Its latest
  version at the 2026-11-25 check is `v2.0.0`, issued 2026-07-21.
- **Licence:** the record states CC BY 4.0.
- **Caution:** the Zenodo description claims "atribución causal de la
  degradación (uso turístico vs. clima) y priorización presupuestaria".
  This exceeds the brief's L5a ceiling. The Atlas cites the record as a
  software output only, never as support for those claims (Q5).

### 12.8 `i-fieldos` — FieldOS

| Field | Frozen value |
|---|---|
| class · lifecycle | `instrument` · `active` |
| summary | Offline-first supporting instrument for structured tourism field evidence capture. (Carried forward from v0.2.) |
| research_question | null |
| territory | none ("No case-specific territory") |
| version | commit `271d3a7` |
| reproducibility | `documented_only`. The validation protocol is published; the run is owner-attested and not reproducible by a third party. |
| licence | code **Apache-2.0** · data `none` · text Apache-2.0 (repository) |
| sources | `s-fieldos-run`, `s-fieldos-readme` |

**Methodology** (`s-fieldos-run`). The owner executed the documented
60–120 minute offline validation workflow on a physical device:

- preparation and preflight checks;
- an offline campaign;
- a mid-campaign close and reopen;
- offline verification;
- export and backup validation.

The protocol's targets (20–40 observations, photographs and so on) were
**not recorded as met**.

**Evidence.** Carried forward unchanged from v0.2 with their original pins:
`ev-fieldos-iphone-run` (observed, owner_attested) and
`ev-fieldos-android-gap` (unestablished). "iPhone" is source-stated in
`s-fieldos-readme`. `s-fieldos-run` says only "physical device".

**Outcome `o-fieldos-functional`:**

- **verdict_label:** "FIRST FIELD RUN: PASS — owner-attested" (verbatim).
  v0.2 displayed the category "FUNCTIONAL TEST".
- **outcome_type:** `functional_test`
- **statement and claim_ceiling:** carried forward unchanged from v0.2.
- **sources:** `s-fieldos-run`, `s-fieldos-readme`

**Outputs and figures.** None. There is no release or persistent
identifier, and there are no research figures.

### 12.9 Figure and geometry inventory for Gate 3, and open matters

| Asset | Decision |
|---|---|
| `g-san-isidro`, `g-madrid-municipality` | **Reuse** (CC BY 4.0) |
| `g-pnsg-boundary` | **Reuse** with "Fuente: Organismo Autónomo Parques Nacionales" (Q2 resolved) |
| `g-hati-routes` | **Reuse under ODbL 1.0**, the two route LineStrings only, after the maintainer's explicit approval (Q1) |
| `fig-net-1` | **Reuse** unaltered |
| `fig-hati-1`…`fig-hati-4` | **Reuse** (CC BY 4.0), from the deposited PDF only; Figure 1 adds the OSM credit (Q3 resolved) |
| SNTO `docs/figures/` (ΔEHS histogram, EHS map, SCM breakdown) | **Excluded.** The licence is unresolved (Q4). The figures show two-scene ΔEHS and a **simulated** causal attribution (SCM α-decay), not the frozen trend evidence. |
| HATI pilot study area; HATI `outputs/maps/` | **Excluded.** These are derived outputs with no assigned licence. |
| CHALUS (any) | **Excluded** (private repository, SPEC §3.2) |

**Open matters.** These are recorded rather than resolved.

| # | Matter | Blocks |
|---|---|---|
| Q1 | **Decision recorded:** authorise only the two HATI route LineStrings under ODbL 1.0, as a separate file with their own licence, attribution and provenance (§12.2). **Explicit maintainer approval** must be recorded in §12.10 before the plate is published. | Publication of the `g-hati-routes` plate only (Gate 3 can build everything else) |
| Q2 | **Resolved.** OAPN reuse terms apply: `s-oapn-catalogue` and `s-miteco-legal`, with the required attribution "Fuente: Organismo Autónomo Parques Nacionales". No Creative Commons licence is assigned. Vertex identity with the catalogue's SHP is not verified (§12.2). | none |
| Q3 | **Resolved.** Figures 1–4 are present in the deposited PDF (pages 24–27), and the PDF and the Zenodo metadata both state CC BY 4.0. Figure 1(a) needs an added OSM credit. | none |
| Q4 | The SNTO licence discrepancy is **preserved, not resolved**: the repository's `LICENSE` is custom academic use (not open source); the Zenodo software record states CC BY 4.0. The Atlas shows both and calls SNTO a "public research observatory", not "open source". | none for v0.3.0. SNTO figures stay excluded. |
| Q5 | The SNTO Zenodo description claims causal attribution and budget prioritisation beyond the brief's L5a ceiling. Correcting the record is the owner's decision. The Atlas cites the DOI as a software output only. | none (cited with caution) |
| Q6 | A documented technical dependency exists: Lens displays a cited slice of HATI-Madrid pilot UTCI evidence (14 points, 21 August 2023; `s-lens-claims`, "Relationship to HATI-Madrid"). SPEC I7 forbids relations in v0.3.0, so it is **not** modelled or linked. The Lens dossier states no relation. Modelling it as a `technical` relation is a v0.3.x decision. | none (deferred) |

**Resolved at this gate:**

- **SNTO DOI:** `10.5281/zenodo.20818269` is a findable Zenodo concept
  record (software, latest `v2.0.0`), cited as a software output only (Q5).
- **PNSG boundary reuse basis** (Q2).
- **HATI figure presence and rights** (Q3).
- **Network dataset licence:** ODbL 1.0 appears in the DataCite rights
  metadata.
- **San Isidro geometry:** CC BY 4.0.

### 12.10 Human verification record (maintainer)

The maintainer completes this table before applying `gate-approved`.

- A claim counts as verified when the linked public source, at its
  pinned ref, supports its content (I11).
- A verdict counts as verified when it appears verbatim in that source
  (I14).
- AI-assisted checks (§12.0) are not entries in this table.

| Item | Claims to verify | Pinned sources (direct links) | I14 verdict to check | Verified by / date |
|---|---|---|---|---|
| `r-hati-pilot` | RQ1, methodology, 3 findings, 3 evidence records, claim ceiling, 2 outputs, 4 figures | [Preprint PDF, DOI 10.5281/zenodo.22707470](https://doi.org/10.5281/zenodo.22707470) (abstract; §1; §2.1; p. 18 licence; p. 21 captions; pp. 24–27 figures) · [PROJECT_STATUS.md@97b0e40](https://github.com/soroushkarahrodi79-oss/heat-adaptive-tourism-madrid/blob/97b0e40669386c29dafa8c2f5b5031f14ff71771/PROJECT_STATUS.md) | "thermal representation is a substantive modelling choice in heat-adaptive tourism decision support" | ☐ |
| `r-hati-pedestrian` | methodology, 4 findings, carried-forward evidence and outcome | [GATE3B_DECISION.md@c69688e](https://github.com/soroushkarahrodi79-oss/heat-adaptive-tourism-madrid/blob/c69688e7827f1faaf855fdb58a8e80a497d73830/docs/research/pedestrian-heat/gate3b/GATE3B_DECISION.md) · [PROJECT_STATUS.md@c69688e](https://github.com/soroushkarahrodi79-oss/heat-adaptive-tourism-madrid/blob/c69688e7827f1faaf855fdb58a8e80a497d73830/PROJECT_STATUS.md) · [GATE2_FREEZE_MANIFEST.json@c69688e](https://github.com/soroushkarahrodi79-oss/heat-adaptive-tourism-madrid/blob/c69688e7827f1faaf855fdb58a8e80a497d73830/docs/research/pedestrian-heat/gate2/GATE2_FREEZE_MANIFEST.json) | "ABSTAIN / NO ROBUST DIFFERENCE" | ☐ |
| `r-snto-pnsg` | methodology, 3 findings with uncertainty, carried-forward evidence and outcome | [PNSG_DECISION_EVIDENCE_BRIEF.md@2c65fe2](https://github.com/soroushkarahrodi79-oss/snto-smart-tourism-observatory/blob/2c65fe2ac9a09662cddef4cfa68290e0cd6e1278/docs/PNSG_DECISION_EVIDENCE_BRIEF.md) · [README.md@2c65fe2](https://github.com/soroushkarahrodi79-oss/snto-smart-tourism-observatory/blob/2c65fe2ac9a09662cddef4cfa68290e0cd6e1278/README.md) (§9, §11) | "INSUFFICIENT EVIDENCE TO PRIORITISE" | ☐ |
| `r-network-pilot` | question, methodology, 4 findings, 5 evidence records, claim ceiling, output, `fig-net-1` | [README.md@ad7ed9b](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f/research/network_accessibility_pilot/README.md) · [RESULTS.md@ad7ed9b](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f/research/network_accessibility_pilot/RESULTS.md) · [MUNICIPAL_INDICATOR_AUDIT.md@f1cd19d](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/f1cd19d573d6ab3e06700b03c5189864eed23dcd/research/network_accessibility_pilot/MUNICIPAL_INDICATOR_AUDIT.md) · [ATTRIBUTION.md@ad7ed9b](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f/research/network_accessibility_pilot/results/ATTRIBUTION.md) · [figure_straightline_vs_network.png@ad7ed9b](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f/research/network_accessibility_pilot/results/figure_straightline_vs_network.png) · [Dataset DOI 10.5281/zenodo.24288645](https://doi.org/10.5281/zenodo.24288645) | "MODIFY" (and "HOLD para la comparación municipal") | ☐ |
| `p-lens` | summary, what it documents, claim limits, output | [README.md@3035323](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/3035323a233e5fa83b6b4babe8a2ccf3ac7e4196/README.md) · [CLAIMS_AND_LIMITATIONS.md@3035323](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/3035323a233e5fa83b6b4babe8a2ccf3ac7e4196/docs/CLAIMS_AND_LIMITATIONS.md) · [release v0.1.0](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/releases/tag/v0.1.0) | — | ☐ |
| `p-snto` | summary ("public research observatory"), what it documents, claim limits, output with the Q5 caution, Q4 licence discrepancy | [README.md@2c65fe2](https://github.com/soroushkarahrodi79-oss/snto-smart-tourism-observatory/blob/2c65fe2ac9a09662cddef4cfa68290e0cd6e1278/README.md) (§1, §9–§12) · [LICENSE@2c65fe2](https://github.com/soroushkarahrodi79-oss/snto-smart-tourism-observatory/blob/2c65fe2ac9a09662cddef4cfa68290e0cd6e1278/LICENSE) · [Concept DOI 10.5281/zenodo.20818269](https://doi.org/10.5281/zenodo.20818269) | — | ☐ |
| `i-fieldos` | methodology, carried-forward evidence and outcome | [FIRST_FIELD_RUN.md@271d3a7](https://github.com/soroushkarahrodi79-oss/fieldos/blob/271d3a77c58361f43459d068f4e8a100611a87fd/docs/FIRST_FIELD_RUN.md) · [README.md@271d3a7](https://github.com/soroushkarahrodi79-oss/fieldos/blob/271d3a77c58361f43459d068f4e8a100611a87fd/README.md) | "FIRST FIELD RUN: PASS — owner-attested" | ☐ |
| Geometry | San Isidro / Madrid (CC BY 4.0); PNSG (OAPN terms); HATI routes (ODbL) | [madrid_admin.meta.json@ad7ed9b](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/ad7ed9bf10643d541d3193bb56bd4e649cdb8f3f/data/geography/madrid_admin.meta.json) · [oapn_limite_pn.geojson@2c65fe2](https://github.com/soroushkarahrodi79-oss/snto-smart-tourism-observatory/blob/2c65fe2ac9a09662cddef4cfa68290e0cd6e1278/data/raw_assets/vector_data/oapn/oapn_limite_pn.geojson) · [datos.gob.es record](https://datos.gob.es/es/catalogo/ea0043369-limites-de-los-parques-nacionales-espanoles) · [MITECO aviso legal](https://www.miteco.gob.es/es/atencion-al-ciudadano/aviso-legal.html) · [route_freeze_hashes.json@c69688e](https://github.com/soroushkarahrodi79-oss/heat-adaptive-tourism-madrid/blob/c69688e7827f1faaf855fdb58a8e80a497d73830/data/processed/pedestrian-heat/route_freeze_hashes.json) | — | ☐ |

**Explicit approvals, recorded separately from verification:**

| # | Approval | Maintainer / date |
|---|---|---|
| A-Q1 | I authorise publication of the two HATI route LineStrings (`g-hati-routes`) in the Atlas under ODbL 1.0, with "© OpenStreetMap contributors" attribution and the provenance in §12.2. | ☐ |

### 12.11 Migration map from schema 0.2.0

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

---

## 13. v0.4 amendment — Knowledge Graph and four admitted items

### 13.0 Authority and decisions

The ecosystem audit, ontology and prototype are the evidence of PR #22
(`proposal/v0.4-knowledge-graph`, head `8d69a7d`, not merged). On 2026-11-26
the maintainer answered “Approve all as written” to the five decisions below,
recorded here verbatim from the brief:

| # | Decision (approved by the maintainer, 2026-11-26) |
|---|---|
| E1 | Public repositories without a licence may be referenced as nodes, but no unlicensed content or code may be copied or redistributed. |
| E2 | Admit Madrid Evidence MCP, PNOA-LiDAR pilot, Madrid Transit Graph and Madrid Isovist Demo, subject to their bounded content freezes. Defer SNTO Alpine and SK Lab as separate items. |
| E3 | Preserve and display both exact Lens version pins. Never silently substitute one version for another. |
| E4 | Do not merge or deploy the isolated prototype. |
| E5 | Exclude hypothetical and conceptual relationships from the production graph. Preserve them only in the development record. |

This amendment is itself a governed change: it takes effect only when the
maintainer applies `gate-approved` to its pull request.

### 13.1 Scope of v0.4

The seven v0.3 records (§3.1) are unchanged, byte for byte. Four items are
added after them:

| Atlas id | Class | Item | Verdict (verbatim) | Version |
|---|---|---|---|---|
| `e-transit-graph` | experiment | Madrid Transit Graph | “FREEZE” | `a9ff926` |
| `e-isovist` | experiment | Madrid Isovist Demo | “MIXTO” | `932cd61` |
| `e-pnoa-lidar` | experiment | PNOA-LiDAR pilot | “NO-GO for the production viewer at this time” | `313b8bf` |
| `i-madrid-mcp` | instrument | Madrid Evidence MCP | “MODIFY (provisional)” | `3e4959b` |

Deferred (development record only): SNTO Alpine Edition, SK Spatial
Intelligence Lab, Tourism Intelligence Desk, Spatial Investigation Studio.
Excluded: every private repository (CHALUS, the rooftop PV observatory,
Shade Gate Madrid, MVA isovist research). The MCP repository has no licence:
under E1 it is referenced, and nothing from it is copied.

Three territories are added as text, without geometry: `t-metro-madrid` (a
network extent, explicitly not contained in the municipality),
`t-lavapies-isovist` and `t-embajadores` (kept separate; overlap not
computed). One output is added: `out-transit-release`.

### 13.2 Sources

New `atlas.json` sources, frozen at their first pin (I18 applies to them):

| id | kind | label | pinned_ref | accessed_at | pin_change |
|---|---|---|---|---|---|
| `s-transit-readme` | commit | Madrid Transit Graph — README (status, definitions, provenance, limitations, licences) | `a9ff926006c0c155fe7272baf5fd2d9b326d3706` | 2026-11-26 | null (original pin) |
| `s-transit-prereg` | commit | Madrid Transit Graph — v0.5 pre-registration | `a9ff926006c0c155fe7272baf5fd2d9b326d3706` | 2026-11-26 | null (original pin) |
| `s-transit-memo` | closeout | Madrid Transit Graph — decision memo (FREEZE, 2026-11-21) | `a9ff926006c0c155fe7272baf5fd2d9b326d3706` | 2026-11-26 | null (original pin) |
| `s-transit-release` | release | Madrid Transit Graph Explorer GitHub release v0.1.0 (published 2026-11-19) | tag v0.1.0 | 2026-11-26 | null (original pin) |
| `s-iso-readme` | commit | Madrid Isovist Demo — README (Step 0 result, scope, data and licences) | `932cd6195f3c1087090c2dda4952ad1bb323304d` | 2026-11-26 | null (original pin) |
| `s-iso-limits` | closeout | Madrid Isovist Demo — limits, pilot status and computational fidelity | `932cd6195f3c1087090c2dda4952ad1bb323304d` | 2026-11-26 | null (original pin) |
| `s-pnoa-readme` | commit | PNOA-LiDAR Madrid pilot — README (question, area, status, isolation) | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` | 2026-11-26 | null (original pin) |
| `s-pnoa-results` | closeout | PNOA-LiDAR Madrid pilot — results (Embajadores, 3rd coverage v1) | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` | 2026-11-26 | null (original pin) |
| `s-pnoa-assessment` | closeout | PNOA-LiDAR Madrid pilot — integration assessment and verdict | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` | 2026-11-26 | null (original pin) |
| `s-pnoa-attribution` | commit | PNOA-LiDAR Madrid pilot — attribution of IGN-derived results (CC BY 4.0) | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` | 2026-11-26 | null (original pin) |
| `s-lens-license-v04` | commit | Madrid Urban Evidence Lens — LICENSE (MIT) at the PNOA-pilot pin | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` | 2026-11-26 | null (original pin) |
| `s-mcp-readme` | commit | Madrid Evidence MCP — README (tools, pinned Lens checkout, tests, limits) | `3e4959bed16a9e960803bc803877115c0784568a` | 2026-11-26 | null (original pin) |
| `s-mcp-stage2` | closeout | Madrid Evidence MCP — Stage 2 evaluation report (exploratory, provisional) | `3e4959bed16a9e960803bc803877115c0784568a` | 2026-11-26 | null (original pin) |
| `s-mcp-lens-pin` | commit | Madrid Evidence MCP — lens-pin.json (Lens commit f67cd47) | `3e4959bed16a9e960803bc803877115c0784568a` | 2026-11-26 | null (original pin) |
| `s-lab-status` | repository | SK Spatial Intelligence Lab — README status table | `3e4959bed16a9e960803bc803877115c0784568a` | 2026-11-26 | null (original pin) |
| `s-lab-tree` | repository | SK Spatial Intelligence Lab — repository tree (no licence file at this commit) | `3e4959bed16a9e960803bc803877115c0784568a` | 2026-11-26 | null (original pin) |

Relationship-only sources in `data/relationships.json` (R4 requires a full
commit SHA contained in the URL):

| id | label | pinned_ref |
|---|---|---|
| `rs-lens-readme-313` | Madrid Urban Evidence Lens — README | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` |
| `rs-lens-dataprov-313` | Madrid Urban Evidence Lens — DATA_PROVENANCE | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` |
| `rs-lens-hatiprov-313` | Madrid Urban Evidence Lens — data/hati_provenance.json | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` |
| `rs-lens-netpilot-313` | Network Accessibility Pilot — README (isolation) | `313b8bf0ca3d3cd8d559c0eb18752970205d9a7c` |
| `rs-hati-readme-97b` | HATI-Madrid — README | `97b0e40669386c29dafa8c2f5b5031f14ff71771` |
| `rs-hati-protocol-97b` | HATI pedestrian heat extension — RESEARCH_PROTOCOL_V0.1 | `97b0e40669386c29dafa8c2f5b5031f14ff71771` |
| `rs-hati-gate1-97b` | HATI pedestrian heat extension — GATE1_FEASIBILITY_DOSSIER | `97b0e40669386c29dafa8c2f5b5031f14ff71771` |
| `rs-hati-pnoa-97b` | HATI-Madrid — data/raw/pnoa_lidar/README | `97b0e40669386c29dafa8c2f5b5031f14ff71771` |
| `rs-fieldos-contract` | FieldOS — PRODUCT_CONTRACT | `b3fdad3dc1b468a96d51ecfc36f49483b7bf21f5` |

### 13.3 Content model additions

- `atlas.json` moves to schema `0.4.0`. Its record shapes are unchanged; its
  `relationships` collection stays empty.
- `data/relationships.json` (schema `0.4.0`) holds the production graph:
  `classes` (technical, structural, methodological, territorial), `predicates`
  (each with definition, domain, range, direction, required evidence, limits
  and inference rules), `methods`, `datasets`, relationship-only `sources`,
  `relationships` and `non_relationships`.
- A relationship has `id`, `predicate`, `class`, `source`, `target`,
  `explanation`, `evidence[]` (`source_id`, `lines` or null, `summary`),
  `limits[]`, and where applicable `extract` (dataset links), `versions[]`
  (technical links: `node`, `ref`, `role`, `note`) and `derived_from` (links
  that mirror a v0.3 field: `research.hosts`, `research.territory_ids`,
  `outputs.research_id`). An optional `verification` object records
  `human_verified` with `verified_by` and `verified_at`; its absence means
  AI-assisted source check only.
- A non-relationship records a documented statement that two items are not
  integrated, with its source and an interpretation limit.
- Hypothetical and analyst-defined (conceptual) readings are not part of the
  model (E5). They are kept in `docs/v0.4/DEVELOPMENT_RECORD.md`.

### 13.4 Invariants

I7 is amended: `atlas.json` carries no relationships. Every other v0.3
invariant applies unchanged to all eleven items. The relationship dataset
adds R1–R14, checked by `tools/validate_relationships.py` on every pull
request and exercised by the negative tests in `tests/`:

| # | Invariant |
|---|---|
| R1 | Schema `0.4.0`; ids unique and distinct from every `atlas.json` id. |
| R2 | Both ends resolve to admitted nodes of the kinds the predicate allows. |
| R3 | Class equals the predicate's class and is one of the four production classes (E5); explanation and limits are present. |
| R4 | Every relation cites at least one public, pinned source; relationship-only sources carry a full commit SHA in their URL; technical relations give line locators; no two sources share a URL. |
| R5 | A technical relation is documented in the dependent item's own repository. |
| R6 | A dataset relation names the extract, product or vintage it used. |
| R7 | A technical relation states the version of both ends; a version different from the dossier's carries a note and is never substituted (E3). |
| R8 | Relations derived from v0.3 fields mirror those fields exactly, both ways; `situated_in` and `has_output` are always derived. |
| R9 | No duplicate relation and no self-loop. |
| R10 | Non-relationships resolve, cite a public source, state an interpretation limit and contradict no technical relation. |
| R11 | No score, rank, weight, confidence, strength, importance or centrality field (I10 carried forward). |
| R12 | Verification is never claimed as human without `verified_by` and `verified_at`; the file states an AI-assisted check with human verification pending. |
| R13 | The dataset notice states that hosting is not integration and that absence of a documented relation does not prove that none exists. |
| R14 | No `prototype/` directory exists in the deployed tree (E4). |

The governance gate covers `data/relationships.json`, `tools/`, `tests/` and
`.github/workflows/` in addition to the v0.3 governed files.

### 13.5 The Knowledge Graph view (`#/graph`)

- Views: Ecosystem (technical, hosting and extension links between items),
  Methods, Data & outputs, Territories, and a Neighbourhood view for any
  node (incoming relations on the left, outgoing on the right).
- Layout: deterministic layered layout; column widths measured from the
  label text; virtual waypoints so long links pass through reserved gaps.
  Positions are not geographic and are not a ranking.
- Interactions (inside `#/graph` only): select a node or a line; search a
  node; filter by relation class and node type; pan, wheel, pinch and button
  zoom; Fit; an expanded view (Escape closes it); keyboard roving focus with
  arrow keys, Enter to select, `+`, `-`, `0` and `F`; computed research
  questions whose answers highlight the relations they use.
- State is the route query (`view`, `focus`, `node` or `edge` or `q`,
  `cls`, `hide`); every state is a deep link and survives reload. In-graph
  changes replace the current history entry.
- Every view shows, as text, the relations it draws, the documented
  non-relations and the relation vocabulary. Items without a documented
  relation in a view are listed in a labelled band.
- A selected relation shows: class, direction, explanation, extract,
  versions, every source with its pin and line locator, what it does not
  establish (record limits, predicate limits and inference rules), and its
  verification state.

### 13.6 Dossiers

Every dossier gains a “Documented relations” section: after Outputs for
documented research, experiments and instruments, and after the hosted
items for platforms (§7 order otherwise unchanged). It lists the item's
relations and non-relations with deep links into the graph, and states when
none is documented. A platform's hosted items include hosting documented in
`data/relationships.json`.

### 13.7 Interpretation rules (binding, shown in the view)

- Hosting is co-location of files, not integration.
- A shared dataset family does not make observations comparable.
- Versions stay distinguishable; none stands in for another (E3).
- Absence of a documented relation does not prove that none exists.
- Connectivity in the graph says nothing about scientific agreement or
  validity, and nothing is ranked, scored or weighted.

### 13.8 Human verification record (maintainer)

AI-assisted source checks (PR #22 and this freeze) are not entries in this
table. The maintainer completes it; until then K2 and the items' claims are
pending, as is v0.3 A2 (§12.10).

| Item | Claims to verify | Pinned sources | I14 verdict to check | Verified by / date |
|---|---|---|---|---|
| `e-transit-graph` | question or role, methodology, 3 evidence, 2 findings, result, claim ceiling, territory, licences | [s-transit-readme](https://github.com/soroushkarahrodi79-oss/madrid-transit-graph/blob/a9ff926006c0c155fe7272baf5fd2d9b326d3706/README.md) · [s-transit-prereg](https://github.com/soroushkarahrodi79-oss/madrid-transit-graph/blob/a9ff926006c0c155fe7272baf5fd2d9b326d3706/research/time_weighted_v05/PRE_REGISTRATION.md) · [s-transit-memo](https://github.com/soroushkarahrodi79-oss/madrid-transit-graph/blob/a9ff926006c0c155fe7272baf5fd2d9b326d3706/research/time_weighted_v05/DECISION_MEMO.md) | “FREEZE” | ☐ |
| `e-isovist` | question or role, methodology, 2 evidence, 2 findings, result, claim ceiling, territory, licences | [s-iso-readme](https://github.com/soroushkarahrodi79-oss/madrid-isovist-demo/blob/932cd6195f3c1087090c2dda4952ad1bb323304d/README.md) · [s-iso-limits](https://github.com/soroushkarahrodi79-oss/madrid-isovist-demo/blob/932cd6195f3c1087090c2dda4952ad1bb323304d/docs/LIMITES_Y_FIDELIDAD.md) | “MIXTO” | ☐ |
| `e-pnoa-lidar` | question or role, methodology, 2 evidence, 1 findings, result, claim ceiling, territory, licences | [s-pnoa-readme](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/313b8bf0ca3d3cd8d559c0eb18752970205d9a7c/research/pnoa_lidar_madrid_pilot/README.md) · [s-pnoa-results](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/313b8bf0ca3d3cd8d559c0eb18752970205d9a7c/research/pnoa_lidar_madrid_pilot/RESULTS.md) · [s-pnoa-assessment](https://github.com/soroushkarahrodi79-oss/madrid-tourism-intelligence-lens/blob/313b8bf0ca3d3cd8d559c0eb18752970205d9a7c/research/pnoa_lidar_madrid_pilot/INTEGRATION_ASSESSMENT.md) | “NO-GO for the production viewer at this time” | ☐ |
| `i-madrid-mcp` | question or role, methodology, 2 evidence, 1 findings, result, claim ceiling, territory, licences | [s-mcp-readme](https://github.com/soroushkarahrodi79-oss/sk-spatial-intelligence-lab/blob/3e4959bed16a9e960803bc803877115c0784568a/mcp/madrid-evidence/README.md) · [s-mcp-stage2](https://github.com/soroushkarahrodi79-oss/sk-spatial-intelligence-lab/blob/3e4959bed16a9e960803bc803877115c0784568a/mcp/madrid-evidence/eval/results-stage2/informe-stage2.es.md) · [s-lab-status](https://github.com/soroushkarahrodi79-oss/sk-spatial-intelligence-lab/blob/3e4959bed16a9e960803bc803877115c0784568a/README.md) | “MODIFY (provisional)” | ☐ |

| Relation class | Count | Relations | Verified by / date |
|---|---|---|---|
| technical | 2 | `rel-lens-reads-hati-pilot`, `rel-mcp-depends-lens` | ☐ |
| structural | 9 | `rel-lens-hosts-netpilot`, `rel-snto-hosts-pnsg`, `rel-lens-hosts-pnoa`, `rel-out-hati-preprint`, `rel-out-hati-code`, `rel-out-net-dataset`, `rel-out-lens-release`, `rel-out-snto-software`, `rel-out-transit-release` | ☐ |
| methodological | 20 | `rel-hatix-extends-hatip`, `rel-hatip-solweig`, `rel-hatix-solweig`, `rel-net-network`, `rel-snto-mk`, `rel-isovist-method`, `rel-transit-method`, `rel-hatip-osm`, `rel-hatip-pnoa1`, `rel-hatix-osm`, `rel-net-osm`, `rel-transit-osm`, `rel-isovist-osm`, `rel-snto-s2`, `rel-snto-oapn`, `rel-psnto-s2`, `rel-lens-admin`, `rel-lens-pnoa-hist`, `rel-pnoa-pnoa3`, `rel-pnoa-admin` | ☐ |
| territorial | 14 | `rel-hatip-terr`, `rel-hatix-terr`, `rel-snto-terr`, `rel-net-terr`, `rel-lens-terr`, `rel-psnto-terr`, `rel-transit-terr`, `rel-isovist-terr`, `rel-pnoa-terr`, `rel-within-central`, `rel-within-atocha`, `rel-within-sanisidro`, `rel-within-embajadores`, `rel-within-lavapies` | ☐ |

### 13.9 Acceptance criteria for v0.4

| # | Criterion |
|---|---|
| K1 | The seven v0.3 records are unchanged; every v0.3 invariant except the amended I7 passes. |
| K2 | Every public relationship has a recorded human verification (§13.8). |
| K3 | R1–R14 pass with zero errors in CI, and the negative tests pass. |
| K4 | No hypothetical or conceptual relation and no deferred item is in the production graph. |
| K5 | Every relation shows explanation, pinned source with locator, limits, versions where relevant and verification state; every item links to its dossier. |
| K6 | Items without a documented relation are shown as such in each view. |
| K7 | Layout and order are deterministic; nothing is ranked or scored. |
| K8 | Every graph state is deep-linkable and survives reload; a text alternative lists the same relations. |
| K9 | axe-core reports 0 violations at 360–1440 px in light, dark and forced colours; full keyboard operation; 200 % zoom; reduced motion respected; no horizontal page scroll. |
| K10 | Zero third-party requests; static GitHub Pages deployment unchanged. |
| K11 | Each new item has its own content freeze (§13.1–§13.2) before any relation to it is published. |
| K12 | v0.3 A2 is reported as pending; nothing implies that it passed. |

### 13.10 Development record

Hypothetical and analyst-defined readings, deferred items and their reasons
are kept in `docs/v0.4/DEVELOPMENT_RECORD.md` and in PR #22. They are never
loaded by the page.
