# Spatial Intelligence Atlas

**Tourism, Risk & Decision Systems**

A small, static, client-side research map. `v0.2.0` — the current deployed
release — is a selective, evidence-informed map of three tourism and
spatial-decision research cases and one supporting instrument, each with a
documented result and claim ceiling.

> **Deployed `v0.2.0`: three research cases and one supporting instrument.
> Documented separately — never integrated, combined, or ranked.**
> The prior `v0.1.1` (five conceptually related systems) and the original
> `v0.1.0` remain preserved, immutable, at their tags.

---

**Project status:** see [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) for the
canonical release state, gate history, evidence ceiling, and licensing note.

---

## Current status

**Deployed runtime: `v0.2.0`, released 2026-09-22. All four v0.2 gates are
complete.**

| File | Role | State |
|------|------|-------|
| `SPEC.md` | v0.2 meaning, behaviour, and the frozen content (§12) | All gates approved |
| `DESIGN_CONTRACT.md` | v0.2 form and limits | All gates approved |
| `data/atlas.json` | Deployed `v0.2.0` content, schema `0.2.0` | Released |
| `index.html` / `styles.css` / `app.js` | Deployed `v0.2.0` runtime | Released |
| `README.md` | Orientation (this file) | Current |

Any further change to the content model, design contract, or semantic payload
requires a new, separately gated proposal (see `PROJECT_STATUS.md` §5–§6) —
not an ad hoc edit.

> The interface footer shows `schema_version: "0.2.0"` directly, matching the
> dataset shape. (In the preserved `v0.1.1` release, the footer's
> `v0.1.0` was the dataset schema, not the release tag — see that release's
> own `PROJECT_STATUS.md` note for the distinction.)

---

## What the deployed `v0.2.0` runtime is

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

## Dataset shape (`v0.2.0`)

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

## Constraints on any future implementation

Read `DESIGN_CONTRACT.md` before writing a line. In brief:

- **Four files only:** `index.html`, `styles.css`, `app.js`, `data/atlas.json`
- **No** backend, auth, database, API, runtime AI, or persistence (including
  `localStorage`)
- **No** framework, library, bundler, package manager, or build step
- **No** external research or repository integration
- Inline **SVG** rendering, vanilla ES2020, a single stylesheet
- Colour is a semantic: only the six evidence input kinds carry colour, and
  every colour distinction is duplicated by a dash pattern, a glyph, and a
  text label
- Five type sizes, two weights, one uppercase context
- Five interactions — no pan, zoom, drag, filter, or search
- No looping or ambient motion; all transitions ≤ 400ms;
  `prefers-reduced-motion` yields instant repositioning
- WCAG 2.2 AA, fully keyboard operable, legible in greyscale
- Readable at 360px via a structured outline fallback

The one-additional-asset exception in `DESIGN_CONTRACT.md` §9.2 is **not
invoked** in v0.2. If a future implementer invokes it, the file and its
justification must be recorded here.

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

1. `README.md` — orientation (you are here)
2. `SPEC.md` — purpose, content model, modes, interaction, non-goals, gate
   history, and the frozen §12 semantic content
3. `DESIGN_CONTRACT.md` — visual philosophy, layout, type, colour, motion,
   accessibility, responsive behaviour, scope ceiling
4. `data/atlas.json` — the dataset, with a pinned source on every claim

The Gate 1 acceptance criteria (`SPEC.md` §10) and the contract checklist
(`DESIGN_CONTRACT.md` §10) are together sufficient to review the artifact
without re-reading the prose.
