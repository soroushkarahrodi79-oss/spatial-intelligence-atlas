# v0.4 development record (not loaded by the page)

Decision E5 (maintainer, 2026-11-26) excludes hypothetical and conceptual
relations from the production graph and keeps them only here. Decision E2
defers four items. Nothing in this file is evidence, and nothing in it is
shown by the Atlas. Full records, with sources pinned to line ranges, are in
PR #22 (`prototype/v0.4-knowledge-graph/graph.json`, head `8d69a7d`).

## Excluded readings

| Reading | Kind | Why it is excluded |
|---|---|---|
| SNTO (VIS-001) → FieldOS, “possible future application” | hypothetical | VIS-001's README names FieldOS/SNTO only as a transfer domain that “would need its own field-domain validation”. Nothing was transferred, and FieldOS lists SNTO/HATI integration as a non-goal. |
| Network Accessibility Pilot ~ Madrid Transit Graph | conceptual (analyst) | Both model networks, but the networks, measures and questions differ; their sources name different methods. |
| Madrid Isovist Demo ~ PNOA-LiDAR pilot | conceptual (analyst) | Both describe urban form near Lavapiés, but the extents are not compared, the inputs differ and neither validates the other. |
| HATI pedestrian extension situated in the pilot box | rejected | “The same corridor” is not the same study area; overlap is not computed. |

## Deferred items

| Item | Documented links (not published) | Reason |
|---|---|---|
| SNTO Alpine Edition | derived from the SNTO observatory (`isDerivedFrom`); Sentinel-2; Sierra Nevada | E2: deferred as a separate item. |
| SK Spatial Intelligence Lab | hosts the Madrid Evidence MCP | E2: deferred; no licence file (E1 would allow a reference only). |
| Tourism Intelligence Desk | reads HATI pilot and SNTO — PNSG snapshots | Outside the v0.4 candidate list; no licence. Its “independently re-executed” wording describes an owner reproduction. |
| Spatial Investigation Studio | depends on the MCP | Local, unhosted, unvalidated interface. |

Re-entry of any of these needs its own content freeze and a gated change.
