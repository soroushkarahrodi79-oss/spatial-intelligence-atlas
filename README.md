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

| Path | Role | State |
|------|------|-------|
| `SPEC.md` | **v0.3.0:** meaning, content model (schema `0.3.0`), views, dossier contract; §12 content freeze | Gate 1 approved; Gate 2 freeze merged (PR #18); human verification (§12.10) pending |
| `DESIGN_CONTRACT.md` | **v0.3.0:** visual identity, layout, tokens, components, plates, figures, print | Gate 1 approved |
| `data/atlas.json` | v0.3.0 dataset, schema `0.3.0` (seven items) | Gate 3, in review |
| `data/geometry/*.json` | Offline-prepared plate geometry (EPSG:25830, hashed) | Gate 3, in review |
| `assets/figures/*.webp` | Research figures, format conversion only | Gate 3, in review |
| `index.html` · `styles.css` · `js/*.js` | v0.3.0 runtime (seven native ES modules, no build step) | Gate 3, in review |
| `tools/validate_atlas.py` | Development-only metadata validator (I1–I13, I15–I18, file budget) | Gate 3, in review |
| `.github/workflows/validate.yml`, `link-check.yml` | Development-only CI: validator on every PR; weekly link check | Gate 3, in review |
| `docs/gate0/V0.3_RESEARCH_EXPLORER_GATE0.md` | Approved v0.3 direction (Gate 0, PR #15) | Approved |

> **The deployed site is still `v0.2.1`.** It is governed by `SPEC.md` and
> `DESIGN_CONTRACT.md` **at tag `v0.2.1`**, and its runtime (`app.js`,
> schema `0.2.0`) is preserved at that tag. The files above describe the
> unreleased v0.3.0 release candidate (Gates 3 and 4 in review). Nothing of
> v0.3 is released and no DOI exists. Licence (approved at Gate 4): MIT for
> original code (`LICENSE`), CC BY 4.0 for original data and text, with
> third-party material excluded (`LICENSE-CONTENT.md`).

### v0.3.0 Research Explorer (release candidate)

A document-first research explorer over seven items:

- four documented research items: HATI-Madrid pilot, HATI pedestrian heat
  extension, SNTO — PNSG, and the Pedestrian Network Accessibility Pilot;
- two research platforms: the SNTO observatory and Madrid Urban Evidence
  Lens;
- one instrument: FieldOS.

Views (hash routes, each deep-linkable): Overview `#/`, Research `#/research`,
dossiers `#/research/<id>`, Atlas `#/atlas` with plates `#/atlas/<territory>`,
Evidence Explorer `#/evidence` (facets in the route query), Publications &
Datasets `#/outputs`, Timeline `#/timeline`, About `#/about`.

What the reader should know:

- **Scientific content** is the Gate 2 freeze (`SPEC.md` §12). It was
  checked against the pinned sources with AI assistance. **Per-claim human
  verification by the maintainer (`SPEC.md` §12.10) has not been recorded**,
  and the interface says so.
- **Plates** are drawn only from declared, licensed, hashed geometry:
  San Isidro and the Madrid municipality (CC BY 4.0, Ayuntamiento de Madrid)
  and the PNSG boundary (OAPN reuse terms). The HATI route geometry is **not
  drawn**: its publication needs the maintainer approval A-Q1
  (`SPEC.md` §12.10), which has not been given. That territory is shown as
  text with the reason.
- **Figures** are the four HATI preprint figures (CC BY 4.0, from the
  deposited PDF) and the network-pilot figure (MIT repository, embedded
  attribution), converted to WebP without edits.

CHALUS is excluded because its repository is private. MCP, Transit Graph
and Isovist are deferred to v0.3.x. Gate state: `PROJECT_STATUS.md` §6.1.

Any further change to the content model, design contract or semantic payload
requires a new, separately gated proposal (`PROJECT_STATUS.md` §5–§6), not an
ad hoc edit.

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

`data/atlas.json` at tag `v0.2.1`, schema `0.2.0`:

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

The artifact is static, but the page fetches `data/atlas.json` and the
geometry files at runtime, and browsers block `fetch` over `file://`. Serve
the repository folder:

```
python -m http.server 8000
```

Then open `http://localhost:8000`. If the data cannot be loaded, the page
says so and shows this command; it never renders blank.

All runtime requests are same-origin: no CDN, web font, tile, external image,
remote JSON or telemetry. Source links open in a new tab only on explicit
activation.

### Development checks (never loaded by the page)

```
python tools/validate_atlas.py           # invariants I1–I13, I15–I18 and the file budget
python tools/validate_atlas.py --links   # also checks every declared URL (reports only)
```

A passing validator means the metadata is well-formed and linked. It does
**not** mean a claim is scientifically supported; that is the human review
recorded in `SPEC.md` §12.10. CI runs the validator on every pull request
(`validate.yml`) and the link check weekly and on demand (`link-check.yml`);
neither edits `data/atlas.json`.

`data/geometry/*.json` is committed byte-exact (`.gitattributes`: `-text`), so
its SHA-256 hashes hold on Windows and Linux checkouts alike.

---

## Constraints on the v0.3.0 implementation

The implementation follows `SPEC.md` and `DESIGN_CONTRACT.md` on `main`. In
brief:

- **Static and same-origin only.** One `index.html`, one `styles.css`, at
  most 8 native ES modules in `js/`, `data/atlas.json`, offline-prepared
  `data/geometry/`, and verified `assets/figures/`.
- **No** backend, framework, library, bundler, web font, map tiles,
  basemap, WebGL, analytics, cookies, `localStorage` or runtime AI.
- **Development-only tooling:** `tools/validate_atlas.py` (invariants
  I1–I13 and I15–I18; I14 was checked at Gate 2) and the validation and
  link-check workflows. The page never loads them.
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
6. `data/atlas.json`: the v0.3.0 dataset (schema `0.3.0`), with a pinned
   public source on every claim. The deployed v0.2.1 dataset is at tag
   `v0.2.1`.

Two lists are together sufficient to review the v0.3.0 artifact without
re-reading the prose: the acceptance criteria (`SPEC.md` §10) and the
contract checklist (`DESIGN_CONTRACT.md` §16).
