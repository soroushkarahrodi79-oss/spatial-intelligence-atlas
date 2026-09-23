# Immersive Globe Atlas — experimental prototype

**Status:** experimental prototype for maintainer review. **Not** a release, not
v0.3, not production. It does not touch the deployed v0.2.0 interface
(`/index.html`, `/styles.css`, `/app.js`) and does not modify `data/atlas.json`.

This prototype explores the approved *Immersive Globe Atlas* creative direction:
a 3D reference globe for the TERRITORY perspective, connected to the existing
EVIDENCE and DECISIONS perspectives, plus a case-specific evidence-to-outcome
reading experience.

---

## How to run

The prototype fetches the deployed dataset at `../../data/atlas.json`, so it must
be served **from the repository root** (not from this subdirectory):

```
# from the repository root:
python -m http.server 8000
```

Then open:

```
http://localhost:8000/prototype/immersive-globe/
```

`file://` will not work (browsers block `fetch`). If the fetch fails, the page
shows a styled instruction panel instead of a blank screen.

---

## What it contains

| File | Role |
|---|---|
| `index.html` | Entry point |
| `styles.css` | Restrained dark cartographic styling |
| `app.js` | Globe init, perspective switching, reading experience, fallback |
| `geo.json` | **Prototype-only** representative geographic locators (see below) |
| `SOURCES_AND_LICENSES.md` | Per-coordinate sources, library licences, scope gates |
| `vendor/globe.gl.min.js` | Globe.GL 2.46.2 standalone UMD build (MIT), bundles Three.js |
| `vendor/countries-110m.geojson` | Natural Earth 110m country outlines (public domain) |

### Representative locators, not study geometry

`geo.json` adds approximate **reference points** so the three cases can be placed
on a globe:

- HATI → Madrid (Atocha–Puerta de Alcalá corridor)
- SNTO → Parque Nacional de la Sierra de Guadarrama
- CHALUS → Western Mazandaran (Chalus / Nowshahr / Kelardasht)

These are indicative gazetteer coordinates from identifiable sources (GeoNames
for Madrid, a MITECO bounding-box midpoint for the park, OpenStreetMap for
Chalus) — see `SOURCES_AND_LICENSES.md` for the per-point citation. They are
**not** the bounded study-area geometries, administrative boundaries, or route
geometry used by the research, and this is stated in the UI on every case.
**FieldOS has no location** and is deliberately absent from the globe — it
remains a supporting instrument.

No fictional geographic flows, arcs, or connections between projects are drawn.

---

## Compatibility & licence report

- **Globe.GL 2.46.2** — MIT licence. The `dist/globe.gl.min.js` standalone build
  is self-contained: it bundles Three.js and Globe.GL's other dependencies
  (`three-globe`, `kapsule`, `three-render-objects`, `@tweenjs/tween.js`,
  `accessor-fn`). Vendored locally — **zero runtime network requests**.
- **Three.js** — MIT (bundled inside the Globe.GL build).
- **Natural Earth 110m countries** — public domain (Natural Earth), obtained as
  ready GeoJSON; no TopoJSON conversion library needed.
- **Architecture fit:** Globe.GL is a plain UMD global (`window.Globe`) and works
  with static HTML + a single `<script>` tag — no bundler, framework, or build
  step. It is compatible with the *static-hosting* architecture of the project.
- **It is NOT compatible with the frozen v0.2 DESIGN_CONTRACT** (WebGL, a large
  third-party library, a texture/geometry asset, and ambient motion are all
  outside that contract). That is expected for a prototype and is the subject of
  the "would require a new design contract" list below.

---

## Differences from the deployed v0.2.0

| | v0.2.0 (deployed) | This prototype |
|---|---|---|
| Territory view | Banded SVG node-link graph | 3D WebGL reference globe |
| Rendering | Inline SVG, vanilla JS, no libraries | Globe.GL (Three.js/WebGL) + SVG glyphs |
| Third-party code | None | Globe.GL + Three.js (vendored, MIT) |
| Assets | 4 files, no images | + globe library + country GeoJSON |
| Geography | Conceptual anchors only, no coordinates | Representative lat/lng locators (clearly flagged) |
| Motion | No ambient motion | Optional slow auto-rotate (off under reduced-motion, stops on interaction) |
| Decisions view | Verdict → case graph | Question → evidence → limitations → outcome → claim-ceiling reading strip |
| Narrow width | Structured outline fallback | Responsive; non-WebGL fallback lists locators; reading views are plain HTML |

### Preserved from v0.2.0 (unchanged)

- Three independent core cases + FieldOS as a supporting instrument.
- Zero entity-to-entity relationships; no invented flows.
- The evidence input-kind classifications, colours, dashes and glyphs.
- The documented outcomes, statements and claim ceilings, read from the dataset.
- The pinned source provenance and outbound-link behaviour.
- No scientific inference: outcomes are read, never computed.

---

## Changes that would require a new / revised design contract before integration

1. Introducing WebGL and a third-party rendering library (Globe.GL/Three.js).
2. Adding assets beyond the four-file budget (library + GeoJSON).
3. Adding real geographic coordinates at all — even representative ones —
   because v0.2 forbids coordinates/geometry; the "representative vs. study
   geometry" distinction would need to be a contract rule, not just UI copy.
4. Ambient motion (auto-rotate), which the current motion section forbids.
5. Camera interactions (orbit/zoom) beyond the five authorised interactions.
6. A larger performance/accessibility budget for a canvas-based view (the globe
   canvas is not keyboard-focusable; keyboard users navigate via the case
   controls, which would need to be a documented accessible-equivalent rule).
