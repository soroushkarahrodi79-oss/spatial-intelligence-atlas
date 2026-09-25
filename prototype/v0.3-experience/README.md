# v0.3 experience prototype — experimental, not a release

**Status:** experimental design prototype for maintainer review. **Not** a
release, not v0.3, not production, not an authorization to merge. Does not
touch the deployed `v0.2.1` interface (`/index.html`, `/styles.css`,
`/app.js`) and does not modify `data/atlas.json`.

This prototype implements the **Narrative Evidence Explorer** direction
chosen in `docs/v0.3/UX_DIRECTION.md`, specified in
`docs/v0.3/SPEC_PROPOSAL.md` and `docs/v0.3/DESIGN_CONTRACT_PROPOSAL.md`,
with motion per `docs/v0.3/MOTION_CONTRACT.md`.

## How to run

The prototype fetches the deployed dataset at `../../data/atlas.json`, so it
must be served **from the repository root** (not from this subdirectory):

```
# from the repository root:
python -m http.server 8000
```

Then open:

```
http://localhost:8000/prototype/v0.3-experience/
```

`file://` will not work (browsers block `fetch`). If the fetch fails, the
page shows a styled instruction panel instead of a blank screen.

## What it contains

| File | Role |
|---|---|
| `index.html` | Entry point — Overview screen + Case reader template |
| `styles.css` | Document-layout styling per `DESIGN_CONTRACT_PROPOSAL.md` |
| `app.js` | Fetch, render Overview, render Case reader, five interactions, motion |

Zero dependencies, zero vendored code, zero network requests beyond the
local dataset fetch and user-initiated source links — see
`docs/v0.3/IMPLEMENTATION_PLAN.md` §1–§2 for the rendering-approach
comparison and dependency accounting behind that choice.

## Differences from the deployed v0.2.1

| | v0.2.1 (deployed) | This prototype |
|---|---|---|
| Primary structure | 3 modes (Territory/Evidence/Decisions), each a full-canvas graph | 2 screens: an Overview list and a single-entity Case reader answering all three questions together |
| Rendering | Inline SVG node-link graph, deterministic `[0,1]` coordinates | Structured HTML document, CSS layout, no coordinate system |
| Narrow width (<640px) | A second, purpose-built structured-outline fallback | The same document at every width — only spacing/type reflow |
| Claim ceiling | 4th of 8 fields in the detail panel | Immediately follows the documented result in every case reader |
| Territory | Conceptual-anchor node shape on canvas | Plain text, no graphic of any kind |
| Detail panel | Persistent side/bottom panel, separate from the graph | The case reader *is* the detail; no separate panel |

### Preserved from v0.2.1 (unchanged)

- Three independent core cases + FieldOS as a visually separated supporting
  instrument.
- Zero entity-to-entity relationships; the existing `situated_in` /
  `documents` / `reports` relationships are read, not extended.
- The evidence input-kind vocabulary, colours, dash patterns and glyphs
  (same path data as the deployed glyphs).
- The documented outcomes, statements and claim ceilings, read verbatim
  from the dataset.
- The pinned-source provenance model and outbound-link behaviour
  (`target="_blank"`, `rel="noopener noreferrer"`, accessible name states
  "opens in a new tab").
- No scientific inference: outcomes are read, never computed.
- Achromatic outcomes; no ranking, sorting, or filtering of entities.

## Changes that would require a new / revised design contract before integration

1. Retiring the graph/mode structure as the primary IA — this is the
   largest single change and would require rewriting `SPEC.md` §3, §5–§8
   and `DESIGN_CONTRACT.md` §2 in full, not amending them.
2. Removing the sub-640px structured-outline fallback in favour of one
   reflowing document representation.
3. Relocating claim ceiling to appear immediately after the outcome
   statement rather than after research status/territory.
4. Removing the SVG canvas and its associated ARIA graph semantics
   (`role="group"`, synthetic per-node `aria-label` sentences, the
   `aria-live` mode/selection narration) in favour of native document
   landmarks and list semantics.
5. A new author-attribution footer line (small, factual, not present in
   v0.2's contract at all).

See `docs/v0.3/VERIFICATION_REPORT.md` for what was actually tested against
this prototype, and what was not.
