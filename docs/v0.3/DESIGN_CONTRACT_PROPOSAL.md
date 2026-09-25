# DESIGN_CONTRACT_PROPOSAL.md — Spatial Intelligence Atlas v0.3 (experimental)

**This is NOT `DESIGN_CONTRACT.md`.** The v0.2.1 contract remains
authoritative for the deployed artifact. This document constrains the v0.3
experimental prototype only, for internal design consistency during
Phase 5. It has no governance force. Where this document is silent, the
v0.2.1 contract's underlying philosophy (§1) still applies: research-grade,
editorial, achromatic-by-default, colour as semantic only, hairline over
fill, nothing moves unless the user moved it.

---

## 1. Visual philosophy

Unchanged register from `DESIGN_CONTRACT.md` §1.1–§1.3: research-grade,
spatial, minimal, editorial, technical — a technical monograph, printed then
dimmed for the screen. All of §1.3's forbidden registers (sci-fi/cyberpunk,
SaaS dashboard, game, generic decoration, typographic decoration) carry
forward verbatim. The one addition: because v0.3 has no graph canvas, "the
graph is the page" (§1.2, third rule) is replaced by **"the reading column
is the page"** — the case-reader's prose measure is the single largest
deliberate element; chrome (header, navigation, footer) remains subordinate.

---

## 2. Layout system

### 2.1 Grid

Unchanged: base spacing unit **8px**, all margins/padding/gaps multiples of
8, 4px permitted only for optical type alignment against a rule. Type set on
a 4px vertical rhythm.

### 2.2 Overview screen frame (≥1024px)

```
┌────────────────────────────────────────────────────────────────┐
│  HEADER RAIL   title · subtitle · non-integration notice        │
├────────────────────────────────────────────────────────────────┤
│  OVERVIEW LIST                                                  │
│  ── HATI ──────────────────────────────────────────────────     │
│     role · territory · outcome verdict                          │
│  ── SNTO ──────────────────────────────────────────────────     │
│  ── CHALUS ────────────────────────────────────────────────     │
│  ┄┄ FieldOS (SUPPORTING INSTRUMENT — visually discontinuous) ┄┄ │
├────────────────────────────────────────────────────────────────┤
│  PROVENANCE FOOTER + attribution line                           │
└────────────────────────────────────────────────────────────────┘
```

Outer page margin: 24px, unchanged from `DESIGN_CONTRACT.md` §2.2. FieldOS's
row is set off by a hairline gap of 32px (4× the 8px unit) and a dashed
top rule at 8% opacity — visually discontinuous from the three case rows,
never merely fourth-in-a-list.

### 2.3 Case reader frame (≥1024px)

```
┌────────────────────────────────────────────────────────────────┐
│  HEADER RAIL (compact) · ← Overview · "2 of 4"                  │
├───────────────────────────────────────┬──────────────────────┤
│  READING COLUMN (max-measure 68ch)     │  VERIFICATION RAIL    │
│  research question                     │  fixed 280px          │
│  territory                             │  hairline left        │
│  documented result                     │  every cited source,  │
│  claim ceiling (directly after result) │  deduplicated, in     │
│  evidence records (§4)                 │  first-cited reading  │
│                                         │  order (§12)          │
├───────────────────────────────────────┴──────────────────────┤
│  PROVENANCE FOOTER                                               │
└────────────────────────────────────────────────────────────────┘
```

Section order is `question → territory → result → claim ceiling →
evidence`, matching `SPEC_PROPOSAL.md` §3.1 exactly — the result and its
ceiling read before the itemised evidence, not after it.

The verification rail is **always present**, never a modal or accordion —
same non-negotiable v0.2 carried forward for the detail panel
(`DESIGN_CONTRACT.md` §2.2). It is not empty-state design because a case
reader is only ever opened for an entity that has sources.

### 2.4 No coordinate system

There is no `[0,1]` layout schema in v0.3 — nothing here is positioned by
data-driven coordinates, because there is no canvas. This retires
`DESIGN_CONTRACT.md` §2.3–§2.7 (deterministic coordinates, tier discipline,
node forms, corner radius as applied to nodes, edges) in full; §2.6's
corner-radius ceiling (max 2px, panel and controls only) is retained as a
document-chrome rule (§2.6 below).

### 2.5 Reading rhythm

- Section spacing inside a case reader: 48px between major sections
  (question / territory / result+ceiling / evidence — verification is a
  separate rail, not a section).
