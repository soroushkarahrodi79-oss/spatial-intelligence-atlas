# Gate 3 — implementation review record (v0.3.0)

Evidence for the Gate 3 pull request (branch `impl/v0.3-gate3`). It records
what was checked and how. It is **not** a release record and does not change
the state of Gate 2: per-claim human verification of scientific support
(`SPEC.md` §12.10) and approval A-Q1 are still pending.

## Checks run on 2026-11-25

| Check | Method | Result |
|---|---|---|
| Mechanical metadata validation (I1–I13, I15–I18, file budget) | `python tools/validate_atlas.py` | Pass, 0 errors |
| I18 pin comparison | exact equality with the frozen `SPEC.md` §12.1 text (Markdown inline code removed) | Pass |
| Geometry hashes across platforms | `.gitattributes` `-text`; fresh clone with `core.autocrlf=true`; blob and working-tree SHA-256 compared with `geometry.sha256` | Match for all three files |
| Link check (A17) | `python tools/validate_atlas.py --links` | 24 URLs; 23 answered first time, the PNSG GeoJSON blob page dropped once and returned 200 on retry |
| Frozen content ↔ dataset | every finding, uncertainty, verdict, outcome statement, claim ceiling, evidence statement and limitation, question and summary compared with `SPEC.md` §12 or `data/atlas.json` at `v0.2.1` | All verbatim except four list-to-prose reflows with unchanged wording (`o-net-modify` statement and ceiling, `ev-net-facilities` limitation without its inline source marker, `p-snto` summary) |
| Counts | dataset vs §12 | 7 items, 15 evidence, 14 findings, 5 outcomes, 5 outputs, 5 figures, 23 sources |
| Accessibility (A14, automated part) | axe-core 4.10.2 on 19 routes (all views, all 7 dossiers, 3 plates, a filtered explorer, not-found) at 360, 390, 768, 1024 and 1440 px, light; 1440 px dark | 0 violations |
| Horizontal scroll (A15) | `scrollWidth − clientWidth` on the same routes and widths | 0 everywhere |
| Outbound links (I6, A10) | every `a[href^="http"]` on 17 routes compared with declared source/output URLs | 61 links, 0 undeclared, all `target="_blank" rel="noopener noreferrer"` with "(opens in a new tab)" |
| Same-origin requests (A11) | Resource Timing origins | only the local origin |
| Interactions | filters → route query; reload restores facets; order kept; empty state and Clear filters; live-region counts; route change focuses `<h1>`, sets title, resets scroll; `[n]` and skip link move focus without changing the route | All as specified |
| Print (A13) | headless Edge print-to-PDF of a dossier | rail after the reading column, verbatim bases open, URLs printed, kind dashes and glyphs kept |

Not covered by these checks: forced-colours and 200 % zoom were reviewed in
the stylesheet and by the narrow-width runs, not with a screen reader or a
forced-colours session; the keyboard pass was scripted, not manual.

## Screenshots (`screenshots/`)

Captured from a local static server; the "How to cite" URL therefore shows
`localhost`. The 390 px capture comes from the in-app browser at 390 px.

| File | View |
|---|---|
| `01-overview.webp` | Overview, 1440 px |
| `02-research-index.webp` | Research index |
| `03-dossier-network.webp` | Dossier — Pedestrian Network Accessibility Pilot |
| `04-dossier-hati-pilot.webp` | Dossier — HATI-Madrid pilot, with the four preprint figures |
| `05-atlas.webp` | Atlas index, plates and text-only territories |
| `06-plate-pnsg.webp` | Plate 1 — PNSG, with caption block |
| `07-evidence-filtered.webp` | Evidence Explorer, `?kind=acquired&kind=derived&item=r-snto-pnsg` |
| `08-outputs.webp` | Publications & Datasets |
| `09-timeline.webp` | Timeline |
| `10-dossier-pnsg-dark.webp` | Dossier — SNTO PNSG, dark theme |
| `11-dossier-mobile-390.webp` | Dossier — HATI pedestrian extension, 390 px |
| `12-platform-lens.webp` | Platform dossier — Madrid Urban Evidence Lens |
