// Cartographic plates (DESIGN_CONTRACT §8). Geometry is projected offline to
// EPSG:25830; the browser only scales metres into the plate frame. Plates are
// drawn at the container's real width so that plate text stays at 12 px and
// strokes stay at their specified widths. No basemap, tiles, pan or zoom.

import { h, s, ext, pin, label, CLASS_LABEL } from './dom.js';

const PAD = { t: 24, r: 24, b: 60, l: 28 }; // bottom band holds scale bar and north mark
const NICE = [50, 100, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 25000, 50000];

function ringPath(rings, X, Y) {
  return rings.map((ring) => ring.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join('') + 'Z').join('');
}

function featurePath(f, X, Y) {
  const g = f.geometry;
  const polys = g.type === 'MultiPolygon' ? g.coordinates : g.type === 'Polygon' ? [g.coordinates] : [];
  if (g.type === 'LineString') return g.coordinates.map(([x, y], i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)} ${Y(y).toFixed(1)}`).join('');
  return polys.map((p) => ringPath(p, X, Y)).join('');
}

function featureBox(f) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const walk = (c) => { if (typeof c[0] === 'number') { x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[0]); y0 = Math.min(y0, c[1]); y1 = Math.max(y1, c[1]); } else c.forEach(walk); };
  walk(f.geometry.coordinates);
  return [x0, y0, x1, y1];
}

function layers(fc) {
  const study = fc.features.filter((f) => f.properties.role !== 'context');
  const context = fc.features.filter((f) => f.properties.role === 'context');
  return { study, context };
}

// Full plate: frame, study area, context boundary, graticule ticks, scale
// bar, grid-north mark. W is the rendered width in CSS px.
function drawFull(W, db, plate) {
  const { geometry: gm } = plate;
  const fc = db.features.get(gm.id);
  const [bx0, by0, bx1, by1] = gm.display.bbox;
  const dx = bx1 - bx0, dy = by1 - by0;
  const innerW = W - PAD.l - PAD.r;
  let k = innerW / dx;
  const maxMapH = Math.max(200, Math.min(W, 640)) - PAD.t - PAD.b;
  if (dy * k > maxMapH) k = maxMapH / dy;
  const H = Math.round(PAD.t + PAD.b + dy * k);
  const ox = PAD.l + (innerW - dx * k) / 2;
  const X = (x) => ox + (x - bx0) * k;
  const Y = (y) => PAD.t + (by1 - y) * k;
  const { study, context } = layers(fc);

  const svg = s('svg', { class: 'plate-svg', viewBox: `0 0 ${W} ${H}`, width: W, height: H, focusable: 'false' });
  svg.append(s('rect', { class: 'frame', x: 0.5, y: 0.5, width: W - 1, height: H - 1 }));
  for (const f of study) svg.append(s('path', { class: 'area', d: featurePath(f, X, Y) }));
  for (const f of context) {
    svg.append(s('path', { class: 'ctx', d: featurePath(f, X, Y) }));
    const [cx0, cy0, cx1, cy1] = featureBox(f);
    if ((cx1 - cx0) * k < 80) { // label small context outlines on the plate; large ones are named in the key
      const lx = X(cx1) + 6, ly = (Y(cy0) + Y(cy1)) / 2 + 4;
      const name = f.properties.name.replace(/^Barrio \d+ /, '');
      const anchor = lx + name.length * 7.5 > W - PAD.r ? 'end' : 'start';
      svg.append(s('text', { class: 'plabel', x: anchor === 'end' ? X(cx0) - 6 : lx, y: ly, 'text-anchor': anchor }, name));
    }
  }

  // Graticule ticks on the neatline (offline positions). Every other label is
  // kept when the frame is narrow.
  const every = W < 480 ? 2 : 1;
  (gm.display.ticks.left || []).forEach((t, i) => {
    const y = Y(t.y);
    if (y < 10 || y > H - PAD.b) return;
    svg.append(s('line', { class: 'tick', x1: 0, y1: y, x2: 6, y2: y }));
    if (i % every === 0) svg.append(s('text', { x: 16, y, transform: `rotate(-90 16 ${y})`, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'halo' }, t.label));
  });
  (gm.display.ticks.bottom || []).forEach((t, i) => {
    const x = X(t.x);
    if (x < 34 || x > W - 34) return;
    svg.append(s('line', { class: 'tick', x1: x, y1: H, x2: x, y2: H - 6 }));
    if (i % every === 0) svg.append(s('text', { x, y: H - 10, 'text-anchor': 'middle', class: 'halo' }, t.label));
  });

  // Scale bar from projected metres: two alternating segments, round length.
  const mapW = dx * k;
  const L = NICE.filter((n) => n * k <= Math.min(mapW * 0.4, W - 140)).pop() || NICE[0];
  const seg = (L / 2) * k, sx = PAD.l, sy = H - PAD.b + 24;
  const km = L >= 1000;
  const fmt = (m) => (km ? String(+(m / 1000).toFixed(2)) : String(m));
  svg.append(s('rect', { class: 'bar-ink', x: sx, y: sy, width: seg, height: 4 }));
  svg.append(s('rect', { class: 'bar-paper', x: sx + seg, y: sy + 0.5, width: seg, height: 3 }));
  svg.append(s('text', { x: sx, y: sy - 6, 'text-anchor': 'start', class: 'halo' }, '0'));
  svg.append(s('text', { x: sx + seg, y: sy - 6, 'text-anchor': 'middle', class: 'halo' }, fmt(L / 2)));
  svg.append(s('text', { x: sx + 2 * seg, y: sy - 6, 'text-anchor': 'start', class: 'halo' }, `${fmt(L)} ${km ? 'km' : 'm'}`));

  // Grid-north mark (never presented as true north).
  const nx = W - PAD.r - 6, ny = H - PAD.b + 30;
  svg.append(s('path', { class: 'north', d: `M${nx} ${ny} V${ny - 26}` }));
  svg.append(s('path', { class: 'north-head', d: `M${nx - 4} ${ny - 19} L${nx} ${ny - 27} L${nx + 4} ${ny - 19}Z` }));
  svg.append(s('text', { x: nx - 10, y: ny - 10, 'text-anchor': 'end', class: 'plabel' }, W >= 520 ? 'GN · grid north (EPSG:25830)' : 'GN'));
  return svg;
}

// Thumbnail (lists, dossiers): frame kept, no ticks, no scale bar.
function drawThumb(db, plate, W = 160, H = 120) {
  const gm = plate.geometry;
  const fc = db.features.get(gm.id);
  const [bx0, by0, bx1, by1] = gm.display.bbox;
  const p = 10, k = Math.min((W - 2 * p) / (bx1 - bx0), (H - 2 * p) / (by1 - by0));
  const ox = (W - (bx1 - bx0) * k) / 2, oy = (H - (by1 - by0) * k) / 2;
  const X = (x) => ox + (x - bx0) * k, Y = (y) => oy + (by1 - y) * k;
  const { study, context } = layers(fc);
  return s('svg', { class: 'plate-svg', viewBox: `0 0 ${W} ${H}`, width: W, height: H, 'aria-hidden': 'true', focusable: 'false', preserveAspectRatio: 'xMidYMid meet' },
    s('rect', { class: 'frame', x: 0.5, y: 0.5, width: W - 1, height: H - 1, 'vector-effect': 'non-scaling-stroke' }),
    study.map((f) => s('path', { class: 'area', d: featurePath(f, X, Y), 'vector-effect': 'non-scaling-stroke' })),
    context.map((f) => s('path', { class: 'ctx', d: featurePath(f, X, Y), 'vector-effect': 'non-scaling-stroke' })));
}

// One ResizeObserver redraws every live plate at its own width.
const live = new ResizeObserver((entries) => {
  for (const e of entries) {
    const el = e.target;
    const W = Math.floor(el.clientWidth);
    if (!W || W === el._w) continue;
    el._w = W;
    const svg = drawFull(W, el._db, el._plate);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-labelledby', el.dataset.labelledby);
    el.replaceChildren(svg);
  }
});

export function describePlate(plate, fc) {
  const gm = plate.geometry;
  const [x0, y0, x1, y1] = gm.display.bbox;
  const [lat, lon] = gm.display.centroid_wgs84;
  const { study, context } = layers(fc);
  const names = [...study.map((f) => `${f.properties.name} (study area, shaded)`), ...context.map((f) => `${f.properties.name} (context boundary, dashed)`)];
  return `Outline map of ${names.join(' and ')}. Extent about ${((x1 - x0) / 1000).toFixed(1)} km east–west by ${((y1 - y0) / 1000).toFixed(1)} km north–south, `
    + `centred near ${lat.toFixed(2)}° N, ${Math.abs(lon).toFixed(2)}° W, displayed in ${gm.display.crs} with graticule ticks, a metric scale bar and a grid-north mark. Not for measurement.`;
}

// CC BY 4.0 requires the licence URI; it is given as plain text so that the
// only outbound links remain declared sources (SPEC I6).
export function ccUri(licence) {
  return /CC BY 4\.0/.test(licence || '') ? h('span.micro', ' · creativecommons.org/licenses/by/4.0/') : null;
}

// Required attribution, verbatim, plus the licence when the attribution does not already state it.
export function attributionLine(gm) {
  return gm.attribution.includes(gm.license) ? gm.attribution : `${gm.attribution} · ${gm.license}`;
}

// Plate key: names the drawn layers with their mark.
function key(fc) {
  const { study, context } = layers(fc);
  const sw = (cls) => s('svg', { class: 'key-swatch', viewBox: '0 0 22 12', width: 22, height: 12, 'aria-hidden': 'true', focusable: 'false' },
    cls === 'area' ? s('rect', { class: 'area', x: 1, y: 1, width: 20, height: 10 }) : s('path', { class: 'ctx', d: 'M1 6H21' }));
  return h('ul.key', study.map((f) => h('li', sw('area'), `${f.properties.name} — study area`)),
    context.map((f) => h('li', sw('ctx'), `${f.properties.name} — context boundary`)));
}

// Caption block (§8.3); "Not for measurement." is always the last line.
export function captionBlock(db, plate) {
  const gm = plate.geometry;
  const src = db.S.get(gm.source_id);
  const fc = db.features.get(gm.id);
  return h('dl.caption-block',
    h('dt', 'Key'), h('dd', key(fc)),
    h('dt', 'Source'), h('dd', ext(src.url, src.label), h('span.micro', ' @ ', pin(src.pinned_ref))),
    h('dt', 'Publisher'), h('dd', gm.publisher),
    h('dt', 'Licence'), h('dd', gm.license, ccUri(gm.license), h('br'), h('span.ink-2', gm.attribution), gm.reuse_note ? [h('br'), h('span.ink-2', gm.reuse_note)] : null),
    h('dt', 'Changes'), h('dd', `Feature(s) extracted from the source file, reprojected to ${gm.display.crs} and simplified at ${gm.simplification_m} m tolerance. No other edit.`),
    h('dt', 'CRS'), h('dd', `Displayed in ${gm.display.crs} (grid north) · original ${gm.crs.replace(/;.*$/, '')}`),
    h('dt', 'Simplified'), h('dd', h('span.micro', `${gm.simplification_m} m tolerance · sha256 `, h('span', gm.sha256.slice(0, 12)), h('span.sr-only', gm.sha256.slice(12)), '…')),
    h('dd.nfm', h('strong', 'Not for measurement.'), ' Geometry illustrates the study area documented by the source; it is not validated territory data.'));
}

let uid = 0;
// A full plate figure with title and caption; `heading` sets the title level.
export function plateFigure(db, plate, { heading = 'h2', caption = true } = {}) {
  const id = `plate-${plate.territory.id}-${++uid}`;
  const fc = db.features.get(plate.geometry.id);
  const holder = h('div.plate', { 'data-labelledby': `${id}-t ${id}-d` });
  holder._db = db;
  holder._plate = plate;
  live.observe(holder);
  return h('figure.plate-fig',
    holder,
    h(`${heading}.plate-title`, { id: `${id}-t` }, `Plate ${plate.n} · ${plate.territory.label}`),
    h('p.sr-only', { id: `${id}-d` }, describePlate(plate, fc)),
    caption && captionBlock(db, plate));
}

export function plateThumb(db, plate, cls = 'thumb') {
  return h(`a.${cls}`, { href: `#/atlas/${plate.territory.id}`, 'aria-label': `Plate ${plate.n}: ${plate.territory.label}` }, drawThumb(db, plate));
}

