# Spatial Intelligence Atlas

**Tourism, Risk & Decision Systems**

A small, static, client-side research map. `v0.2.1` — the current deployed
release, a readability and accessibility maintenance release of `v0.2.0` — is
a selective, evidence-informed map of three tourism and spatial-decision
research cases and one supporting instrument, each with a documented result
and claim ceiling.

> **Deployed `v0.2.1`: three research cases and one supporting instrument.
> Documented separately — never integrated, combined, or ranked.**
> `v0.2.0` (same scientific content), the prior `v0.1.1` (five conceptually
> related systems) and the original `v0.1.0` remain preserved, immutable, at
> their tags.

---

**Project status:** see [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for the
canonical release state, gate history, evidence ceiling, and licensing note.

---

## Current status

**Deployed runtime: `v0.2.1`, released 2026-09-25** (PR #13, commit
`ed57ed5`). It is a maintenance release of `v0.2.0` (released 2026-09-22):
readability, accessibility, interaction clarity and deterministic label
layout. Scientific statements, claim ceilings, sources and relationships are
unchanged; the only dataset change is five maintainer-approved,
non-semantic `layout.evidence.x` coordinates. All four v0.2 gates are
complete.

| File | Role | State |
|------|------|-------|
| `SPEC.md` | **v0.3.0 target:** meaning, content model (schema `0.3.0`), views, dossier contract | Gate 1 in review |
| `DESIGN_CONTRACT.md` | **v0.3.0 target:** visual identity, layout, tokens, components, plates, figures, print | Gate 1 in review |
| `data/atlas.json` | Deployed `v0.2.1` content, schema `0.2.0` | Released |
| `index.html` / `styles.css` / `app.js` | Deployed `v0.2.1` runtime | Released |
| `docs/gate0/V0.3_RESEARCH_EXPLORER_GATE0.md` | Approved v0.3 direction (Gate 0, PR #15) | Approved |
| `README.md` | Orientation (this file) | Current |

> **Two specifications, one deployed.** On `main`, `SPEC.md` and
> `DESIGN_CONTRACT.md` now describe the **v0.3.0 Research Explorer**, which is
> not yet implemented. The deployed `v0.2.1` stays governed by those two files
> **at tag `v0.2.1`**. Every reference to `SPEC.md` or `DESIGN_CONTRACT.md` in
> the sections below that describe the deployed runtime means that tagged
> version.

### v0.3.0 Research Explorer (in progress)

The v0.3.0 target is a document-first research explorer. It covers seven
items:

- four documented research items: HATI-Madrid pilot, HATI pedestrian heat
  extension, SNTO — PNSG, and the Pedestrian Network Accessibility Pilot;
- two research platforms: the SNTO observatory and Madrid Urban Evidence
  Lens;
- one instrument: FieldOS.

It offers:

- academic dossiers with sourced methodology, findings and uncertainty;
- cartographic plates drawn only from published, licensed geometry;
- verified research figures;
- an Evidence Explorer;
- Publications & Datasets;
- a Timeline;
- light, dark and print presentation.

CHALUS is excluded because its repository is private. MCP, Transit Graph
and Isovist are deferred to v0.3.x. Nothing of v0.3 is deployed. The gate
state is in `PROJECT_STATUS.md` §6.1.

Any further change to the content model, design contract, or semantic payload
requires a new, separately gated proposal (see `PROJECT_STATUS.md` §5–§6) —
not an ad hoc edit.

> The interface footer shows `schema_version: "0.2.0"` directly, matching the
> dataset shape. It is the dataset schema, not the release tag: the deployed
> release is `v0.2.1`. (In the preserved `v0.1.1` release, the footer's
> `v0.1.0` was the dataset schema, not the release tag — see that release's
> own `PROJECT_STATUS.md` note for the distinction.)

---

## What the deployed `v0.2.1` runtime is

An **explanatory** artifact, not an operational one. It renders a fixed,
hand-authored, source-pinned dataset as a typed graph, viewed through three
fixed projections:

| Mode | Question it answers |
|------|--------------------|
| **TERRITORY** | Where was the work situated? |
| **EVIDENCE** | What is actually documented? |
| **DECISIONS** | What result was documented? |

It performs no computation over live data, makes no predictions, and does not
execute or integrate any part of the systems it describes. The north star:

> From projects to defensible decisions: what was studied, what result was
> documented, what remains unsupported, and where the reader can verify it.

## What this is not

It is **not** an integration of the underlying systems, a data pipeline, a
product suite, a real map, a dashboard, a CV, or a claim of operational
readiness. The full list is in `SPEC.md` §9.

---

## The four v0.2 entities

Inclusion is earned by a documented research question, a reviewable evidence
record, and a bounded result — not by existing or belonging to the same
portfolio (`SPEC.md` §1.1).

| Entity | Kind | Territory | Documented result |
|---|---|---|---|
| HATI — Pedestrian Heat Extension | Core case | Madrid — Atocha to Puerta de Alcalá | `ABSTAIN` / no robust difference |
| SNTO — PNSG Decision Evidence | Core case | Parque Nacional de la Sierra de Guadarrama | `INSUFFICIENT EVIDENCE` |
| CHALUS — Western Mazandaran Pilot | Core case | Western Mazandaran | `NO-GO` |
| FieldOS | Supporting instrument | — no case-specific territory | `FUNCTIONAL TEST` |

FIRSTLOOK-MAD and FAB remain preserved in v0.1 history but are not primary
v0.2 entities. Dizin, SNTO Alpine, Iran Soil, JOB, and other portfolio
repositories remain excluded until a later, separately gated proposal
establishes a documented question, evidence record, result, and reason for
inclusion.

There are **zero** entity-to-entity relationships in v0.2 — only
`situated_in` (case → territory), `documents` (entity → evidence record), and
`reports` (entity → outcome). The atlas explicitly does not imply a pipeline,
shared runtime, data exchange, or product suite between the four entities.

Full content — every research question, outcome statement, claim ceiling,
evidence record, and pinned source — is frozen in `SPEC.md` §12.

---

## Dataset shape (schema `0.2.0`, deployed in `v0.2.1`)

`data/atlas.json`, schema `0.2.0`:

**4 entities** (3 core cases, 1 supporting instrument) · **3 territories** ·
**10 evidence records** · **4 outcomes** · **8 commit-pinned sources** ·
**17 relationships**.

Each evidence record carries two separate, never-collapsed axes:

- **`input_kind`** — `observed`, `acquired`, `derived`, `simulated`,
  `reported`, or `unestablished` (what kind of input the record is).
- **`substantiation`** — `source_stated`, `owner_attested`, or
  `not_established` (how well-supported the record is).

Each visible node carries deterministic normalised `[0, 1]` layout coordinates
for **the modes in which it appears** — entities in all three modes,
territories in TERRITORY, evidence records in EVIDENCE, and outcomes in
DECISIONS. Not every node stores coordinates for all three modes; a node is
only positioned in the modes it is visible in (`SPEC.md` invariant I9). Layout
is fully deterministic — no force simulation, no physics, no randomness, no
layout library. Two page loads at the same viewport size produce
pixel-identical output.

Every source is commit-pinned (`pinned_ref`) and every outbound link in the
UI resolves to exactly one declared source object; arbitrary links in prose
are forbidden (`SPEC.md` §4.5–§4.6).

---

## Running it locally

The artifact is fully static, but `app.js` fetches `data/atlas.json` at
runtime and browsers block `fetch` over `file://`. Serve the directory:

```
python -m http.server 8000
```

Then open `http://localhost:8000`.

The data is **not** inlined into `index.html` or `app.js` — one source of
truth. If the fetch fails, the page renders a clear, styled explanation with
this command, never a blank page.

Beyond the four local files there are **zero** network requests. No CDN, no
webfont, no external image, no remote JSON, no telemetry. Source links in the
detail panel are ordinary user-initiated navigation, opened only on explicit
activation.

---

## Constraints on the v0.3.0 implementation

Read `SPEC.md` and `DESIGN_CONTRACT.md` on `main` before writing a line.
Implementation starts only after Gate 2 (content freeze). In brief:

- **Static and same-origin only.** One `index.html`, one `styles.css`, at
  most 8 native ES modules in `js/`, `data/atlas.json`, offline-prepared
  `data/geometry/`, and verified `assets/figures/`.
- **No** backend, framework, library, bundler, web font, map tiles,
  basemap, WebGL, analytics, cookies, `localStorage` or runtime AI.
- **Development-only tooling:** `tools/validate_atlas.py` (invariants
  I1–I18) and validation and link-check workflows. The page never loads
  them.
- **Colour:** only the six evidence input kinds carry colour, each with a
  dash pattern, a glyph and a text label. Outcomes, classes and plates are
  achromatic.
- **Interactions:** eight, from a closed list (`SPEC.md` §6). No search,
  sorting, ranking, pan or zoom.
- **Accessibility and layout:** WCAG 2.2 AA; light, dark and print; no
  horizontal scroll from 360 px.

For the deployed `v0.2.1`, the constraints are those of
`DESIGN_CONTRACT.md` at tag `v0.2.1`: four files only, five interactions,
and the structured outline below 640 px.

---

## Historical releases

**`v0.1.1`** (2026-09-22, commit `f116b7c`) and **`v0.1.0`** (2026-09-05,
commit `d3f399c`) remain preserved, immutable, at their tags. They described a
different scope — five separate systems (HATI, FIRSTLOOK-MAD, SNTO, FieldOS,
FAB) related only by a symmetric `conceptually_adjacent` edge, with a
six-class evidence vocabulary (`REAL`/`DERIVED`/`CALIBRATED`/`SIMULATED`/
`PROVISIONAL`/`MISSING`) applied per-edge rather than per-record. That
framing no longer describes the live site; check out the `v0.1.1` tag to run
that release as originally published.

---

## Reading order

1. `README.md`: orientation (you are here).
2. `PROJECT_STATUS.md`: release state, gate history, claim ceiling,
   licensing.
3. `docs/gate0/V0.3_RESEARCH_EXPLORER_GATE0.md`: the approved v0.3
   direction.
4. `SPEC.md`: v0.3.0 purpose, scope, content model, views, interactions,
   dossier contract, non-goals and acceptance criteria. For v0.2.1, read it
   at tag `v0.2.1`.
5. `DESIGN_CONTRACT.md`: v0.3.0 visual identity, layout, tokens,
   typography, components, plates, figures, print and accessibility. For
   v0.2.1, read it at tag `v0.2.1`.
6. `data/atlas.json`: the deployed dataset, with a pinned source on every
   claim.

Two lists are together sufficient to review the v0.3.0 artifact without
re-reading the prose: the acceptance criteria (`SPEC.md` §10) and the
contract checklist (`DESIGN_CONTRACT.md` §16).
