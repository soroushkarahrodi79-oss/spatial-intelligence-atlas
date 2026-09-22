# PROJECT_STATUS.md

**Audit date:** 2026-09-22

---

## 1. Status

**ACTIVE_BOUNDED — V0.2 GATE 3 IMPLEMENTATION DRAFTED, PENDING MERGE**

The runtime deployed to GitHub Pages (served from `main`) remains the
deliberately bounded maintenance release `v0.1.1`, published 2026-09-22 at
commit `f116b7c`. The original `v0.1.0` release remains preserved at its tag
(see §2).

Gate 1 (specification) was approved and merged through PR #6 at `9edfa5a`.
Gate 2 (semantic content freeze) was drafted through PR #7 and **approved by
the maintainer on 2026-09-22** in issue #5. Gate 3 (runtime and dataset
implementation) has been drafted on branch `impl/v0.2-gate3`, migrating
`index.html`, `styles.css`, `app.js`, and `data/atlas.json` to the v0.2
contract; it is **not yet merged to `main`**. Because GitHub Pages deploys
from `main`, merging that branch would make v0.2 the live artifact — this
repository treats that merge as requiring the same explicit maintainer
confirmation as Gate 4 (verification/release), not as implied by Gate 3
drafting alone.

## 2. Reference release

| | |
|---|---|
| Current tag | `v0.1.1` |
| Current commit | `f116b7c164ba0eda3ef88bb6ab8def46ede2d80e` |
| Published | 2026-09-22 |
| Original release | `v0.1.0` — `d3f399cf7317ea3951a5ee4761b4de01f3731fa5` — 2026-09-05 |
| Dataset schema | `0.1.0` (unchanged in `v0.1.1`) |
| Gate 1 baseline (`main`) | `9edfa5a6afda27efea53c7ace92c5d7921bdbf67` (2026-09-22) |
| Gate 2 content freeze (`main`) | `badd2a5321a998dfff5734275f26c37e317682e2` (2026-09-22), approved by maintainer 2026-09-22 |
| Gate 3 implementation branch | `impl/v0.2-gate3`, not yet merged |

Pull request #3 was merged as `f116b7c` and tagged `v0.1.1`. It changed the
runtime copy and dataset content needed to distinguish stated input provenance
from validation, causality, or decision sufficiency. Because the JSON shape did
not change, `data/atlas.json` correctly retains `schema_version: "0.1.0"`;
that value must not be read as the release tag. `v0.1.0` remains immutable at
its original tag. PR #6 approved the v0.2 specification and design contract;
PR #7 froze the v0.2 semantic content; neither changed the deployed artifact.
The Gate 3 implementation branch migrates the runtime and dataset per that
contract but remains unmerged. Merging to `main` and cutting a v0.2 release
requires separate, explicit maintainer confirmation (Gate 4).

## 3. Deployed v0.1.1 evidence state

The deployed dataset (`data/atlas.json`, 31 nodes / 54 edges) carries the
v0.1.1 per-edge evidence classification documented in `README.md`:

| Class | Meaning | v0.1.1 count |
|---|---|---|
| `REAL` | Directly observed or acquired data | 2 |
| `DERIVED` | Computed from other evidence via a declared transformation | 0 |
| `CALIBRATED` | Adjusted or validated against an independent reference | 0 |
| `SIMULATED` | Produced by a model under specified conditions | 0 |
| `PROVISIONAL` | Asserted by this atlas, not substantiated by the source | 8 |
| `MISSING` | Not declared by the source; the absence is itself the finding | 2 |

In plain terms: two evidence-production relationships are source-stated as
`REAL` at the **input** level, while the large majority of the graph's evidence
edges (8 of 12) are `PROVISIONAL` — asserted by the atlas's author, not verified
by the owner of the source system. Neither fact establishes validation, causal
attribution, or decision sufficiency. The atlas is explicitly designed to make
that limitation visible rather than hide it (empty
`DERIVED`/`CALIBRATED`/`SIMULATED` classes still render in the legend at zero).
This is a documentation and evidence-labelling exercise over five separate,
pre-existing systems (HATI, FIRSTLOOK-MAD, SNTO, FIELDOS, FAB); the atlas
performs no computation over live data, makes no predictions, and does not
execute or integrate any of the five systems it describes (`SPEC.md` §1.1,
§9).