- Evidence records: 24px between records, 8px between a record's
  statement and its limitation.
- No section may be visually indistinguishable from body prose — every
  section (question, territory, evidence, result, claim ceiling) carries a
  `label`-step heading (§4.2), not just a paragraph break.

### 2.6 Corner radius

Unchanged ceiling: **2px maximum**, permitted only on the case-reader card
in Overview and any control (previous/next, expand). No pill shapes.

---

## 3. Colour

### 3.1 Base tokens — unchanged verbatim

`--bg` `#0F1113`, `--surface` `#15181B`, `--rule` `#22262B`, `--rule-strong`
`#2E343A`, `--ink` `#E8E6E3`, `--ink-2` `#A7A9AD`, `--ink-3` `#7E8288`,
`--edge` `#3A4046` (retained for any residual structural rule use, e.g. the
verification rail divider). Same contrast ratios, same floor: no text token
darker than `--ink-3`.

### 3.2 Evidence-input palette — unchanged verbatim

Same six values, same hex, same dash pattern, same glyph, same contrast
ratios as `DESIGN_CONTRACT.md` §3.3 (`OBSERVED` `#3FA98C` through
`UNESTABLISHED` `#C46A78`). In v0.3, colour applies in exactly one place:
the glyph preceding each evidence record's `input_kind` label in the case
reader — always paired there with the dash-rule (§5 below) and the
`label`-step text name, satisfying the colour-independence rule in full.

**Colour does not appear on the Overview at all** (a corrected decision —
an earlier draft added a compact evidence-glyph row to each Overview
entry; it carried colour and shape with no adjacent text label at that
size, which is exactly the "colour/shape without a text label" pattern
§3.4 and `DESIGN_CONTRACT.md` §8.4 forbid. Rather than shrink the six
input-kind labels to fit a compact row — which would either violate the
five-type-size/one-uppercase-context scale in §4.1 or be illegibly small —
the field was removed from the Overview entirely; see
`SPEC_PROPOSAL.md` §3.1 for the full reasoning).

`substantiation` remains text-only (`SOURCE-STATED`, `OWNER-ATTESTED`,
`NOT ESTABLISHED`); outcomes remain fully achromatic. No new colour is
introduced anywhere in v0.3.

### 3.3 Theme

Unchanged: dark only, `color-scheme: dark` declared, no toggle.

---

## 4. Typography

### 4.1 Families and scale — unchanged verbatim

Same two system-font stacks, same five-step scale (`display` 28/32 500,
`heading` 18/24 500, `body` 14/20 400, `label` 12/16 500, `micro` 11/14 400
mono), same two weights (400/500), same single uppercase context
(`label`), same 68-character prose measure, same `tabular-nums` on
dates/counts/ids. v0.3 introduces no new type step and no new weight.

### 4.2 New application, same tokens

- Case-reader section headings use `heading` (18/24 500) — e.g. "Evidence,"
  "Documented result," "Claim ceiling," "Verification."
- The claim-ceiling statement itself is set in `body`, but its section
  label uses `label` (uppercase, +0.02em) so it reads as a boundary marker,
  not more prose — this is the typographic mechanism for the "first-class
  placement" `SPEC_PROPOSAL.md` §3.3 requires, achieved with an existing
  step, not a new one.
- Outcome verdicts (`ABSTAIN`, `NO-GO`, etc.) keep v0.2's treatment exactly:
  `label` step, uppercase, achromatic, stated before explanatory copy.

---

## 5. Evidence encoding

Unchanged in meaning from `DESIGN_CONTRACT.md` §3.3–§3.4: every colour
distinction is duplicated by a dash pattern **and** a glyph **and** a text
label; the artifact must remain legible in greyscale. In v0.3 the "dash
pattern" no longer decorates an edge (there are no edges) — it decorates a
1px rule to the left of each evidence record, matching that record's
`input_kind` dash pattern, so the redundancy requirement is satisfied
without a canvas.

---

## 6. Outcome treatment

Unchanged from `DESIGN_CONTRACT.md` §3.3: outcomes are achromatic, use ink
tokens only, cannot resemble a success/error badge. In the case reader the
outcome verdict sits at the top of its section in `label` step, immediately
followed by its `body`-step statement, immediately followed by the claim
ceiling — no colour, no icon, no checkmark/cross glyph of any kind is
introduced for outcomes.

---

## 7. Interaction states

