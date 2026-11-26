# PROJECT_STATUS.md

**Audit date:** 2026-09-22 · **Updated:** 2026-11-26 (records the merge of
v0.3.0 Gates 3 and 4 into `main`, its deployment on GitHub Pages, the
production smoke test and the preparation of the `v0.3.0` release; the
§12.10 human verification is still pending)

---

## 1. Status

**ACTIVE_BOUNDED — V0.3.0 DEPLOYED FROM `main`; RELEASE TAG PENDING AUTHORISATION**

GitHub Pages serves `main`. Since 2026-11-26 it serves the **v0.3.0 Research
Explorer** (merge commit `8d07bf3`, PR #19, which includes Gate 4, PR #20 /
`5bf7cb4`). The Pages build of `8d07bf3` completed, and the production smoke
test passed (§6.1).

The `v0.3.0` tag and GitHub release have **not** been created. They follow
the release commit (PR "Release v0.3.0") and need the maintainer's explicit
authorisation. The last released tag is **`v0.2.1`**. It and `v0.2.0`,
`v0.1.1` and `v0.1.0` remain preserved, immutable, at their tags (§2);
`SPEC.md` and `DESIGN_CONTRACT.md` at tag `v0.2.1` still govern that release.

**Scientific human verification (`SPEC.md` §12.10) is pending.** All rows of
the maintainer's record are unchecked; acceptance criterion A2 is therefore
pending, and the Atlas says so on every view.

For the v0.2 history: All four v0.2 gates are complete:

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
| v0.3.0 | Deployed from `main` at `8d07bf3` (2026-11-26). Tag `v0.3.0` and GitHub release: **pending authorisation**; release date 2026-11-26 in `CITATION.cff` |
| Last released tag | `v0.2.1` (maintenance release) |
| Current commit | `ed57ed50d17aa7e8afe1f57b4222b98600f16ea9` |
| Published | 2026-09-25 |
| Dataset schema | `0.2.0` (unchanged) |
| v0.2.1 maintenance | PR #13, `gate-approved`, merged as `ed57ed5` |
| Prior release | `v0.2.0` — `54128ea9ac642a6fefe614be4b2f3631635a6847` — 2026-09-22 (preserved, immutable) |
| Earlier release | `v0.1.1` — `f116b7c164ba0eda3ef88bb6ab8def46ede2d80e` — 2026-09-22 (preserved, immutable) |
| Original release | `v0.1.0` — `d3f399cf7317ea3951a5ee4761b4de01f3731fa5` — 2026-09-05 (preserved, immutable) |
| Gate 1 baseline | `9edfa5a6afda27efea53c7ace92c5d7921bdbf67` (2026-09-22) |
| Gate 2 content freeze | `badd2a5321a998dfff5734275f26c37e317682e2` (2026-09-22), approved by maintainer 2026-09-22 |
| Gate 3 implementation | PR #8, branch `impl/v0.2-gate3`, merged as `54128ea` |

Pull request #3 was merged as `f116b7c` and tagged `v0.1.1`; it remains
preserved as historical, immutable content — it is **not** the current
release. `v0.1.0` remains immutable at its original tag. PR #6 approved the
v0.2 specification and design contract; PR #7 froze the v0.2 semantic
content; PR #8 implemented that contract in the runtime and dataset and was
merged with explicit maintainer confirmation, then tagged `v0.2.0`. PR #13
applied the `v0.2.1` readability and accessibility maintenance under §5,
with the maintainer's `gate-approved` decision for its five presentation
coordinates, and was tagged `v0.2.1`.

## 3. v0.2.x content (preserved at its tags; no longer deployed)

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
never collapsed. Full content is frozen in `SPEC.md` §12 (at tag `v0.2.1`) and was reviewed
against the pinned commits listed in §2.6 of the same document before this
release.

FIRSTLOOK-MAD and FAB, and the five-system all-pairs graph they were part of,
remain preserved as immutable v0.1 history (`v0.1.0`, `v0.1.1`) but are not
primary v0.2 entities. See `SPEC.md` §1.1 at tag `v0.2.1` for the selection
principle.

## 4. Claim ceiling

For the deployed `v0.2.1` runtime (and the preserved `v0.2.0`), this
repository and its rendered artifact may **not** be used to claim, imply, or
be cited as:

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

The maximum defensible framing of `v0.2.1` (identical for `v0.2.0`) is: *a
selective, evidence-informed research map of three tourism and
spatial-decision research cases and one supporting instrument, showing what
was studied, what result was documented, what remains unsupported, and where
the reader can verify it — current as of the pinned source commits reviewed
for Gate 2.*

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

Any change to the deployed content model, design contract or semantic
payload requires a gated proposal, not an ad hoc edit. That covers adding an
entity, an entity-to-entity relationship or a new claim.

This discipline is now enforced mechanically:

- `Enforce governance gate` is a required status check on `main` (ruleset
  `23958517`);
- release tags `v*` cannot be deleted, moved or force-pushed (ruleset
  `28098449`).

Both were applied by the maintainer on 2026-11-25 (Gate 0, M3).

From v0.3.0 the governed files also include the new runtime modules
`js/*.js`, `data/geometry/*` and `assets/figures/*` (governance gate regex and
`.github/GOVERNANCE_GATE.md`, updated at Gate 3). `app.js` stays listed for
the v0.2.x history.

## 6. v0.2 gate sequence

