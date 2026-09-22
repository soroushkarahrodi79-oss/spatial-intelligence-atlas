# PROJECT_STATUS.md

**Audit date:** 2026-09-22

---

## 1. Status

**ACTIVE_BOUNDED — V0.2.0 RELEASED AND DEPLOYED**

The runtime deployed to GitHub Pages (served from `main`) is release
**`v0.2.0`**, merged through PR #8 at `54128ea` and tagged on 2026-09-22. It
supersedes v0.1.1 as the live artifact. Both `v0.1.0` and `v0.1.1` remain
preserved, immutable, at their original tags (see §2).

All four v0.2 gates are complete:

1. **Gate 1 — specification and design contract** — approved and merged
   through PR #6.
2. **Gate 2 — semantic content freeze** — drafted through PR #7, approved by
   the maintainer on 2026-09-22 in issue #5.
3. **Gate 3 — runtime and dataset implementation** — drafted on branch
   `impl/v0.2-gate3`, migrating `index.html`, `styles.css`, `app.js`, and
   `data/atlas.json` to the approved contract.
4. **Gate 4 — verification and release** — the maintainer explicitly
   confirmed merging Gate 3 to `main` and cutting the `v0.2.0` release on
   2026-09-22 (issue #5, PR #8).

## 2. Reference release

| | |
|---|---|
| Current tag | `v0.2.0` |
| Current commit | `54128ea9ac642a6fefe614be4b2f3631635a6847` |
| Published | 2026-09-22 |
| Dataset schema | `0.2.0` |
| Prior release | `v0.1.1` — `f116b7c164ba0eda3ef88bb6ab8def46ede2d80e` — 2026-09-22 (preserved, immutable) |
| Original release | `v0.1.0` — `d3f399cf7317ea3951a5ee4761b4de01f3731fa5` — 2026-09-05 (preserved, immutable) |
| Gate 1 baseline | `9edfa5a6afda27efea53c7ace92c5d7921bdbf67` (2026-09-22) |
| Gate 2 content freeze | `badd2a5321a998dfff5734275f26c37e317682e2` (2026-09-22), approved by maintainer 2026-09-22 |
| Gate 3 implementation | PR #8, branch `impl/v0.2-gate3`, merged as `54128ea` |

Pull request #3 was merged as `f116b7c` and tagged `v0.1.1`; it remains
preserved as historical, immutable content — it is **not** the current
release. `v0.1.0` remains immutable at its original tag. PR #6 approved the
v0.2 specification and design contract; PR #7 froze the v0.2 semantic
content; PR #8 implemented that contract in the runtime and dataset and was
merged with explicit maintainer confirmation, then tagged `v0.2.0`.

## 3. Deployed v0.2.0 content

The deployed dataset (`data/atlas.json`, schema `0.2.0`) carries a
selective, evidence-informed content model: 4 entities (3 core cases, 1
supporting instrument), 3 territories, 10 evidence records, 4 outcomes, 8
commit-pinned sources, and 17 relationships. There are **zero**
entity-to-entity relationships.

| Entity | Kind | Documented result |
|---|---|---|
| HATI — Pedestrian Heat Extension | Core case | `ABSTAIN` / no robust difference |
| SNTO — PNSG Decision Evidence | Core case | `INSUFFICIENT EVIDENCE` |
| CHALUS — Western Mazandaran Pilot | Core case | `NO-GO` |
| FieldOS | Supporting instrument | `FUNCTIONAL TEST` |

Each evidence record carries a separate `input_kind` (`observed` / `acquired`
/ `derived` / `simulated` / `reported` / `unestablished`) and `substantiation`
(`source_stated` / `owner_attested` / `not_established`); the two axes are
never collapsed. Full content is frozen in `SPEC.md` §12 and was reviewed
against the pinned commits listed in §2.6 of the same document before this
release.

FIRSTLOOK-MAD and FAB, and the five-system all-pairs graph they were part of,
remain preserved as immutable v0.1 history (`v0.1.0`, `v0.1.1`) but are not
primary v0.2 entities. See `SPEC.md` §1.1 for the selection principle.

## 4. Claim ceiling

For the deployed `v0.2.0` runtime, this repository and its rendered artifact
may **not** be used to claim, imply, or be cited as:

- Validation, causal attribution, operational readiness, or management
  sufficiency for HATI, SNTO, CHALUS, or FieldOS beyond what its pinned
  source states.
- Technical integration, a data pipeline, shared runtime, or product suite
  connecting the four entities — there is no entity-to-entity relationship in
  v0.2.
- A real map, geographic projection, or validated territory data (territories
  are conceptual anchors, not geometry).
- Ranking, scoring, or maturity ordering of the entities, or treatment of
  `input_kind` / `substantiation` / `outcome_type` as an ordinal scale.
- Tourism demand, visitor pressure, revenue, closure, restriction, or
  investment effects not established by the reviewed source for that entity.
- Scientific support for a decision beyond the documented outcome's stated
  `claim_ceiling`.

The maximum defensible framing of `v0.2.0` is: *a selective, evidence-informed
research map of three tourism and spatial-decision research cases and one
supporting instrument, showing what was studied, what result was documented,
what remains unsupported, and where the reader can verify it — current as of
the pinned source commits reviewed for Gate 2.*

For the preserved `v0.1.1` release, the maximum defensible framing remains:
*an explanatory, hand-authored, evidence-labelled map of how five separate
research artifacts relate conceptually, current as of the source descriptions
consulted when that release's `data/atlas.json` was authored.* That framing
no longer describes the live site.

## 5. Currently allowed changes

With all four v0.2 gates complete, ordinary maintenance applies:

- Fixing typos, broken links, or formatting in any documentation file.
- Bug fixes to `index.html`, `styles.css`, or `app.js` that do not change the
  content model, design contract, or claim ceiling.
- Re-triggering deployment (e.g. GitHub Pages) with no content change.

Any change to the v0.2 content model (`SPEC.md` §4), design contract
(`DESIGN_CONTRACT.md`), or the semantic payload in `SPEC.md` §12 (adding an
entity, an entity-to-entity relationship, or a new claim) requires a new,
separately gated proposal — the same discipline that produced v0.2, not an
ad hoc edit.

## 6. v0.2 gate sequence

| Gate | State | Authority |
|---|---|---|
| Gate 1 — specification and design | **APPROVED** | PR #6 / `9edfa5a` |
| Gate 2 — semantic content and pinned sources | **APPROVED** | Issue #5, 2026-09-22 |
| Gate 3 — runtime and dataset implementation | **APPROVED, MERGED** | PR #8 / `54128ea` |
| Gate 4 — verification and release | **APPROVED, RELEASED** | Issue #5, tag `v0.2.0`, 2026-09-22 |

All four gates are complete for `v0.2.0`. A future v0.3 (or any content-model
change) restarts this sequence from Gate 0.

## 7. Open issues and pull requests

Issue and pull-request counts are operational metadata, not part of the
release claim. They should be checked on GitHub at review time rather than
frozen here; the audit baseline in §2 is the stable reference for this
document.

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

No DOI is currently associated with this repository or its `v0.1.0`,
`v0.1.1`, or `v0.2.0` releases (none found in `README.md`, `SPEC.md`,
`DESIGN_CONTRACT.md`, the release notes, or repository metadata). If a DOI is
minted for this or a future release, it should be recorded here alongside the
corresponding tag, and the version/tag it was minted against must not be
altered retroactively — mint a new DOI for a new version instead of
reissuing an old one.
