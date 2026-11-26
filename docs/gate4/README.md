# Gate 4 — verification and release record (v0.3.0)

**State:** release candidate in review (PR #20, stacked on PR #19). Not
released: no tag, GitHub release or DOI exists for v0.3.0. The deployed site
is still `v0.2.1`.

**A2 is pending.** The maintainer's per-claim human verification of
scientific support (`SPEC.md` §12.10) has not been recorded. Nothing in this
record or in the Atlas presents it as done.

## 1. How each result was obtained

The results below come from four different kinds of check. They are not
interchangeable.

| Kind | What it is | Used for |
|---|---|---|
| **Automated** | Scripts with a pass/fail outcome: `tools/validate_atlas.py`; axe-core 4.10.2; horizontal-overflow measurement; link check; DOM structure checks; pixel comparison of figures with their sources | A1, A2 (mechanical part), A3, A5–A12, A15, A17–A19, part of A14 |
| **Scripted browser** | Playwright driving the installed Microsoft Edge: real key events for the keyboard run; Chromium emulation for `forced-colors: active` (light and dark system palettes) and `prefers-reduced-motion: reduce` | A14 (keyboard, forced colours, reduced motion) |
| **Simulated zoom** | 200 % page zoom reproduced by rendering at half the window width in CSS pixels with device pixel ratio 2 (1280 → 640 and 1440 → 720 CSS px), the same layout conditions Chromium uses for 200 % zoom; 200 % text-only zoom reproduced by setting the root font size to 200 %. The browser zoom control itself was not operated. | A14 (resize text, reflow) |
| **Manual (human)** | A person checks by hand | **None for accessibility in this gate.** No screen-reader session and no hand-operated zoom. The visual review of screenshots and print output was done by Claude Code (AI), not by a person. The scientific human verification (§12.10) is also outstanding. |

Run date: 2026-11-25/26, at PR #20 head `5e70814` (Gate 3 head `4702051`).

## 2. Acceptance criteria (`SPEC.md` §10)

| # | Criterion (short) | Result | Kind | Evidence |
|---|---|---|---|---|
| A1 | Exactly the seven §3.1 items, none of §3.2 | **Pass** | Automated | Validator; dataset has 7 items; no CHALUS record |
| A2 | Validator passes **and** Gate 2 records human verification | **Pending** | Automated + human | Validator: 0 errors (I1–I13, I15–I18). Human verification (§12.10): **not recorded** |
| A3 | §7 order for documented research | **Pass** | Automated | Rendered section headings of all four documented-research dossiers follow §7 |
| A4 | HATI pilot and extension are separate | **Pass** | Automated | Two dossiers, separate results and outputs |
| A5 | Output type, editorial status and identifier as three facts | **Pass** | Automated | Type / Review / ID rows on all 5 outputs |
| A6 | Plates show source, licence/attribution, CRS, simplification, "Not for measurement" | **Pass** | Automated | All 3 plates, plus a "Changes" row and the CC BY 4.0 licence URI |
| A7 | Figures show caption, pinned source, licence, alt | **Pass** | Automated + AI visual | 5 figures; pixel comparison with the deposited PDF pages and the source PNG; captions checked against the preprint (p. 21) |
| A8 | No relation between items; no connector | **Pass** | Automated | 0 relationships; 0 connector graphics |
| A9 | No ranking; explorer filters without reordering | **Pass** | Automated | Filtered order matches dataset order |
| A10 | Outbound links declared, opened only on activation | **Pass** | Automated | 61 links on 17 routes: 0 undeclared; all new-tab with an accessible "(opens in a new tab)" |
| A11 | Zero third-party requests | **Pass** | Automated | Request logs on all routes: local origin only |
| A12 | Every route deep-linkable and survives reload | **Pass** | Automated | 19 routes loaded fresh and reloaded; FCP ≤ 196 ms locally |
| A13 | Light/dark follow the system; print complete | **Pass** | Automated + AI visual | Dark sweep; headless print-to-PDF of a dossier reviewed |
| A14 | WCAG 2.2 AA | **Pass (automated, scripted and simulated checks only)** | Automated, scripted, simulated | axe: 0 violations at 360/390/768/1024/1440 px, dark, simulated 200 % zoom, 200 % text, forced colours. Keyboard: all controls reachable with a 2 px ring, no traps. Reduced motion honoured. **Not done: manual screen-reader and hand-operated zoom checks.** |
| A15 | No horizontal page scroll ≥ 360 px | **Pass** | Automated | 0 overflow on all routes and widths, including simulated 200 % zoom |
| A16 | `DESIGN_CONTRACT.md` checklist | **Pass, with one exception accepted by the maintainer** | Automated + AI visual | Exception: inline `[n]` citations are 24 × 24 px (§3) |
| A17 | Link check | **Pass** | Automated | 24 URLs; the PNSG GeoJSON page needed one retry (200) |
| A18 | Tags `v0.1.0`–`v0.2.1` untouched | **Pass** | Automated | Remote tags at the recorded commits |
| A19 | Notice and provenance footer on every view | **Pass** | Automated | Present on all views (the notice was added to the footer at Gate 4) |
| A20 | Licence presentation matches D4 status | **Pass** | Automated + AI visual | Approved licences in the footer, About, `meta.license`, `LICENSE`, `LICENSE-CONTENT.md` and `CITATION.cff`; third-party licences next to figures and plates |

## 3. Proposed exception to the contract checklist (A16)

`DESIGN_CONTRACT.md` §6 requires every interactive target to be at least
44 × 44 px. All targets meet it except the inline citation markers `[n]`.
They sit inside sentences, so a 44 px box would overlap the lines above and
below and the neighbouring marker. They have a 24 × 24 px hit area, which
meets WCAG 2.2 AA (2.5.8, Target Size (Minimum)). **Accepted by the maintainer on 2026-11-26 (§4).**

## 4. Decision record

Approved by the maintainer on 2026-11-26, in the Gate 4 session, in reply to
an explicit approval question. The `gate-approved` label at merge remains the
formal governance record.

| # | Decision | Proposed | Status |
|---|---|---|---|
| D4-a | Licence for original code | MIT | **Approved**; `LICENSE` |
| D4-b | Licence for original data and text | CC BY 4.0, with all exclusions in `LICENCE_REVIEW.md` §3 | **Approved**; `LICENSE-CONTENT.md` |
| D4-c | Verbatim quotations | Keep the original licensing of their sources (excluded from CC BY) | **Approved** |
| D4-d | OAPN geometry | Add a non-endorsement notice to the PNSG plate caption | **Approved**; shown on Plate 1 |
| A-Q1 | HATI route geometry | Keep excluded | **Approved: stays excluded**; no file, hash or plate |
| A16 | Inline citation targets | Accept the 24 × 24 px exception (§3) | **Approved** |
| DOI | Persistent identifier | Defer until the final deployment is verified | **Approved: deferred** |
| A2 | Human scientific verification (§12.10) | — | **Pending: the maintainer completes it** |

## 5. Release integration sequence

Each step is the maintainer's action and needs the stated authorisation.
Nobody else merges, labels, tags or publishes.

1. **Merge PR #20 into `impl/v0.3-gate3`**, with the maintainer's approval (the
   §4 decisions are approved; the merge itself is the maintainer's action).
2. **Verify the combined PR #19 against `main`**: the diff now includes the
   Gate 4 commits; CI must show "Mechanical validation" passing. "Enforce
   governance gate" stays red until `gate-approved` is applied.
3. **Merge PR #19 into `main`**, only after final release authorisation
   (`gate-approved` applied by the maintainer). This publishes v0.3.0 on
   GitHub Pages, which serves `main`.
4. **Verify GitHub Pages**: the deployed site loads, shows v0.3.0, makes
   same-origin requests only, and every route works.
5. **Create the `v0.3.0` tag and GitHub release**, only with explicit
   authorisation. Then add `date-released` to `CITATION.cff`. A DOI, if any,
   follows only after step 4 and with authorisation.

## 6. Genuine remaining blockers

- **A2**: the maintainer's §12.10 human verification.
- **Release authorisation** for steps 1, 3 and 5 (with `gate-approved`).
- After step 5: `date-released` in `CITATION.cff`; a DOI only if then
  authorised.

Everything else needed for the release candidate is in place.

## 7. Release-candidate screenshots (`screenshots/`)

Taken at the final Gate 4 commit from a local static server, in headless
Edge at 1440 px. Gate 3 screenshots are in `docs/gate3/screenshots/`.

| File | Shows |
|---|---|
| `rc-overview.jpg` | Overview, with the plate-geometry credit under the plate strip |
| `rc-plate1-caption-oapn.jpg` | Plate 1 (PNSG): OAPN attribution, reuse terms, non-endorsement notice (D4-d), changes |
| `rc-plate2-caption-ccby.jpg` | Plate 2 caption: CC BY 4.0 with licence URI, Ayuntamiento attribution, changes |
| `rc-figure-credit.jpg` | Figure HATI-P·1: caption, credit with OSM notice, pinned source, CC BY 4.0 with URI |
| `rc-about-licences.jpg` | About § 6: approved licences and the third-party rule |
| `rc-footer.jpg` | Footer on every view: licences, non-integration notice, provenance statement, §12.10 status |