| Gate | State | Authority |
|---|---|---|
| Gate 1 — specification and design | **APPROVED** | PR #6 / `9edfa5a` |
| Gate 2 — semantic content and pinned sources | **APPROVED** | Issue #5, 2026-09-22 |
| Gate 3 — runtime and dataset implementation | **APPROVED, MERGED** | PR #8 / `54128ea` |
| Gate 4 — verification and release | **APPROVED, RELEASED** | Issue #5, tag `v0.2.0`, 2026-09-22 |

All four gates are complete for `v0.2.0`. `v0.2.1` (PR #13) was ordinary
maintenance under §5 and did not reopen the sequence.

### 6.1 v0.3 gate sequence (Research Explorer)

| Gate | State | Authority |
|---|---|---|
| Gate 0 — audit and direction | **APPROVED, MERGED** | PR #15 / `ea93956` (`docs/gate0/V0.3_RESEARCH_EXPLORER_GATE0.md`) |
| Gate 1 — specification and design (`SPEC.md`, `DESIGN_CONTRACT.md`) | **APPROVED, MERGED** | PR #17 / `326d98f` |
| Gate 2 — content freeze (seven items, pins, methodology, outputs, figures, geometry) | **MERGED**; per-claim human verification by the maintainer **pending** (`SPEC.md` §12.10, all rows unchecked); approval A-Q1 (HATI route geometry) **not given** | PR #18 / `23297cd` |
| Gate 3 — runtime and dataset implementation (`js/*.js`, schema `0.3.0` dataset, geometry, figures, validator, CI) | **MERGED** into `main` | PR #19 / `8d07bf3` |
| Gate 4 — verification and release `v0.3.0` | **MERGED AND DEPLOYED**: A1 and A3–A20 pass; **A2 pending** (§12.10); D4 licence, D4-d, A-Q1 (keep excluded), A16 exception and DOI deferral approved by the maintainer 2026-11-26; Pages smoke test passed 2026-11-26. **Tag and release pending authorisation; DOI deferred** | PR #20 / `5bf7cb4` into the Gate 3 branch, then PR #19; `docs/gate4/README.md` |

The v0.3.0 scope is closed at seven items (`SPEC.md` §3):

- documented research: HATI-Madrid pilot, HATI pedestrian heat extension,
  SNTO — PNSG, Pedestrian Network Accessibility Pilot;
- research platforms: SNTO observatory, Madrid Urban Evidence Lens;
- instrument: FieldOS.

v0.3.0 state on `main` (`8d07bf3`):

- `tools/validate_atlas.py` passes I1–I13 and I15–I18 with zero errors. That
  is mechanical validation of metadata only; it does not establish
  scientific support (`SPEC.md` §4.11).
- The scientific support of every claim (I11 support, I14) still rests on
  the maintainer's §12.10 record, which is not yet completed.
- The HATI route geometry stays excluded (A-Q1); no plate, file or hash exists.
- **Production smoke test, 2026-11-26** (live Pages site, headless Edge,
  1440 px and 390 px):
  - all 19 routes render, including the 7 dossiers and the not-found state;
  - all 3 plates draw, and the 3 geometry files served match their declared
    SHA-256;
  - all 5 figures load;
  - the licence files and `CITATION.cff` are served;
  - the footer shows the approved licences on every route;
  - no horizontal overflow on mobile;
  - every request goes to the site's own origin, with no failed requests
    and no console errors.

  One defect was found: the footer still read "unreleased … deployment on
  hold". The release commit corrects it.
- Remaining sequence (`docs/gate4/README.md` §5): merge the release commit,
  then create the `v0.3.0` tag and GitHub release on that merge commit, only
  with the maintainer's authorisation. A DOI only after that, and only if
  authorised.

CHALUS is excluded because its repository is private; it stays preserved
in the `v0.2.x` tags. MCP, Transit Graph and Isovist are deferred to v0.3.x.
The v0.2.x releases, which are no longer deployed, keep two CHALUS source
links that return 404 to the public.

## 7. Open issues and pull requests

Issue and pull-request counts are operational metadata, not part of the
release claim. They should be checked on GitHub at review time rather than
frozen here; the audit baseline in §2 is the stable reference for this
document.

## 8. Licensing

**Approved at Gate 4 (D4, 2026-11-26), in effect from the merge of PR #20.**

- **Original code:** MIT (`LICENSE`).
- **Original data and text:** CC BY 4.0 (`LICENSE-CONTENT.md`).
- **Excluded, keeping their own licences:**
  - Ayuntamiento de Madrid geometry (CC BY 4.0);
  - OAPN geometry (OAPN/MITECO reuse terms, with a non-endorsement notice on
    the plate);
  - the preprint figures (CC BY 4.0) and the network-pilot figure (MIT, with
    embedded CC BY 4.0 and ODbL notices);
  - verbatim quotations, which keep their sources' licensing.

The compatibility review is `docs/gate4/LICENCE_REVIEW.md`; the decision
record is `docs/gate4/README.md` §4.

Releases `v0.1.0`–`v0.2.1` were published without a licence. This approval
does not change them retroactively.

## 9. Publication identifiers and versioning

No DOI is currently associated with this repository or its `v0.1.0`,
`v0.1.1`, `v0.2.0`, or `v0.2.1` releases (none found in `README.md`, `SPEC.md`,
`DESIGN_CONTRACT.md`, the release notes, or repository metadata). If a DOI is
minted for this or a future release, it should be recorded here alongside the
corresponding tag, and the version/tag it was minted against must not be
altered retroactively — mint a new DOI for a new version instead of
reissuing an old one.
