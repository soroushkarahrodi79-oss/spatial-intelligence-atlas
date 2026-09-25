# MOTION_CONTRACT.md — Spatial Intelligence Atlas v0.3 (experimental)

Every animation in this prototype must answer, in writing, in this
document, before it is built: **what information becomes easier to
understand because this moves?** An entry with no answer in the "why it
moves" column does not ship.

---

## 1. Complete inventory of motion in v0.3

| # | Trigger | What moves | Why it moves | Duration | Properties |
|---|---|---|---|---|---|
| 1 | Selecting a case/instrument from Overview | The selected row's identity block (label, kind marker) transitions into the case reader's header position; the rest of the page cross-fades | Preserves the reader's sense of *which* entity they just opened — spatial continuity between "the row I clicked" and "the document I'm now reading" is the one piece of orientation state worth animating, per the brief's own motion criteria (§11: prefer continuity) | ≤ 400ms | `opacity`, `transform` |
| 2 | Returning to Overview | Reverse of #1 | Same reasoning, reversed — confirms the reader is back where they started, not on a new unrelated screen | ≤ 400ms | `opacity`, `transform` |
| 3 | Expanding an evidence record's full basis quotation | The quotation block reveals; the disclosure affordance's text changes ("Full basis" → "Hide full basis") | Makes clear that new content appeared as a direct result of the user's own action, not a layout jump with no cause | ≤ 240ms | `opacity`, `transform` (`transform-origin: top`, no height animation — see §2) |
| 4 | Previous/next navigation within a case reader | Cross-fade between case readers | Signals "this is a different document," without implying a filmstrip or sequence between independent entities (explicitly not a slide/push transition, which would read as "next chapter") | ≤ 240ms | `opacity` only |
| 5 | Focus ring appearing on an element | Nothing animates; the ring is present or absent | A focus ring that fades in is a focus ring that is briefly invisible — never acceptable | 0ms | — |

That is the entire motion budget. No sixth entry.

---

## 2. Why height is never animated

Two entries above (#3) reveal new content without animating `height`,
`max-height`, or `grid-template-rows`. This is deliberate: animating layout
properties causes reflow on every frame, is the single most common source
of jank on lower-end devices, and is explicitly forbidden by
`DESIGN_CONTRACT.md` §6.2 ("No transitions on `width`, `height`, `top`,
`left`, `margin`, or `filter`") — a v0.2 rule this proposal carries forward
without exception. The v0.3 implementation uses a fixed-content technique
(the disclosure region is always in the layout; `opacity`/`transform:
scaleY` combined with `visibility` toggling, or a CSS `interpolate-size`
progressive enhancement where supported, falling back to instant reveal) so
the animated properties stay within `opacity`/`transform` in every browser.

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
- Evidence-record expansion (#3) becomes an instant reveal.
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
  triggers whichever of #2/#3 is applicable, with identical timing to its
  pointer-triggered equivalent.