## 4. Claim ceiling

For the deployed v0.1.1 runtime, this repository and its rendered
artifact may **not** be used to claim, imply, or be cited as:

- Accuracy, validation, or operational readiness of HATI, FIRSTLOOK-MAD,
  SNTO, FIELDOS, or FAB, or of the atlas itself.
- Technical integration, a data pipeline, a product suite, or an
  "end-to-end"/"unified" system connecting the five projects — the only
  permitted relationship is the symmetric, non-directional
  `conceptually_adjacent` edge.
- A real map, geographic projection, or validated territory data (territories
  are conceptual anchors, not geometry).
- Ranking, scoring, or maturity ordering of the five projects.
- An evidence status stronger than what the source project description
  explicitly states (`support == "stated"` required for anything above
  `PROVISIONAL`/`MISSING`).
- Scientific support for a decision merely because its input-class floor is
  `INPUT: STATED`; that label records source-declared input provenance only.

The maximum defensible framing of v0.1.1 is: *an explanatory, hand-authored, evidence-
labelled map of how five separate research artifacts relate conceptually,
current as of the source descriptions consulted when `data/atlas.json` was
authored.*

For v0.2 on the Gate 3 branch, the maximum defensible framing is: *an
implemented, contract-conformant v0.2 artifact, reviewed but not yet merged,
deployed, or released*. Until it is merged to `main` and a release is cut, it
does not supersede the v0.1.1 claim ceiling above, which continues to govern
the live GitHub Pages site.

## 5. Currently allowed changes

The following changes are currently allowed:

- Fixing typos, broken links, or formatting in `README.md`, `SPEC.md`,
  `DESIGN_CONTRACT.md`.
- Implementing Gate 3 (`index.html`, `styles.css`, `app.js`,
  `data/atlas.json`) on a review branch, per the approved Gate 2 content and
  `DESIGN_CONTRACT.md`.
- Correcting documentation so it distinguishes deployed v0.1.1 from the v0.2
  implementation branch.
- Re-triggering deployment (e.g. GitHub Pages) with no content change.

Not currently allowed without a separate, explicit maintainer confirmation:
merging the Gate 3 branch to `main` (this changes the deployed GitHub Pages
site), or creating a v0.2 release/tag.

## 6. v0.2 gate sequence

| Gate | State | Authority |
|---|---|---|
| Gate 1 — specification and design | **APPROVED** | PR #6 / `9edfa5a` |
| Gate 2 — semantic content and pinned sources | **APPROVED** | Issue #5, 2026-09-22 |
| Gate 3 — runtime and dataset implementation | **DRAFTED, PENDING MERGE** | Branch `impl/v0.2-gate3` |
| Gate 4 — verification and release | **UNAUTHORISED** | Requires explicit maintainer confirmation to merge and release |

Approval of one gate does not imply approval of the next.

## 7. Open issues and pull requests

Issue and pull-request counts are operational metadata, not part of the release
claim. They should be checked on GitHub at review time rather than frozen here;
the audit baseline in §2 is the stable reference for this document.

## 8. Licensing — unresolved, flagged rather than assumed

**No `LICENSE` file exists in this repository**, for either the code
(`index.html`, `styles.css`, `app.js`) or the data (`data/atlas.json`). No
license is declared in `README.md`, `SPEC.md`, or `DESIGN_CONTRACT.md`. This
audit does not assign one. Until a license is added, the default is "all
rights reserved" under most jurisdictions — downstream reuse, including of
the dataset's evidence claims, has no explicit grant. This is flagged as an
open ambiguity for the maintainer to resolve deliberately (including
separately for code vs. data, since the evidence-provenance discipline in
§3 may warrant a different license for `data/atlas.json` than for the
rendering code); it is not something this audit will guess at.

## 9. Publication identifiers and versioning

No DOI is currently associated with this repository or its `v0.1.0` or
`v0.1.1` releases (none found in `README.md`, `SPEC.md`,
`DESIGN_CONTRACT.md`, the release
notes, or repository metadata). If a DOI is minted for this or a future
release, it should be recorded here alongside the corresponding tag, and the
version/tag it was minted against must not be altered retroactively — mint a
new DOI for a new version instead of reissuing an old one.