// ---- views

export function atlasView(db, { head, notice }) {
  const textOnly = db.territories.filter((t) => !t.geometry_id);
  return [
    head('Atlas', 'Where is the work situated?', 'Study areas drawn from published, licensed geometry only. Each plate states its source, licence, projection and simplification.'),
    notice(),
    h('ul.plate-grid', { 'aria-label': 'Plates' }, db.plates.map((p) => h('li.plate-card',
      h('a', { href: `#/atlas/${p.territory.id}`, 'aria-label': `Plate ${p.n}: ${p.territory.label}` }, drawThumb(db, p, 320, 240)),
      h('h2.plate-title', h('a', { href: `#/atlas/${p.territory.id}` }, `Plate ${p.n} · ${p.territory.label}`)),
      h('p.micro', attributionLine(p.geometry)),
      h('p.body-s.ink-2', db.itemsIn(p.territory.id).map((r) => r.short_title).join(' · '))))),
    h('section.text-territories', { 'aria-labelledby': 'tt' },
      h('h2.band-label.label', { id: 'tt' }, 'Territories without a plate'),
      h('ul.tt-list', textOnly.map((t) => h('li',
        h('p.heading', t.label),
        h('p.body-s', t.basis),
        h('p.body-s.ink-2', t.territory_note),
        h('p.ui', 'Items: ', db.itemsIn(t.id).map((r, i) => [i ? ' · ' : '', h('a', { href: `#/research/${r.id}` }, r.short_title)])))))),
  ];
}

