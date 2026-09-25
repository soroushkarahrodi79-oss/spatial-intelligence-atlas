# VERIFICATION_REPORT.md — Spatial Intelligence Atlas v0.3 prototype

Testing performed against `prototype/v0.3-experience/` on branch
`experiment/atlas-v0.3-experience`. Tooling used: **Playwright 1.63.0**
driving a real headless **Chromium** (Chrome for Testing 153.0.8010.12), and
**axe-core 4.x** injected into the running page. Screenshots are in
`docs/v0.3/review/screenshots/`. The full machine-readable run (axe results,
keyboard-pass log, reduced-motion measurements) is reproducible via the
script described in §6.

Every claim below is scoped to what was actually run. Nothing here implies
Safari, Firefox, a physical device, or a real screen reader (NVDA/JAWS/
VoiceOver) was used, because none was.

---

## 1. Screenshot review

Captured at all five required widths, for both the Overview screen and an
open Case reader (CHALUS — 3 evidence records, a territory, and a
claim ceiling, chosen as the highest-content case for a stress-test of the
layout):

| Width | Overview | Case reader |
|---|---|---|
| 1440×900 | `review/screenshots/overview-1440x900.png` | `review/screenshots/case-1440x900.png` |
| 1024×768 | `review/screenshots/overview-1024x768.png` | `review/screenshots/case-1024x768.png` |
| 768×1024 | `review/screenshots/overview-768x1024.png` | `review/screenshots/case-768x1024.png` |
| 390×844 | `review/screenshots/overview-390x844.png` | `review/screenshots/case-390x844.png` |
| 360×740 | `review/screenshots/overview-360x740.png` | `review/screenshots/case-360x740.png` |

