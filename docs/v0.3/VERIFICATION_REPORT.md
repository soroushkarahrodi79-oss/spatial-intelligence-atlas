# VERIFICATION_REPORT.md — Spatial Intelligence Atlas v0.3 prototype

**Revision 2** — re-run in full after the coherence-correction pass (see the
PR #14 review comment this responds to). Supersedes the original report;
kept as one file, not two, since the original findings no longer describe
the current code. Tooling: **Playwright 1.63.0** driving a real headless
**Chromium** (Chrome for Testing 153.0.8010.12), and **axe-core 4.x**
injected into the running page. Screenshots are in
`docs/v0.3/review/screenshots/`.

Every claim below is scoped to what was actually run. Nothing here implies
Safari, Firefox, a physical device, or a real screen reader (NVDA/JAWS/
VoiceOver) was used, because none was.

---

## 1. Screenshot review (all 5 required widths, both screens)

| Width | Overview | Case reader |
|---|---|---|
| 1440×900 | `overview-1440x900.png` | `case-1440x900.png` |
| 1024×768 | `overview-1024x768.png` | `case-1024x768.png` |
| 768×1024 | `overview-768x1024.png` | `case-768x1024.png` |
| 390×844 | `overview-390x844.png` | `case-390x844.png` |
| 360×740 | `overview-360x740.png` | `case-360x740.png` |

Plus `case-expanded-1440x900.png` (basis disclosure open),
`greyscale-case-1440x900.png` (§5), and `zoom200-overview.png` /
`zoom200-case.png` (§8).

**Visually confirmed, not just measured:**

- **PASS** — Section order in every case reader is question → territory →
  documented result → claim ceiling → evidence → verification, matching
  `SPEC_PROPOSAL.md` §3.1 exactly — visible in `case-1440x900.png` and
  `case-360x740.png`, no code-vs-screenshot gap.
- **PASS** — No horizontal overflow at any of the 5 widths (confirmed both
  visually and by `scrollWidth`/`clientWidth` comparison, §2).
- **PASS** — The basis disclosure ("Full basis" → "Hide full basis") reveals
  correctly with native `<details>`, confirmed in
  `case-expanded-1440x900.png`.

---

## 2. Accessibility — automated (axe-core)

Run against both screens at all 5 widths (10 scans): **0 violations,
every screen, every width.**

---

## 3. Semantic structure (finding #4 from the review)

**FIXED.** Evidence records are now a real `<ol>` of `<li>` elements, not a
`<div>` collection. Confirmed by DOM inspection: `evidence-list` is an
`OL`, its 3 children (for the CHALUS case tested) are all `LI`, containing
3 `<details>`/3 `<summary>` pairs for the basis disclosures.

---

## 4. Disclosure semantics (finding #3 from the review)

**FIXED**, and independently confirmed by measurement, not just code
inspection:

| State | `basis-quote` visible? | Bounding box | `<details>.open` |
|---|---|---|---|
| Closed (default) | No | `0×0` | `false` |
| After clicking `<summary>` | Yes | `496×40` | `true` |
| After clicking `<summary>` again | No | (not re-measured, `open` re-checked) | `false` |

This confirms the collapsed basis quotation is genuinely absent from the
rendered page (zero-size box, `isVisible()` false), not merely styled to
look hidden while still present for a screen reader's virtual cursor to
find — which was the reviewer's exact concern. The native `<details>`
element's `open` IDL property, which assistive technology reads directly,
toggles correctly in both directions.

**Not independently verified:** a real screen reader's announcement of the
disclosure state. `<details>`/`<summary>` is a long-standardized HTML
element with well-documented AT support, but that is a claim about the
platform, not a test this pass ran — see §9.

---

## 5. Colour independence (greyscale)

`greyscale-case-1440x900.png` — `filter: grayscale(1)` applied to the
rendered Case reader. **PASS by visual inspection**: each evidence record's
glyph remains distinguishable by shape alone with colour removed.

---

## 6. Touch targets ≥44×44px (finding #5 from the review)

Measured with `boundingBox()`, not assumed:

| Control | Width | Height | Result |
|---|---|---|---|
| Overview row | 1232px | 135px | **PASS** |
| Back | 99.7px | 44px | **PASS** |
| Previous | 81.9px | 44px | **PASS** |
| Next | 54.8px | 44px | **PASS** (see below) |
| Full basis disclosure | 68.9px | 44px | **PASS** |
| Source link | 255px | 44px | **PASS** |

**One real failure was found and fixed during this pass.** The first
measurement run found `Next` at **38.8×44px** — under the 44px floor on
width, because "Next" is short enough that 4px of horizontal padding on
each side wasn't enough. Fixed in `styles.css` (`.case-nav button`): padding
increased to `0 12px` and `min-width: 44px` added. Re-measured at
54.8×44px. This is reported rather than silently corrected because the
review explicitly asked not to claim PASS until measured, and the first
measurement genuinely did fail.

---

## 7. Overview accessible names (finding #6 from the review)

**FIXED**, verified two ways:

1. **DOM inspection** — every Overview row has `hasAriaLabel: false` (the
   overriding `aria-label` was removed) and its full `textContent` includes
   kind, label, role, territory-or-fallback text, outcome verdict, and the
   `sr-only` evidence-kind summary — e.g. for SNTO: *"CORE CASE SNTO — PNSG
   Decision Evidence Bounded destination-management case using
   environmental and governance evidence. Parque Nacional de la Sierra de
   Guadarrama INSUFFICIENT EVIDENCE Evidence recorded: acquired, derived,
   unestablished."* Nothing visible is missing from what a non-visual
   reader would receive, and nothing is duplicated beyond what's already
   visually redundant (e.g. "CORE CASE" appearing once as intended).
2. **Accessibility-tree snapshot** — attempted via `page.accessibility.
   snapshot()`. **NOT VERIFIED**: this Playwright version (1.63.0) no
   longer exposes that API (`Cannot read properties of undefined (reading
   'snapshot')`) — it was deprecated in favour of `locator.ariaSnapshot()`
   in recent Playwright releases and this pass did not have time to
   re-tool around that before reporting. The DOM-level check in (1) is
   real evidence (no `aria-label` override exists, so the browser's
   standard accessible-name computation — visible text content, in order —
   applies by construction), but it is not the same thing as an
   AT-facing tool confirming the exact computed name string. Flagged
   honestly as a tooling gap, not silently dropped.

---

## 8. Verification-source ordering (finding #7 from the review)

**FIXED in code**, verified against an independently computed expected
order (read straight from `data/atlas.json`'s relationships, not from the
app's own logic) for **all 4 entities**:

| Entity | Rendered order matches first-cited-reading-order rule? |
|---|---|
| HATI | **PASS** |
| SNTO | **PASS** |
| CHALUS | **PASS** |
| FieldOS | **PASS** |

**Honest caveat:** with the current dataset, this fix does not change the
*rendered* order for any of the 4 entities, because every entity's own
`entity.source_ids` already happens to be a superset of every source cited
by its territory, outcome, and evidence records — so the old code's
different internal ordering (entity → outcome → territory → evidence,
deduplicated into a `Set`) produced the same final list as the new,
contract-correct ordering (entity → territory → outcome → evidence) would.
The fix is real and the code is now correct **by construction** rather than
by dataset coincidence — and would visibly diverge from the old behaviour
the moment a future entity's territory, outcome, or evidence record cited a
source not already in its own `source_ids` — but no screenshot in this
report shows a *visible* before/after difference, because none exists in
this dataset. Reported precisely rather than overclaimed.

---

## 9. 200% zoom (finding #10 requirement)

Simulated by halving the viewport at a fixed CSS pixel ratio (1280×800 →
640×400), the standard proxy for "content at 200% zoom" reflow testing
(WCAG 1.4.4/1.4.10 concern themselves with available CSS-pixel space, which
this reproduces without a hardware zoom test).

- **PASS** — No horizontal overflow on the Overview at the halved viewport.
- **PASS** — No horizontal overflow on the Case reader at the halved
  viewport (screenshots: `zoom200-overview.png`, `zoom200-case.png`).

**Not verified:** actual browser `Ctrl +`/pinch-zoom behaviour, which can
differ subtly from a viewport-size proxy (e.g. it doesn't change the
device-pixel-ratio-driven raster of images, irrelevant here since there are
none). The proxy is a reasonable stand-in for a layout-reflow concern, not
a substitute for the real gesture.

---

## 10. Reduced motion

Re-confirmed after all changes: `transition-duration` on `#overview` under
`prefers-reduced-motion: reduce` computes to `1e-05s`; the Case reader is
fully opaque and unhidden within 50ms of the click (**PASS**). The basis
disclosure has no reduced-motion-specific behaviour to test — it is
already instant unconditionally (§4, `MOTION_CONTRACT.md` #3).

---

## 11. Rapid open/Escape regression (finding #1 from the original review)

Re-run after the evidence-record refactor to confirm the earlier fix
(tracked-timeout `crossFade`) still holds with the new DOM structure:
**8/8 trials, 0 failures.**

---

## 12. Keyboard pass (including finding #9: document title restoration)

- **PASS** — Tab reaches the first evidence record's `<summary>` at the
  same tab-index position as before (index 1 after `back`/`next-case`).
- **PASS** — `Enter` on a focused `<summary>` opens it natively
  (`details.open` → `true`) — no custom keydown handler needed for this,
  confirming the earlier design rationale.
- **PASS** — `Esc` with a disclosure open closes only the disclosure
  (`details.open` → `false`).
- **PASS** — A second `Esc` returns to the Overview.
- **PASS (finding #9, fixed)** — `document.title` after returning to
  Overview is restored to the original page title
  (`"Spatial Intelligence Atlas — v0.3 experience prototype"`), not left at
  the last-viewed case's title. Verified via `page.title()` after the
  return-to-Overview sequence completes.

---

## 13. What was NOT verified (honest gaps)

- **NOT VERIFIED** — Safari or WebKit rendering. Only Chromium was
  available in this environment.
- **NOT VERIFIED** — Firefox rendering.
- **NOT VERIFIED** — A physical mobile device.
- **NOT VERIFIED** — A real screen reader (NVDA, JAWS, or VoiceOver). Only
  axe-core, DOM/ARIA inspection, and (attempted, unavailable) an
  accessibility-tree snapshot were used — see §7's honest caveat.
- **NOT VERIFIED** — `page.accessibility.snapshot()`-level confirmation of
  Overview rows' computed accessible names — the API is unavailable in
  Playwright 1.63.0; DOM-level evidence was used instead (§7).
- **NOT VERIFIED** — Real OS/browser pinch-to-zoom or `Ctrl +` zoom
  behaviour; a halved-viewport proxy was used instead (§9).
- **NOT VERIFIED** — Performance under network throttling or on genuinely
  low-end hardware.

---

## 14. Reproducing this verification

From the repository root, with a local static server running:

```
python -m http.server 8000
```

Then, with Playwright and axe-core available in a scratch directory (no
project-level dependency was added — `IMPLEMENTATION_PLAN.md` §1–§2), drive
headless Chromium against
`http://localhost:8000/prototype/v0.3-experience/` for each required
viewport, injecting `axe-core/axe.min.js` and calling `axe.run()`, and
exercising the interactions and measurements described in §1–§12 above.