| State | Treatment |
|---|---|
| Overview row, default | `--ink-2` label, `--rule` bottom hairline |
| Overview row, hover/focus | Label brightens to `--ink`; 2px achromatic focus ring on keyboard focus; no background fill change (fill would be a "card hover" SaaS-register cue, forbidden by §1) |
| Overview row, FieldOS | Dashed top rule (8% opacity) + `SUPPORTING INSTRUMENT` label always visible in `label` step next to its name — never only on hover |
| Evidence record, collapsed basis | A native `<summary>` reading "Full basis," `micro` mono step; text, not an icon-only chevron-in-a-circle. Closed content is absent from the accessibility tree and tab order (browser-native `<details>` behaviour, not scripted) |
| Evidence record, expanded | `<details open>`; basis quotation shown in `body` step, indented 16px, `--ink-3` left rule; summary text swaps to "Hide full basis" via CSS, not a click handler. The reveal is **instant**, not animated — see `MOTION_CONTRACT.md` #3 for why |
| Source link | Underlined `body`-step text, `--ink` colour, focus ring on keyboard focus; accessible name states "opens in a new tab" per `SPEC_PROPOSAL.md` §9 |
| Previous/next control | Text button, `label` step, states position as "2 of 4" — never an arrow-only control |

---

## 8. Animation durations and motion rules

See `MOTION_CONTRACT.md` for the full contract; summary here for
completeness of this document's checklist (§10):

