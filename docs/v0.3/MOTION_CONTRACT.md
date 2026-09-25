# MOTION_CONTRACT.md — Spatial Intelligence Atlas v0.3 (experimental)

Every animation in this prototype must answer, in writing, in this
document, before it is built: **what information becomes easier to
understand because this moves?** An entry with no answer in the "why it
moves" column does not ship.

---

## 1. Complete inventory of motion in v0.3

| # | Trigger | What moves | Why it moves | Duration | Properties |
|---|---|---|---|---|---|
| 1 | Selecting a case/instrument from Overview | **Screen-level cross-fade, honestly described:** the whole Overview screen fades out while translating down 8px; the whole Case reader fades in while translating up from 8px below its resting position. No element morphs or travels between the two screens — this is not a shared-element/identity transition, and an earlier draft of this document described it as one. That was wrong and is corrected here to match what `app.js`'s `crossFade()` actually does. | Signals cause-and-effect (this screen change was caused by the click) and gives the two screens a consistent spatial relationship — Case readers consistently arrive "from below," Overview consistently arrives "from above" — without claiming a continuity guarantee (e.g. "you can see your selection carry over") the implementation does not provide. The Case reader's own heading, set from the clicked entity's label the instant `renderCase()` runs, is what actually confirms *which* entity opened — not the motion. | ≤ 400ms | `opacity`, `transform` |
| 2 | Returning to Overview | Reverse of #1 — same screen-level cross-fade, same honesty correction | Same reasoning, reversed — confirms the reader is back on a different screen, not that anything continues visually between them | ≤ 400ms | `opacity`, `transform` |
| 3 | Expanding an evidence record's full basis quotation | **Instant — not animated.** The quotation appears or disappears in the same frame as the click/keypress; only the summary's visible text swaps ("Full basis" ↔ "Hide full basis"), via CSS attribute selectors, not a transition. | This was originally specified as an animated reveal. It is deliberately downgraded to instant here because the implementation uses a native `<details>`/`<summary>` element specifically so the browser — not custom script — governs whether the collapsed content is exposed to assistive technology and the tab order. Animating a `<details>` element's open/close state reliably across browsers, while it is also changing what is and isn't in the accessibility tree, is not a solved problem without JS hacks that reintroduce exactly the AT-exposure risk this choice exists to avoid. Semantic correctness wins over motion here, per instruction, not by default. | 0ms | — |
| 4 | Previous/next navigation within a case reader | Cross-fade between case readers | Signals "this is a different document," without implying a filmstrip or sequence between independent entities (explicitly not a slide/push transition, which would read as "next chapter") | ≤ 240ms | `opacity` only |
| 5 | Focus ring appearing on an element | Nothing animates; the ring is present or absent | A focus ring that fades in is a focus ring that is briefly invisible — never acceptable | 0ms | — |

That is the entire motion budget. No sixth entry. Item #3 is listed for
completeness even though it has no duration — the inventory's job is to
account for every state change a reader can trigger, not only the animated
ones.

---

## 2. Why the basis disclosure (#3) is instant, not animated

An earlier draft of this prototype animated the basis-quotation reveal with
`opacity`/`transform: scaleY`, driven by a custom button and a hand-rolled
`data-open` attribute. That version had two problems: first, it kept the
collapsed quotation in the DOM at all times (`height: 0; overflow: hidden`)
so a screen reader's virtual cursor or "read all" mode could still reach
text a sighted user could not see — the reviewer's finding #3 was correct.
Second, `DESIGN_CONTRACT.md` §6.2 already forbids animating `height` for
performance reasons, and the scaleY substitute was itself a workaround for
that rule, not a clean solution to it.

The fix is the native `<details>`/`<summary>` element (§7 of
`DESIGN_CONTRACT_PROPOSAL.md`, item 4): the browser removes closed content
from the accessibility tree and tab order by default, with no custom ARIA
and no risk of the two staying out of sync. The tradeoff, accepted
deliberately: a native `<details>` element's open/close transition is not
reliably animatable across browsers without reintroducing custom
open-state tracking — the exact hack being removed. So the reveal is
instant. This is not a limitation quietly accepted; it is the direct
consequence of prioritising "collapsed text is actually hidden from
assistive technology" over "the reveal has a transition," which is the
priority order the reviewer asked for, not an incidental corner cut.

