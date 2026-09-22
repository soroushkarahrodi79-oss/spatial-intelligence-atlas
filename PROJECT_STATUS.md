# PROJECT_STATUS.md

**Audit date:** 2026-09-22

---

## 1. Status

**ACTIVE_BOUNDED — V0.2 DOCUMENTATION ONLY**

The deployed runtime remains the deliberately bounded maintenance release
`v0.1.1`, published 2026-09-22 at commit `f116b7c`. It adds no capability and
makes no schema change. The original `v0.1.0` release remains preserved at its
tag (see §2).

A separate, bounded v0.2 documentation track is active. Gate 1 was approved and
merged through PR #6 at `9edfa5a`; it changes the future meaning and design
contract but does not alter the deployed runtime. Gate 2 is drafting the exact
semantic records and commit-pinned sources. `index.html`, `styles.css`,
`app.js`, and `data/atlas.json` remain locked until separate Gate 3 approval.

## 2. Reference release

| | |
|---|---|
| Current tag | `v0.1.1` |
| Current commit | `f116b7c164ba0eda3ef88bb6ab8def46ede2d80e` |
| Published | 2026-09-22 |
| Original release | `v0.1.0` — `d3f399cf7317ea3951a5ee4761b4de01f3731fa5` — 2026-09-05 |
| Dataset schema | `0.1.0` (unchanged in `v0.1.1`) |
| Gate 1 baseline (`main`) | `9edfa5a6afda27efea53c7ace92c5d7921bdbf67` (2026-09-22) |

Pull request #3 was merged as `f116b7c` and tagged `v0.1.1`. It changed the
runtime copy and dataset content needed to distinguish stated input provenance
from validation, causality, or decision sufficiency. Because the JSON shape did
not change, `data/atlas.json` correctly retains `schema_version: "0.1.0"`;
that value must not be read as the release tag. `v0.1.0` remains immutable at
its original tag. PR #6 later approved the v0.2 specification and design
contract without changing the artifact itself. Any future runtime or dataset
change requires Gate 3 approval and a new release.

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

For v0.2 during Gate 2, the maximum defensible framing is: *an approved design
with a draft, source-pinned semantic content freeze*. It is not an implemented,
deployed, or released v0.2 artifact.

## 5. Currently allowed changes

The following changes are currently allowed:

- Fixing typos, broken links, or formatting in `README.md`, `SPEC.md`,
  `DESIGN_CONTRACT.md`.
- Drafting and reviewing the Gate 2 semantic content in `SPEC.md`.
- Correcting documentation so it distinguishes deployed v0.1.1 from the v0.2
  documentation track.
- Re-triggering deployment (e.g. GitHub Pages) with no content change.

Not currently allowed: changing any runtime file, migrating the dataset schema,
implementing v0.2, changing the deployed site, or creating a v0.2 release.

## 6. v0.2 gate sequence

| Gate | State | Authority |
|---|---|---|
| Gate 1 — specification and design | **APPROVED** | PR #6 / `9edfa5a` |
| Gate 2 — semantic content and pinned sources | **DRAFT** | Documentation only |
| Gate 3 — runtime and dataset implementation | **UNAUTHORISED** | Requires separate maintainer approval |
| Gate 4 — verification and release | **UNAUTHORISED** | Requires Gate 3 completion |

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
