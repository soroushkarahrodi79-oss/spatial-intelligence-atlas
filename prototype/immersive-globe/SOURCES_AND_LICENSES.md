# Sources, compatibility and licence record

For the `immersive-globe` experimental prototype. This prototype does not change
any deployed file: `main` remains `v0.2.0`, and `data/atlas.json` is read
read-only. Verified 2026-09-22.

## Rendering library

- **Globe.GL 2.46.2** — MIT licence. Repository:
  https://github.com/vasturiano/globe.gl · licence:
  https://github.com/vasturiano/globe.gl/blob/master/LICENSE
- Vendored **locally** as `vendor/globe.gl.min.js`, the published standalone
  UMD/browser bundle (`dist/globe.gl.min.js`, `unpkg` field in the package's
  `package.json`). It is self-contained: it bundles Three.js (MIT) and the other
  runtime dependencies (`three-globe`, `kapsule`, `three-render-objects`,
  `@tweenjs/tween.js`, `accessor-fn`). **No CDN and zero runtime network
  requests.** Unlike the offline reference draft, the WebGL globe was executed
  and confirmed rendering in a real browser (see the verification report), not
  assumed from compilation or the fallback.

## Global land / country context

- **Natural Earth 1:110m Admin-0 countries** — public domain
  (https://www.naturalearthdata.com/about/terms-of-use/). Vendored as
  `vendor/countries-110m.geojson` (ready GeoJSON, 177 features), used to draw
  hairline country outlines over a built-in graticule as a restrained
  cartographic backdrop. No runtime build step or geometry library is required.
- **Simplified borders (shipped default):** `vendor/countries-110m.min.geojson`
  is a Douglas–Peucker simplification (tolerance 0.6°, coordinates rounded to 3
  decimals) of the above, generated once at dev time by
  `vendor/countries-simplify.mjs` (a plain Node script, **not** loaded at
  runtime). It cuts vertices 10,654 → 2,793 (26%), features 177 → 168 (9 sub-pixel
  islands collapse), and payload 488 KB → 63 KB, to reduce three-globe
  tessellation cost on mobile. The app loads the simplified file by default and
  the original via `?borders=full` (for before/after comparison). At world/mobile
  zoom the two are visually indistinguishable.
- Do not use this generalised 1:110m basemap for surveying, disputed-border
  claims, localor current political-boundary analysis. It is context only.

## Territorial reference positions (visual anchors only)

All three are **representative locators**, not study geometry, boundaries, or
routes. Coordinates live in `geo.json`.

- **HATI / Madrid — 40.4165, -3.7026.** GeoNames approximate coordinates for
  Madrid city (ES): https://www.geonames.org/search.html?country=ES&q=Madrid .
  A city locator, not either frozen Atocha–Puerta de Alcalá route. Verdict
  source: the HATI Gate 3B decision pinned in `data/atlas.json` (`s-hati-gate3b`).
- **SNTO / PNSG — 40.8876, -3.9347.** Design-only midpoint of the national
  park's published coordinate extremes (MITECO park fact sheet:
  https://www.miteco.gob.es/es/parques-nacionales-oapn/red-parques-nacionales/parques-nacionales/guadarrama/ficha-tecnica.html
  ). A bounding-box midpoint need not lie inside the park, so this is NOT a
  validated interior point, centroid, or study-unit marker. Verdict source:
  SNTO decision brief pinned in `data/atlas.json` (`s-snto-brief`).
- **CHALUS / Western Mazandaran — 36.6506, 51.4224.** OpenStreetMap gazetteer
  coordinates for Chalus city. Not the historical road network or study extent.
  Verdict source: CHALUS Gate 2A-R closeout pinned in `data/atlas.json`
  (`s-chalus-closeout`).
- **FieldOS — no marker.** Supporting instrument with no case-specific
  territory in v0.2.0; deliberately absent from the globe.

## Out of scope / approval gates

No scientific-dataset migration, new scientific assertion, historical road
reconstruction, thermal or vegetation layer, study geometry, tourist flow,
cross-project link, ranking, or real-time monitoring is introduced. A 3D
WebGL facade, a third-party library, added assets, and ambient motion all
diverge from the frozen v0.2 `DESIGN_CONTRACT.md`; prototype approval must
precede any proposal to revise that contract or merge an implementation.