export function plateView(db, tid, { notice }) {
  const plate = db.plateOf(tid);
  if (!plate) return null;
  const t = plate.territory;
  const items = db.itemsIn(tid);
  return {
    title: `Plate ${plate.n} · ${t.label}`,
    nodes: [
      h('nav.breadcrumb', { 'aria-label': 'Breadcrumb' }, h('a', { href: '#/atlas' }, 'Atlas'), ' / ', h('span', { 'aria-current': 'page' }, `Plate ${plate.n}`)),
      h('div.view-head',
        label('Cartographic plate'),
        h('h1.title', { tabindex: '-1' }, `Plate ${plate.n} · ${t.label}`),
        h('p.micro.coord', `${plate.geometry.display.centroid_wgs84[0].toFixed(4)}° N · ${Math.abs(plate.geometry.display.centroid_wgs84[1]).toFixed(4)}° W · ${plate.geometry.display.crs}`)),
      h('div.plate-page',
        h('div.plate-main', plateFigure(db, plate, { heading: 'p' })),
        h('aside.plate-side', { 'aria-label': 'About this territory' },
          h('h2.band-label.label', 'Why this territory'),
          h('p.body-s', t.basis),
          h('h2.band-label.label.mt', 'Items situated here'),
          h('ul.situated', items.map((r) => h('li', h('a.textlink', { href: `#/research/${r.id}` }, r.title), h('span.label.class-line', CLASS_LABEL[r.class])))),
          notice())),
    ],
  };
}