Also captured: `case-expanded-1440x900.png` (an evidence record's "Full
basis" disclosure open, confirming the progressive-disclosure motion
inventory item #3) and `greyscale-case-1440x900.png` (§4).

**Visually reviewed, not just measured** (per the brief's instruction not
to rely on DOM measurements alone):

- **PASS** — No horizontal overflow at any of the five widths.
- **PASS** — Claim ceiling visibly appears directly after the documented
  result, before the verification rail, at every width — the binding change
  from `SPEC_PROPOSAL.md` §3.3 is confirmed in the rendered page, not just
  in code.
- **PASS** — FieldOS's row in the Overview is visually discontinuous from
  the three case rows (dashed top rule, extra spacing) at 1440px and at
  360px.
- **PASS** — At ≥1024px the verification rail sits beside the reading
  column; at ≤1023px it moves in-flow below it, confirmed in the
  768×1024 and 390×844 screenshots — this is the same document reflowing,
  not a second representation (`DESIGN_CONTRACT_PROPOSAL.md` §9).
- **PASS** — Long labels (e.g. "Western Mazandaran — Chalus, Nowshahr and
  Kelardasht", the longest territory string in the dataset) wrap cleanly at
  360px without truncation.
- **PASS** — Evidence-record disclosure ("Full basis" → "Hide full basis")
  visibly reveals the verbatim quotation, indented with a left rule,
  matching `DESIGN_CONTRACT_PROPOSAL.md` §7.

## 2. Accessibility — automated (axe-core)

axe-core was run against both screens at all five widths (10 scans total).

| Screen | 1440×900 | 1024×768 | 768×1024 | 390×844 | 360×740 |
|---|---|---|---|---|---|
| Overview | 0 violations | 0 violations | 0 violations | 0 violations | 0 violations |
| Case reader | 0 violations | 0 violations | 0 violations | 0 violations | 0 violations |

**One real violation was found and fixed during this pass, not before:**
axe initially flagged `region` ("all page content should be contained by
landmarks", moderate impact) on every screen/width — the
`.experiment-flag` banner sat outside any landmark, as a direct child of
`<body>` before `<header>`. Fixed by moving it inside `<header>` as the
first element (`index.html`, `styles.css` adjusted so it still renders as a
full-width banner row). Re-run confirmed zero violations afterward. This is
recorded here rather than silently fixed, per the brief's instruction to
report what was actually tested, including what failed first.

**PASS**, with the standard caveat that axe-core detects a meaningful
subset of WCAG failures, not all of them (contrast math, focus order, and
name/role/value correctness were separately checked manually, §3).

## 3. Accessibility — manual keyboard pass

Performed at 1440×900, scripted through Playwright's keyboard API (a real
keyboard-event pass, not a simulation of intent):

- **PASS** — `Tab` from page load cycles: 3 case rows → the FieldOS row →
  the footer source link → off the end of the document. Document order,
  no synthetic reordering, matching `DESIGN_CONTRACT_PROPOSAL.md` §11.
- **PASS** — Focus ring on a focused Overview row computed as `2px solid
  rgb(232, 230, 227)` (`--ink`), matching the 2px/achromatic requirement.
- **PASS** — `Enter` on a focused Overview row opens the Case reader (native
  `<button>` semantics — no custom keydown handler was needed for this
  interaction, which is itself a small piece of evidence for the
  document-native accessibility posture argued in `UX_DIRECTION.md` §3).
- **PASS** — Tabbing into a Case reader reaches an evidence record's "Full
  basis" disclosure button in normal document order; `Enter` toggles it
  open (`aria-expanded` flips `false` → `true`).
- **PASS** — `Esc` with a disclosure open collapses only the disclosure
  (confirmed: `data-open` flips back to `false`, Case reader stays open).
  A second `Esc` then returns to the Overview. This two-step escape
  behaviour was specified in `DESIGN_CONTRACT_PROPOSAL.md` §11 and is
  confirmed working as specified.

### 3.1 A real bug found and fixed by this testing pass

The first full run of this keyboard sequence **failed**: pressing `Esc`
once, immediately after opening a Case reader and toggling a disclosure,
occasionally left the Overview screen hidden instead of visible. Root
cause: `crossFade()` relied on a `transitionend` listener to flip
`hidden` at the end of a screen transition; if a screen was re-triggered
(Overview → Case → Overview) faster than the prior transition's 320ms
duration, the earlier listener could fire *after* the later transition
had already run, re-hiding the wrong element. This is a plausible real
user action (open a case, immediately regret it, hit Escape), not only a
test artifact.

**Fix:** `crossFade()` now cancels any pending cleanup for both elements
involved at the start of every call (tracked via a `WeakMap` of pending
`setTimeout` handles) before starting a new transition, and uses a fixed
timeout matched to the CSS duration instead of `transitionend`. Re-run: **8
consecutive rapid open-then-immediate-Escape trials, 0 failures** (see
`app.js`, `TRANSITION_MS`/`pendingHide`). This is reported here in full
because a design-review pass that only ships the pretty result and hides
the bug it found would undercut the brief's own emphasis on verified,
not asserted, correctness.

## 4. Colour independence (greyscale)

`docs/v0.3/review/screenshots/greyscale-case-1440x900.png` — a full
`filter: grayscale(1)` applied to the rendered Case reader. **PASS by
visual inspection**: each evidence record's glyph (half-circle, ringed
circle, slashed circle, etc.) remains distinguishable by shape alone with
colour removed, matching `DESIGN_CONTRACT.md` §3.4's verification
requirement, carried forward unchanged into v0.3. This was a visual check,
not an automated contrast-simulation tool — recorded as a manual PASS, not
overstated as an automated one.

## 5. Reduced motion

Playwright's `page.emulateMedia({ reducedMotion: 'reduce' })` was used
(this forces the `prefers-reduced-motion: reduce` media feature at the
browser level — the same mechanism a real OS-level accessibility setting
triggers).

- **PASS** — Computed `transition-duration` on `#overview` under emulation:
  `1e-05s` (0.01ms), confirming the CSS override in `styles.css` applies.
- **PASS** — Opening a Case reader under emulation: the Case reader was
  fully opaque (`opacity: 1`) and unhidden within 50ms of the click,
  i.e. effectively instant, not a 320ms cross-fade.

## 6. What was NOT verified (honest gaps)

Per the brief's instruction to separate PASS / FAIL / NOT VERIFIED and
never imply broader coverage than was actually run:

- **NOT VERIFIED** — Safari or WebKit rendering. Only Chromium was
  available in this environment.
- **NOT VERIFIED** — Firefox rendering.
- **NOT VERIFIED** — A physical mobile device (touch-target size was
  checked by CSS rule and by visual inspection of screenshot geometry, not
  by an actual finger on actual glass).
- **NOT VERIFIED** — A real screen reader (NVDA, JAWS, or VoiceOver). Only
  axe-core's static analysis and manual keyboard-focus/ARIA-attribute
  inspection were performed; these catch a meaningful subset of screen-
  reader-relevant issues but are not a substitute for listening to one.
- **NOT VERIFIED** — Performance under network throttling or on genuinely
  low-end hardware. The performance budget in
  `DESIGN_CONTRACT_PROPOSAL.md` §14 (< 1s first contentful paint, zero
  dependencies) is architecturally true by construction (no library, no
  vendored asset, one small local JSON fetch) but was not measured with a
  profiler in this pass.
- **NOT VERIFIED** — Text resizing to 200% (`DESIGN_CONTRACT.md` §8.5's
  carried-forward requirement) — visually plausible given the `rem`-free
  but unitless-`px`-avoidant type scale and fluid layout, but not
  explicitly tested by forcing browser zoom.

## 7. Reproducing this verification

From the repository root, with a local static server running (the same
requirement as `README.md`'s "Running it locally"):

```
python -m http.server 8000
```

Then, with Playwright and axe-core available (`npm install playwright
axe-core` in a scratch directory is sufficient; no project-level
dependency was added to this repository — see
`IMPLEMENTATION_PLAN.md` §1–§2), drive a headless Chromium against
`http://localhost:8000/prototype/v0.3-experience/`, injecting
`axe-core/axe.min.js` and calling `axe.run()`, for each of the five
required viewport sizes. This is exactly what produced §1–§5 above.
