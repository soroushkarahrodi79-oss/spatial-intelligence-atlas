# Governance gate

`.github/workflows/governance-gate.yml` is a required status check that makes
the written governance in `PROJECT_STATUS.md` (§4 claim ceiling, §5 allowed
changes, §6 gate sequence) mechanically enforceable.

## Why it exists

PR #10 was an explicitly review-only prototype. Its own body stated it was
*"not an authorization to merge"* and listed five preconditions before any
integration. It was merged into `main` regardless, publishing experimental
code under a repository whose entire value rests on its gate discipline and
claim ceiling. Prose alone did not stop that. This check does.

## What it blocks

A pull request targeting `main` fails the check when **either**:

1. **It signals it is not ready to merge:**
   - it carries the **`do-not-merge`** label, or
   - its title or body contains `do not merge`, `not an authorization to
     merge`, or `no merge, release` (case-insensitive, high-precision
     phrases only).

   Draft state is deliberately not one of these signals: GitHub already
   blocks merging a draft, so flagging every draft red would only normalise
   a red required check during ordinary work in progress.

2. **It changes a governed file without deliberate authorisation:** the diff
   touches any of

   ```
   SPEC.md
   DESIGN_CONTRACT.md
   data/atlas.json
   index.html
   app.js
   styles.css
   ```

   and the **`gate-approved`** label is absent.

## What it does *not* do

- It does not judge whether a change is scientifically correct — only that a
  governed change was made **deliberately**, via a decision recorded by the
  `gate-approved` label, rather than an ad hoc edit.
- It changes nothing in the repository; it only reads the diff and the PR
  metadata.

## How to pass it legitimately

- **Ordinary maintenance** (typos, docs, non-governed files): nothing to do —
  the gate stays green.
- **A genuine gated change** to a governed file: open the gated proposal as
  `PROJECT_STATUS.md` §6 requires, then add the **`gate-approved`** label to
  the PR once the maintainer has decided. Adding the label is the deliberate
  act the governance asks for.
- **Work in progress you do not want merged yet:** keep it a draft (GitHub
  blocks merging it) and/or add the `do-not-merge` label. The label holds the
  gate red until you remove it.

## Required labels

Create these two labels once (`Issues → Labels`, or the API):

- `gate-approved` — authorises a change to governed files.
- `do-not-merge` — an explicit, structured "not ready" signal.

## Making it binding

The check only *reports* until `main` is protected. In
`Settings → Branches → Branch protection rules` for `main`, enable
**Require status checks to pass before merging** and select
**Enforce governance gate**, and **Do not allow bypassing the above settings**
(so it applies to administrators too). See the session notes for the full
branch-protection checklist tuned for a single maintainer.
