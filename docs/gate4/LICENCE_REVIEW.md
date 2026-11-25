# Licence compatibility review — v0.3.0 (Gate 4, D4)

**Status:** prepared for the maintainer's decision. **Not approved.** Until the
maintainer approves, the Atlas keeps stating "Licence pending maintainer
approval" (`DESIGN_CONTRACT.md` §15), and no `LICENSE` file is placed at the
repository root. The proposed files are staged in `docs/gate4/proposed/`.

This review checks what the repository contains, who holds rights in it,
and whether the preferred direction (MIT for original code, CC BY 4.0 for
original data and text) can apply to it. It is not legal advice.

## 1. Proposed scheme

| Scope | Licence | Files |
|---|---|---|
| Original code | **MIT** | `index.html`, `styles.css`, `js/*.js`, `tools/validate_atlas.py`, `.github/workflows/*.yml` |
| Original data and text | **CC BY 4.0** | the authored parts of `data/atlas.json` (structure, labels, paraphrases, notes, metadata); `README.md`, `SPEC.md`, `DESIGN_CONTRACT.md`, `PROJECT_STATUS.md`, `docs/**/*.md`, `CITATION.cff` |
| Third-party and separately licensed material | **its own licence, excluded from both grants** | §3 below |

The repository has no runtime dependency, no vendored code and no web
font, so the MIT grant carries no third-party code. axe-core and
Playwright were used only in a scratch environment for verification and
are not in the repository.

## 2. Compatibility findings

| # | Material | Rights holder and licence | Finding |
|---|---|---|---|
| L1 | `data/geometry/g-san-isidro.json`, `g-madrid-municipality.json` | Ayuntamiento de Madrid, **CC BY 4.0** (`s-lens-geography`) | Redistribution allowed. CC BY 4.0 §3(a) needs attribution, the licence URI and an indication of changes. **Fixed at this gate:** each plate caption now gives the licence URI (as plain text, to keep SPEC I6) and a "Changes" row (feature extraction, reprojection, simplification tolerance). Compatible if excluded from the Atlas's own grant: it keeps its own CC BY 4.0 with the Ayuntamiento's attribution. |
| L2 | `data/geometry/g-pnsg-boundary.json` | Organismo Autónomo Parques Nacionales; **OAPN/MITECO reuse terms**, no Creative Commons licence (`s-oapn-catalogue`, `s-miteco-legal`) | Reuse is allowed without express authorisation if the source is cited. "Fuente: Organismo Autónomo Parques Nacionales" is present on the plate, the Atlas cards and the Overview credit. The MITECO notice (re-read 2026-11-25) adds two conditions: do not imply that the public body participates in, sponsors or supports the reuse; and keep any update-date and reuse-condition metadata of the source document. The Atlas implies no endorsement. The pinned source file carries no update-date or reuse-condition metadata (its attributes are name, declaration date and act, area and links), so none was removed. **Must stay excluded** from the CC BY grant: these terms are not CC BY and cannot be relicensed. |
| L3 | `assets/figures/fig-hati-1…4.webp` | S. Karahrodi (the maintainer); **CC BY 4.0** in the deposited preprint (PDF p. 18 and Zenodo metadata; PDF MD5 `083ed0f9…66e0` re-checked) | Compatible. Each figure shows its credit line, DOI and licence (now with the licence URI); the format conversion is stated. Figure 1(a) shows OpenStreetMap-derived asset locations, and its credit carries the ODbL produced-work notice "© OpenStreetMap contributors (ODbL 1.0)". Exclude from the Atlas grant: it is already CC BY 4.0 under the preprint. |
| L4 | `assets/figures/fig-net-1.webp` | S. Karahrodi; image from the **MIT**-licensed repository `madrid-tourism-intelligence-lens` @ `ad7ed9b` | Compatible. The image embeds its own attribution (Ayuntamiento de Madrid CC BY 4.0; © OpenStreetMap contributors, ODbL 1.0), kept unaltered; the downscale and WebP conversion are stated. Exclude from the Atlas grant: it keeps MIT plus its embedded notices. |
| L5 | Verbatim quotations in `data/atlas.json`: every `basis`, every `verdict_label`, the research questions marked "verbatim", and the quoted reuse terms | Mostly the maintainer's own repositories, with differing licences (HATI documents `not_stated`, SNTO custom academic-use, Lens and network pilot MIT, FieldOS Apache-2.0, preprint CC BY 4.0), plus short third-party quotations (OAPN catalogue, MITECO notice, Copernicus attribution string) | Quotations appear as quotations, with their source. Third-party quotations cannot be relicensed and must be excluded. For the maintainer's own sources there are two options: (a) **exclude all verbatim quotations** from the CC BY grant (recommended: one simple rule); or (b) as rights holder, also license the own-source quotations under CC BY 4.0. |
| L6 | `docs/gate3/screenshots/*.webp` | The maintainer, but they depict L1–L4 | The Atlas parts can be CC BY 4.0; the depicted geometry and figures keep the L1–L4 terms. Covered by the exclusion list. |
| L7 | SNTO licence discrepancy (Q4) | — | No SNTO code, data or figure is in this repository; the Atlas only cites it. No compatibility effect. |
| L8 | HATI route geometry (ODbL 1.0) | — | **Not in the repository** (A-Q1 not approved). No ODbL database is distributed, so no share-alike obligation arises. If A-Q1 is approved later, the route file must be a separate file under ODbL 1.0 with its own notice, excluded from the CC BY grant. |