---

## 3. Explicitly rejected motion, and why

| Rejected | Why |
|---|---|
| Auto-rotating or auto-advancing anything | No autoplay anywhere in this project, ever — matches `DESIGN_CONTRACT.md` §6.2 and the brief §11/§29. There is nothing to rotate in v0.3 (no globe), so this is a restated principle, not a new decision. |
| Entrance animation on initial page load | Brief §11 forbids it explicitly; first paint should show final state immediately, not animate into existence |
| Parallax on scroll | Forbidden by brief §11; also meaningless in a single-column document with no depth metaphor |
| Scroll-triggered reveal of case-reader sections | Considered for the "evidence appears as you scroll" pattern common in editorial sites, and rejected: it would animate content the reader is actively trying to read, adding latency to comprehension rather than removing it — the opposite of the brief's test in §11 |
| Staggered entrance of Overview rows | Forbidden outright by `DESIGN_CONTRACT.md` §6.1 ("staggered/sequenced animations: forbidden") and brief §11 ("staggered animation for spectacle") — carried forward without exception |
| Springy/bouncy easing on the case-reader transition | Spring physics is forbidden by `DESIGN_CONTRACT.md` §6.2; a research artifact opening a case document is not a moment for playful overshoot |
| Hover-triggered "lift" (shadow/scale) on Overview rows | Drop shadows for depth are forbidden by `DESIGN_CONTRACT.md` §1.3 ("generic decoration"); a scale-on-hover cue is a SaaS-card affordance the brief's register list (§8) explicitly excludes |
| A loading skeleton/shimmer while `data/atlas.json` fetches | Explicitly forbidden by `DESIGN_CONTRACT.md` §1.3 ("skeleton shimmer loaders"); the fetch is local and near-instant, and the fallback for a genuine failure is the static error state in `DESIGN_CONTRACT_PROPOSAL.md` §13, not a spinner |
| Any transition on the evidence-glyph colour swatches | Colour is semantic, not decorative (§1.2 of the v0.2 contract, carried forward); nothing about colour should ever animate, because an animated colour reads as a status change, and input-kind is not a status |

---

## 4. Reduced motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
```

Identical rule to `DESIGN_CONTRACT.md` §6.3, carried forward without
modification. Under reduced motion:

- Overview → Case reader (#1) and the reverse (#2) become instant swaps —
  no cross-fade substitute, no "gentler" version.
- Evidence-record expansion (#3) is already instant regardless of this
  setting — it has nothing left to reduce.
- Previous/next navigation (#4) becomes an instant document swap.

This is a complete equivalent experience, not a degraded one: every state
reachable with motion is reachable, with identical final layout, without
it. `VERIFICATION_REPORT.md` records whether this was actually exercised in
a browser with the media feature forced.

---

## 5. Micro-interaction notes (brief §12)

- **Selecting a case:** the row's focus ring and hover brightening (§7 of
  `DESIGN_CONTRACT_PROPOSAL.md`) are the only pre-selection feedback;
  selection itself is confirmed by the transition in inventory item #1, not
  by a click "flash."
- **Switching between case readers:** confirmed by inventory item #4 plus
  an updated "N of 4" text and document title — never by a loading
  indicator, since the transition and the data are both already local.
- **Opening a source:** no in-app feedback beyond the browser's own new-tab
  behavior; the application does not preview, prefetch, or validate the
  destination (`SPEC_PROPOSAL.md` §9), so there is nothing for it to
  animate.
- **Resetting to Overview:** identical treatment to any other Overview
  return (#2) — there is no separate "reset" affordance in v0.3 because
  there is no accumulated filter/selection state to clear beyond "which
  case is open," which the browser back-equivalent control already handles.
- **Keyboard navigation:** `Tab` order is document order (no coordinate
  reordering to animate around, unlike v0.2's SVG focus-order problem);
  `Esc` behavior is specified in `DESIGN_CONTRACT_PROPOSAL.md` §11 and
  triggers whichever of #2 (close an open case reader, animated) or #3
  (close an open disclosure, instant) applies — identical to what pressing
  the equivalent pointer control would do, in both cases.
