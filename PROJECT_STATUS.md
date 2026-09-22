# PROJECT_STATUS.md

**Audit date:** 2026-09-22

---

## 1. Status

**RELEASE_LOCKED**

The repository holds a deliberately bounded maintenance release, `v0.1.1`,
published 2026-09-22 at commit `f116b7c`. It clarifies input-evidence semantics
and pins two source references; it adds no capability and makes no schema
change. The original `v0.1.0` release remains preserved at its tag (see §2).
`README.md` states the three source-of-truth
documents (`SPEC.md`, `DESIGN_CONTRACT.md`, `data/atlas.json`) are **Locked**,
and `DESIGN_CONTRACT.md` §9.1 caps the implementation at three files
(`index.html`, `styles.css`, `app.js`) plus `data/atlas.json`, whose *schema*
is explicitly frozen ("modifiable in content but not in schema"). Nothing in
the repository indicates active feature development; the artifact is finished
as specified for v0.1.

This is not `PAUSED_PENDING_EVIDENCE`: the repository isn't waiting on
evidence to resume a v0.1 effort — v0.1 is complete. It is not
`ACTIVE_BOUNDED`: there is no ongoing development inside the bound, only a
closed release. It is not `MAINTENANCE_ONLY` in the open-ended sense, because
the contract itself (§9.1–9.2) forbids adding files or scope, not merely
discourages it — the lock is structural, not a policy choice that could be
loosened at will.

## 2. Reference release

| | |
|---|---|
| Current tag | `v0.1.1` |
| Current commit | `f116b7c164ba0eda3ef88bb6ab8def46ede2d80e` |
| Published | 2026-09-22 |
| Original release | `v0.1.0` — `d3f399cf7317ea3951a5ee4761b4de01f3731fa5` — 2026-09-05 |
| Dataset schema | `0.1.0` (unchanged in `v0.1.1`) |
| Audit baseline (`main`) | `f116b7c164ba0eda3ef88bb6ab8def46ede2d80e` (2026-09-22) |

Pull request #3 was merged as `f116b7c` and tagged `v0.1.1`. It changed the
runtime copy and dataset content needed to distinguish stated input provenance
from validation, causality, or decision sufficiency. Because the JSON shape did
not change, `data/atlas.json` correctly retains `schema_version: "0.1.0"`;
that value must not be read as the release tag. `v0.1.0` remains immutable at
its original tag. Any future change to the *artifact itself* (`index.html`,
`styles.css`, `app.js`, `data/atlas.json`) would need its own tag under §6.

## 3. Demonstrated vs. simulated / derived / provisional / unvalidated

The dataset (`data/atlas.json`, 31 nodes / 54 edges) carries an explicit,
per-edge evidence classification. As declared in `README.md` and enforced by
`SPEC.md` §1.2:

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

Per `SPEC.md` §9 (binding, v0.1 non-goals), this repository and its rendered
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

The maximum defensible framing is: *an explanatory, hand-authored, evidence-
labelled map of how five separate research artifacts relate conceptually,
current as of the source descriptions consulted when `data/atlas.json` was
authored.*

## 5. Allowed maintenance changes

Consistent with the lock in `DESIGN_CONTRACT.md` §9 and `SPEC.md` §9:

- Fixing typos, broken links, or formatting in `README.md`, `SPEC.md`,
  `DESIGN_CONTRACT.md`.
- Correcting factual errors in `data/atlas.json` **content** (e.g. a
  mis-transcribed quotation in a `basis` field) without changing the JSON
  **schema**.
- Accessibility, browser-compatibility, or correctness fixes to `index.html`,
  `styles.css`, `app.js` that do not add a file, a dependency, a network
  request, persistence, or any capability listed as forbidden in
  `SPEC.md` §9.3–9.4 and `DESIGN_CONTRACT.md` §9.3.
- Re-triggering deployment (e.g. GitHub Pages) with no content change.
- Documentation-only additions that record facts about the existing release
  (this file is one such addition).

Not allowed under the current lock without first reopening development
(§6): adding files beyond the three-file budget plus `data/atlas.json`,
changing the `atlas.json` schema, resolving a `PROVISIONAL` edge to a
substantive class, or adding any feature, integration, or scope not already
in `SPEC.md` v0.1.

## 6. What would reopen development

`README.md` and `SPEC.md` §1.2 defer exactly one class of change to a future
version: **resolving a `PROVISIONAL` evidence edge to a substantive class
(`REAL`, `DERIVED`, `CALIBRATED`, or `SIMULATED`) requires confirmation from
the owner of the corresponding source system** (HATI, FIRSTLOOK-MAD, SNTO,
FIELDOS, or FAB), and is explicitly deferred to v0.2. Absent such
confirmation for a specific edge, the current `PROVISIONAL`/`MISSING`
labelling stands and no development beyond §5 maintenance is warranted.

A second, narrower path exists: `DESIGN_CONTRACT.md` §9.2 permits **one**
additional local asset if the artifact provably cannot satisfy `SPEC.md`
without it (a v0.1 gap, not a new feature request). This exception is not
invoked in v0.1; if ever invoked, the file and justification must be
recorded in `README.md` per that section.

No other trigger (new source system, feature request, aesthetic preference,
or general "more content") is sufficient on its own to reopen development
under the current contract; any such request would first require amending
`SPEC.md`/`DESIGN_CONTRACT.md` themselves, which is a decision for the
maintainer, not a maintenance action.

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