**Conclusion.** MIT for original code and CC BY 4.0 for original data and
text are compatible with everything the repository contains, **provided
the exclusions in §3 are stated** in the licence files. No share-alike or
non-commercial material is included.

## 3. Explicit third-party exclusions (carried into `LICENSE-CONTENT.md`)

1. `data/geometry/g-san-isidro.json`, `data/geometry/g-madrid-municipality.json`: © Ayuntamiento de Madrid, CC BY 4.0, modified as stated in the plate captions.
2. `data/geometry/g-pnsg-boundary.json`: Fuente: Organismo Autónomo Parques Nacionales; OAPN/MITECO reuse terms; no Creative Commons licence.
3. `assets/figures/fig-hati-1.webp` … `fig-hati-4.webp`: Karahrodi, S. (2026), preprint v1.0, DOI 10.5281/zenodo.22707470, CC BY 4.0. Figure 1 includes data © OpenStreetMap contributors (ODbL 1.0).
4. `assets/figures/fig-net-1.webp`: from `madrid-tourism-intelligence-lens` (MIT), with its embedded notices (Ayuntamiento de Madrid CC BY 4.0; © OpenStreetMap contributors, ODbL 1.0).
5. Verbatim quotations in `data/atlas.json` and in the documents (fields `basis` and `verdict_label`, text marked "verbatim", quoted terms of use): under the terms of their cited sources.
6. Depictions of items 1–4 in screenshots.

## 4. Maintainer decisions (D4)

| # | Decision | Recommendation |
|---|---|---|
| D4-a | Approve MIT for original code | Approve |
| D4-b | Approve CC BY 4.0 for original data and text, with the §3 exclusions | Approve |
| D4-c | Own-source quotations: exclude (option a) or license (option b) | Option a |
| D4-d | Optional precaution for L2: add "OAPN does not participate in, sponsor or support this reuse" to the PNSG caption | Optional; not required by the terms as read |

**On approval (mechanical steps):**

- move `docs/gate4/proposed/LICENSE` and `LICENSE-CONTENT.md` to the
  repository root;
- set `meta.license` in `data/atlas.json` to "Code: MIT. Original data and
  text: CC BY 4.0. Third-party material keeps its own licence (see
  LICENSE-CONTENT.md).";
- add the `license` block to `CITATION.cff`.