| Transition | Duration | Properties |
|---|---|---|
| Overview → Case reader | ≤ 400ms | `opacity`, `transform` |
| Case reader → Overview | ≤ 400ms | `opacity`, `transform` |
| Case reader → Case reader (previous/next) | ≤ 240ms | `opacity` only |
| Evidence record expand/collapse | **0ms — instant, not animated** | — (native `<details>`; see `MOTION_CONTRACT.md` #3 for why this is deliberately not in the animated inventory) |
| Focus ring appearance | 0ms (no transition on focus ring itself) | — |

Easing: `cubic-bezier(0.4, 0, 0.2, 1)` or `ease-out`, nothing else, unchanged
from `DESIGN_CONTRACT.md` §6.1. Maximum 2 simultaneous animated properties
per element. No staggered/sequenced animation.

### 8.1 Reduced motion

Identical rule to `DESIGN_CONTRACT.md` §6.3 — under
`prefers-reduced-motion: reduce`, all transitions and animations resolve to
0.01ms. Overview → Case reader becomes an instant swap. No cross-fade
substitute.

---

## 9. Responsive transformations

Two breakpoints, not four — a correction from an earlier draft of this
document, which described a ≥1280px two-column Overview, a narrowed
240px rail at 1024–1279px, and a mobile type-scale step-down. None of
those three was ever implemented; they are removed here rather than kept
as aspirational behaviour presented as built. What is actually
implemented, confirmed against the shipped CSS:

| Breakpoint | Overview | Case reader |
|---|---|---|
| ≥1024px | Single-column list, full row padding (24px, 32px above FieldOS's dashed rule) | Reading column + 280px verification rail, side by side |
| 640–1023px | Single-column list, same padding as ≥1024px | Verification rail moves below the reading column (not a bottom sheet — an ordinary in-flow section, since it is document content, not a floating panel) |
| 360–639px | Single-column list, reduced row padding (16px) | Same document order, verification rail in-flow below; type scale is **unchanged** at this width — the 68-character measure already keeps `body` prose readable down to 360px without a smaller step, confirmed in `VERIFICATION_REPORT.md` |

The Overview is a single column at **every** width, not only at narrow
ones — this is a deliberate choice, not an unfinished wide-viewport
treatment: a populated multi-column grid is exactly the "scan and compare"
affordance `UX_DIRECTION.md` §2 rejected Direction A's plate-as-primary-
interface for, and a wide viewport does not change that risk.

No representation swap at any width — only spacing and in-flow ordering
change. This is the direct implementation of `SPEC_PROPOSAL.md` §6.

---

## 10. Mobile representation

There is no separate mobile "mode." The case reader at 360px contains
exactly the same headings, in the same order, as at 1440px. This is stated
as its own section because it is the measurable difference from v0.2's
`DESIGN_CONTRACT.md` §7.3 structured fallback, which is a **different
document** from the wide-viewport graph. v0.3 has one document at every
width.

---

## 11. Focus behaviour

- Visible focus ring: 2px solid `--ink`, 2px offset, on every focusable
  element — unchanged from `DESIGN_CONTRACT.md` §8.3.
- Focus order is document order: header → Overview rows (or, in a case
  reader, previous/next → question → territory → result → claim ceiling →
  each evidence record's `<summary>` → verification source links →
  footer). No synthetic reordering, because there is no coordinate-derived
  node order to reconcile (contrast `DESIGN_CONTRACT.md` §8.2's
  "documented, stable order" workaround, which v0.3 does not need). A
  collapsed evidence record's basis quotation is not itself a tab stop —
  native `<details>` semantics, not a custom rule.
- `Esc` closes an open evidence-record disclosure (sets `<details>.open =
  false`, returns focus to its `<summary>`) if one is expanded, otherwise
  returns from Case reader to Overview, otherwise does nothing — a single,
  predictable escape hatch, mirroring `DESIGN_CONTRACT.md` §5.3's intent
  with a document-shaped implementation.

---

## 12. Source / provenance presentation

Every source cited anywhere in a case reader appears once in the
verification rail, in first-cited reading order as defined precisely in
`SPEC_PROPOSAL.md` §9.1 (identity/question → territory → result/ceiling →
evidence records, in listed order — not dataset order, not grouped by
source kind), with: label, kind (`micro` step, mono), `pinned_ref`
(truncated to 8 characters + full value in `title` attribute, mono,
tabular), and `accessed_at`. This is a strict superset of what
`DESIGN_CONTRACT.md` requires of the v0.2 detail panel's source list —
nothing is demoted, only relocated into an always-visible rail instead of
the last section of a panel.

---

## 13. Fallback behaviour

If `data/atlas.json` fails to load: an in-page, styled error state with the
exact local-server instructions from `README.md`'s "Running it locally"
section — never a blank page. Unchanged requirement from v0.2
(`DESIGN_CONTRACT.md` §9.4, README "Running it locally"). If JavaScript is
disabled: a `<noscript>` message identical in spirit to v0.2's, since the
prototype (like v0.2) fetches its data at runtime and cannot render
without script.

---

## 14. Performance budget

| Budget | Target |
|---|---|
| Total runtime asset weight (HTML+CSS+JS, uncompressed, excluding `data/atlas.json`) | ≤ 60KB, no vendored library |
| Dependencies | Zero. Vanilla ES2020, one stylesheet, inline SVG only for the six evidence glyphs (reused from v0.2's existing glyph paths) |
| First contentful paint (local static server, mid-tier device profile) | < 1s |
| Overview → Case-reader transition frame budget | 400ms at 60fps, `opacity`/`transform` only, no layout thrash |
| Network requests beyond local files | Zero, matching `DESIGN_CONTRACT.md` §9.3 |

See `IMPLEMENTATION_PLAN.md` §3 for the rendering-approach comparison this
budget is based on, and `VERIFICATION_REPORT.md` for what was actually
measured against it.

---

## 15. Contract checklist

- [ ] No coordinate-positioned canvas anywhere; layout is CSS document flow
- [ ] Only the six evidence input kinds carry colour; everything else
  achromatic
- [ ] Every colour distinction duplicated by dash-rule and glyph
- [ ] Five type steps, two weights, one uppercase context, unchanged
- [ ] Claim ceiling appears directly after the outcome statement in every
  case reader
- [ ] FieldOS visually and structurally discontinuous from the three cases
  at every breakpoint
- [ ] One document representation at every width ≥360px — no
  representation swap
- [ ] All transitions ≤400ms, ≤2 animated properties, no stagger, no
  ambient motion
- [ ] `prefers-reduced-motion` yields a complete, instant-transition
  equivalent experience
- [ ] Full keyboard operation, document-order focus, visible achromatic
  focus ring
- [ ] Zero dependencies, zero network requests beyond local files and
  user-initiated source links
- [ ] `data/atlas.json` unmodified in content; no scientific meaning altered
- [ ] Evidence records are a real `<ol>`/`<li>` list, not a generic `<div>`
  collection
- [ ] Basis disclosure uses native `<details>`/`<summary>`; collapsed
  content is absent from the accessibility tree and tab order
- [ ] Overview row accessible names are not truncated by an `aria-label`
  override, and carry no visual-only information (the Overview has no
  evidence-kind glyphs to keep in parity, by design — §3.2)
- [ ] Every interactive control (Overview rows, Back, Previous, Next, basis
  disclosure, source links) measures ≥44×44px — measured in
  `VERIFICATION_REPORT.md`, not assumed
- [ ] Verification-rail source order matches `SPEC_PROPOSAL.md` §9.1
  exactly at every case reader
