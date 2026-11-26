// Knowledge Graph view (SPEC.md §13.5–§13.7, DESIGN_CONTRACT.md §17).
// A typed, source-pinned graph of documented relationships, drawn as native
// SVG with a deterministic layered layout: the same data and state always
// give the same picture. Nothing here ranks, scores or weights items, and
// nothing is inferred: every line is a record in data/relationships.json and
// every answer below is computed from those records and links back to them.
//
// Graph state lives in the route query (#/graph?view=…&node=…). In-graph
// changes replace the current history entry, so the URL is always a deep
// link to the visible state without filling the history.

import { h, s, ext, pin, CLASS_LABEL, PUB_TYPE } from './dom.js';

const KIND_LABEL = { research: 'Research item', method: 'Method', dataset: 'Dataset', territory: 'Territory', output: 'Output' };
const KIND_PLURAL = { method: 'Methods', dataset: 'Datasets', territory: 'Territories', output: 'Outputs' };
const CLASS_ORDER = ['technical', 'structural', 'methodological', 'territorial'];
const FILTER_KINDS = ['method', 'dataset', 'territory', 'output'];
// Reading order for items: families stay together. It is never a ranking.
const ORDER = ['r-hati-pilot', 'r-hati-pedestrian', 'p-lens', 'r-network-pilot', 'e-pnoa-lidar', 'i-madrid-mcp',
  'r-snto-pnsg', 'p-snto', 'i-fieldos', 'e-transit-graph', 'e-isovist'];
const T_SHORT = {
  't-madrid': 'Madrid (municipality)', 't-madrid-central': 'Prado–Retiro–Atocha box', 't-madrid-atocha-alcala': 'Atocha → Puerta de Alcalá',
  't-san-isidro': 'San Isidro (113)', 't-pnsg': 'Sierra de Guadarrama NP', 't-metro-madrid': 'Metro de Madrid network',
  't-lavapies-isovist': 'Lavapiés (isovist area)', 't-embajadores': 'Embajadores (012)',
};
const ABSENCE = 'No documented relation in the reviewed sources. This does not prove that none exists.';

const VIEWS = [
  { id: 'ecosystem', label: 'Ecosystem', title: 'Research ecosystem', kinds: ['research'],
    preds: ['depends_on', 'consumes_output_of', 'hosts', 'extends'], cols: 'layered',
    note: 'Items and the documented links between them. Arrows run from the dependent, reading, extending or hosting item to the item it relies on or hosts.' },
  { id: 'methods', label: 'Methods', title: 'Methodology', kinds: ['research', 'method'],
    preds: ['applies_method', 'extends'], cols: (n) => (n.kind === 'method' ? 1 : 0),
    note: 'Each item links to the method its own methodology source names. A shared method node means a named method in common, not shared configuration, inputs or validity.' },
  { id: 'data', label: 'Data & outputs', title: 'Datasets and outputs', kinds: ['dataset', 'research', 'output'],
    preds: ['uses_dataset', 'has_output', 'consumes_output_of'], cols: (n) => ({ dataset: 0, research: 1, output: 2 })[n.kind],
    note: 'Datasets on the left, items in the centre, outputs on the right. Each dataset link records the extract, product or vintage used: a shared dataset family does not make observations comparable.' },
  { id: 'territories', label: 'Territories', title: 'Territorial frame', kinds: ['research', 'territory'],
    preds: ['situated_in', 'within'], cols: null,
    note: 'Items link to the territory their source names; a smaller territory links to the one that contains it. Positions are not geographic, and overlap is never computed.' },
];
const FOCUS = { id: 'focus', label: 'Neighbourhood', title: 'Neighbourhood',
  note: 'The selected node in the centre; relations pointing to it on the left, relations it points from on the right, across all views.' };

// ------------------------------------------------------------------ model

let M = null;
function model(db) {
  if (M && M.db === db) return M;
  const rel = db.rel;
  const nodes = new Map();
  for (const r of db.order) {
    const o = db.of(r.id).outcome;
    nodes.set(r.id, { id: r.id, kind: 'research', cls: r.class, title: r.title, short: r.short_title, state: o ? o.verdict_label : null,
      lifecycle: r.lifecycle_status, version: r.version, summary: r.summary, sources: r.source_ids,
      findings: db.of(r.id).findings, ceiling: o ? o.claim_ceiling : r.claim_limits || null, href: `#/research/${r.id}` });
  }
  for (const m of rel.methods) nodes.set(m.id, { id: m.id, kind: 'method', title: m.title, short: m.short, summary: m.note });
  for (const d of rel.datasets) nodes.set(d.id, { id: d.id, kind: 'dataset', title: d.title, short: d.short, summary: d.note, publisher: d.publisher, licence: d.license });
  for (const t of db.territories) {
    nodes.set(t.id, { id: t.id, kind: 'territory', title: t.label, short: T_SHORT[t.id] || t.label, summary: t.basis, note: t.territory_note,
      sources: t.source_ids, href: t.geometry_id ? `#/atlas/${t.id}` : null });
  }
  for (const o of db.outputs) {
    const idf = o.identifier.availability === 'pid' ? o.identifier.scheme.toUpperCase() : 'no PID';
    nodes.set(o.id, { id: o.id, kind: 'output', title: o.citation, short: `${PUB_TYPE[o.publication_type]} · ${idf}`,
      owner: o.research_id, sources: [o.source_id] });
  }
  const edges = rel.relationships.filter((e) => nodes.has(e.source) && nodes.has(e.target));
  M = { db, rel, nodes, edges, byId: new Map(edges.map((e) => [e.id, e])),
    preds: new Map(rel.predicates.map((p) => [p.id, p])), classes: new Map(rel.classes.map((c) => [c.id, c])) };
  return M;
}

const ordIdx = (id) => { const i = ORDER.indexOf(id); return i < 0 ? 100 : i; };
const nm = (id) => M.nodes.get(id).short;
const predLabel = (e) => M.preds.get(e.predicate).label;
function sub(n) {
  if (n.kind === 'research') return CLASS_LABEL[n.cls].toUpperCase();
  if (n.kind === 'output') return `OUTPUT · ${nm(n.owner)}`.toUpperCase();
  return KIND_LABEL[n.kind].toUpperCase();
}

// ------------------------------------------------------------------ state

const DEFAULT = () => ({ view: 'ecosystem', node: null, edge: null, focus: null, q: null, cls: new Set(CLASS_ORDER), kinds: new Set(FILTER_KINDS) });
let st = DEFAULT();

function readQuery(q) {
  const n = DEFAULT();
  const v = q.get('view');
  n.view = [...VIEWS.map((x) => x.id), 'focus'].includes(v) ? v : 'ecosystem';
  if (q.get('focus') && M.nodes.has(q.get('focus'))) n.focus = q.get('focus');
  if (n.view === 'focus' && !n.focus) n.view = 'ecosystem';
  if (q.get('node') && M.nodes.has(q.get('node'))) n.node = q.get('node');
  else if (q.get('edge') && M.byId.has(q.get('edge'))) n.edge = q.get('edge');
  else if (q.get('q') && QUESTIONS.some((x) => x.id === q.get('q'))) n.q = q.get('q');
  if (q.has('cls')) n.cls = new Set(q.get('cls').split('.').filter((c) => CLASS_ORDER.includes(c)));
  if (q.has('hide')) for (const k of q.get('hide').split('.')) n.kinds.delete(k);
  return n;
}
function queryOf() {
  const p = new URLSearchParams();
  p.set('view', st.view);
  if (st.view === 'focus' && st.focus) p.set('focus', st.focus);
  if (st.node) p.set('node', st.node);
  else if (st.edge) p.set('edge', st.edge);
  else if (st.q) p.set('q', st.q);
  if (st.cls.size !== CLASS_ORDER.length) p.set('cls', [...st.cls].join('.'));
  const hidden = FILTER_KINDS.filter((k) => !st.kinds.has(k));
  if (hidden.length) p.set('hide', hidden.join('.'));
  return `#/graph?${p.toString()}`;
}
const writeUrl = () => history.replaceState(history.state, '', queryOf());

// ------------------------------------------------------------------ view graph

const kindOn = (n) => n.kind === 'research' || st.kinds.has(n.kind);
const edgeOn = (e) => st.cls.has(e.class) && kindOn(M.nodes.get(e.source)) && kindOn(M.nodes.get(e.target));

function viewGraph() {
  if (st.view === 'focus' && st.focus) {
    const edges = M.edges.filter((e) => edgeOn(e) && (e.source === st.focus || e.target === st.focus));
    const ids = new Set([st.focus]);
    edges.forEach((e) => { ids.add(e.source); ids.add(e.target); });
    return { view: FOCUS, nodes: [...ids].map((id) => M.nodes.get(id)), edges, band: [] };
  }
  const V = VIEWS.find((v) => v.id === st.view);
  const kinds = new Set(V.kinds);
  const edges = M.edges.filter((e) => V.preds.includes(e.predicate) && edgeOn(e)
    && kinds.has(M.nodes.get(e.source).kind) && kinds.has(M.nodes.get(e.target).kind));
  const touched = new Set(edges.flatMap((e) => [e.source, e.target]));
  const nodes = [], band = [];
  for (const n of M.nodes.values()) {
    if (!kinds.has(n.kind) || !kindOn(n)) continue;
    if (touched.has(n.id)) nodes.push(n);
    else if (n.kind === 'research') band.push(n);
  }
  band.sort((a, b) => ordIdx(a.id) - ordIdx(b.id));
  return { view: V, nodes, edges, band };
}

// ------------------------------------------------------------------ layout
// Sugiyama-style layered layout. Columns come from the view (or from the
// longest path to a sink for the ecosystem). Edges that span several columns
// get virtual waypoints, so they pass through reserved gaps instead of over
// labels. Column widths are measured from the real label text.

const NODE_H = 58, VIRT_H = 22, GAP_X = 104, PAD_GLYPH = 16;
let ctx2d = null;
function textW(text, font) {
  if (!ctx2d) ctx2d = document.createElement('canvas').getContext('2d');
  ctx2d.font = font;
  return ctx2d.measureText(text).width;
}
function fonts() {
  const cs = getComputedStyle(document.documentElement);
  return { label: `600 14.5px ${cs.getPropertyValue('--font-sans')}`, sub: `400 11px ${cs.getPropertyValue('--font-mono')}` };
}
function nodeW(n, f) { return PAD_GLYPH + Math.ceil(Math.max(textW(n.short, f.label), textW(sub(n), f.sub) * 1.04)); }

function columns(G) {
  const col = new Map();
  if (G.view.id === 'focus') {
    for (const n of G.nodes) {
      if (n.id === st.focus) col.set(n.id, 1);
      else col.set(n.id, G.edges.some((e) => e.source === n.id && e.target === st.focus) ? 0 : 2);
    }
  } else if (G.view.cols === 'layered') {
    const out = new Map(G.nodes.map((n) => [n.id, []]));
    G.edges.forEach((e) => out.get(e.source).push(e.target));
    const memo = new Map();
    const height = (id, d = 0) => {
      if (memo.has(id)) return memo.get(id);
      const v = d > 40 ? 0 : Math.max(0, ...out.get(id).map((t) => height(t, d + 1) + 1));
      memo.set(id, v);
      return v;
    };
    const maxH = Math.max(0, ...G.nodes.map((n) => height(n.id)));
    G.nodes.forEach((n) => col.set(n.id, maxH - height(n.id)));
  } else if (G.view.id === 'territories') {
    const child = new Set(), parent = new Set();
    G.edges.forEach((e) => { if (e.predicate === 'within') { child.add(e.source); parent.add(e.target); } });
    G.nodes.forEach((n) => col.set(n.id, n.kind === 'research' ? 0 : parent.has(n.id) && !child.has(n.id) ? 2 : 1));
  } else {
    G.nodes.forEach((n) => col.set(n.id, G.view.cols(n)));
  }
  return col;
}

function layout(G) {
  const f = fonts();
  const col = columns(G);
  const ncol = Math.max(0, ...col.values()) + 1;
  const cols = Array.from({ length: ncol }, () => []);
  const items = new Map(); // id -> {id, virt, h, w, n}
  const keys = [...M.nodes.keys()];
  const sorted = [...G.nodes].sort((a, b) => ordIdx(a.id) - ordIdx(b.id) || keys.indexOf(a.id) - keys.indexOf(b.id));
  for (const n of sorted) {
    items.set(n.id, { id: n.id, virt: false, h: NODE_H, w: nodeW(n, f), n });
    cols[col.get(n.id)].push(n.id);
  }
  // virtual waypoints for edges spanning more than one column
  const chain = new Map();
  for (const e of G.edges) {
    const a = col.get(e.source), b = col.get(e.target);
    const ids = [];
    if (Math.abs(a - b) > 1) {
      const step = a < b ? 1 : -1;
      for (let c = a + step; c !== b; c += step) {
        const vid = `~${e.id}~${c}`;
        items.set(vid, { id: vid, virt: true, h: VIRT_H, w: 0 });
        cols[c].push(vid);
        col.set(vid, c);
        ids.push(vid);
      }
    }
    chain.set(e.id, ids);
  }
  const nbrs = new Map([...items.keys()].map((k) => [k, []]));
  for (const e of G.edges) {
    const path = [e.source, ...chain.get(e.id), e.target];
    for (let i = 0; i < path.length - 1; i++) { nbrs.get(path[i]).push(path[i + 1]); nbrs.get(path[i + 1]).push(path[i]); }
  }
  // y positions from stacking each column in its current order
  const y = new Map();
  const stack = (c) => {
    const total = c.reduce((acc, id) => acc + items.get(id).h, 0);
    let acc = -total / 2;
    for (const id of c) { const it = items.get(id); y.set(id, acc + it.h / 2); acc += it.h; }
  };
  cols.forEach(stack);
  // ordering: barycentre sweeps (deterministic, stable ties)
  for (let it = 0; it < 8; it++) {
    const seq = it % 2 ? [...cols.keys()].reverse() : [...cols.keys()];
    for (const ci of seq) {
      const c = cols[ci];
      const key = new Map(c.map((id, i) => {
        const ns = nbrs.get(id).filter((o) => col.get(o) !== ci);
        return [id, [ns.length ? ns.reduce((a, o) => a + y.get(o), 0) / ns.length : y.get(id), i]];
      }));
      c.sort((a, b) => key.get(a)[0] - key.get(b)[0] || key.get(a)[1] - key.get(b)[1]);
      stack(c);
    }
  }
  // straighten: pull each item towards its neighbours, then resolve overlaps in order
  for (let round = 0; round < 4; round++) {
    for (const c of cols) {
      const want = c.map((id) => {
        const ns = nbrs.get(id).filter((o) => col.get(o) !== col.get(id));
        return ns.length ? ns.reduce((a, o) => a + y.get(o), 0) / ns.length : y.get(id);
      });
      const pos = want.slice();
      for (let i = 1; i < c.length; i++) {
        const min = pos[i - 1] + (items.get(c[i - 1]).h + items.get(c[i]).h) / 2;
        if (pos[i] < min) pos[i] = min;
      }
      for (let i = c.length - 2; i >= 0; i--) {
        const max = pos[i + 1] - (items.get(c[i + 1]).h + items.get(c[i]).h) / 2;
        if (pos[i] > max) pos[i] = max;
      }
      c.forEach((id, i) => y.set(id, Math.round(pos[i])));
    }
  }
  // column x from measured label widths
  const colW = cols.map((c) => Math.max(40, ...c.map((id) => items.get(id).w)));
  const colX = [];
  let x = 0;
  for (let c = 0; c < ncol; c++) { colX[c] = x; x += colW[c] + GAP_X; }
  const pos = new Map();
  for (const [id, it] of items) pos.set(id, { x: colX[col.get(id)], y: y.get(id), w: it.w, virt: it.virt, col: col.get(id) });

  // unconnected band below the graph
  let band = null;
  if (G.band.length) {
    const ys = [...pos.values()].map((p) => p.y);
    const top = (ys.length ? Math.max(...ys) : 0) + NODE_H + 40;
    const bw = Math.max(...G.band.map((n) => nodeW(n, f))) + GAP_X / 2;
    const per = Math.max(1, Math.min(G.band.length, Math.max(3, ncol)));
    G.band.forEach((n, k) => pos.set(n.id, { x: (k % per) * bw, y: top + 56 + Math.floor(k / per) * NODE_H, w: nodeW(n, f), virt: false, band: true }));
    band = { y: top, w: Math.max(per * bw, x - GAP_X) };
  }
  return { pos, chain, colX, colW, band, G };
}

// ------------------------------------------------------------------ edge geometry

function route(Lay, e) {
  const a = Lay.pos.get(e.source), b = Lay.pos.get(e.target);
  const wps = Lay.chain.get(e.id).map((id) => Lay.pos.get(id));
  if (a.col === b.col) {
    const dx = 46 + Math.abs(a.y - b.y) * 0.18;
    const p0 = { x: a.x - 13, y: a.y }, p3 = { x: b.x - 13, y: b.y };
    const d = `M${p0.x},${p0.y} C${p0.x - dx},${p0.y} ${p3.x - dx},${p3.y} ${p3.x},${p3.y}`;
    return { d, mid: { x: p0.x - dx * 0.75, y: (p0.y + p3.y) / 2 }, anchor: 'end' };
  }
  const rightward = b.col > a.col;
  const pts = [];
  pts.push(rightward ? { x: a.x + a.w + 6, y: a.y } : { x: a.x - 13, y: a.y });
  for (const w of wps) {
    const cw = Lay.colW[w.col];
    if (rightward) pts.push({ x: w.x - 6, y: w.y }, { x: w.x + cw + 6, y: w.y });
    else pts.push({ x: w.x + cw + 6, y: w.y }, { x: w.x - 6, y: w.y });
  }
  pts.push(rightward ? { x: b.x - 13, y: b.y } : { x: b.x + b.w + 6, y: b.y });
  let d = `M${pts[0].x},${pts[0].y}`;
  let best = null;
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i - 1], q = pts[i];
    if (i % 2 === 0 && wps.length) {
      d += ` L${q.x},${q.y}`; // straight run through a reserved gap
    } else {
      const mx = (p.x + q.x) / 2;
      d += ` C${mx},${p.y} ${mx},${q.y} ${q.x},${q.y}`;
    }
    const len = Math.abs(q.x - p.x);
    if (!best || len > best.len) best = { len, x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  }
  return { d, mid: { x: best.x, y: best.y }, anchor: 'middle' };
}

// ------------------------------------------------------------------ drawing

function glyph(n) {
  const g = s('g', { class: `kg-glyph kg-k-${n.kind}` });
  if (n.kind === 'research') {
    if (n.cls === 'documented_research') g.append(s('circle', { r: 8, class: 'kg-solid' }));
    else if (n.cls === 'experiment') g.append(s('circle', { r: 8, class: 'kg-open' }), s('circle', { r: 3, class: 'kg-solid' }));
    else if (n.cls === 'research_platform') g.append(s('rect', { x: -7.5, y: -7.5, width: 15, height: 15, class: 'kg-solid' }));
    else g.append(s('path', { d: 'M0 -9.5 L9.5 0 L0 9.5 L-9.5 0 Z', class: 'kg-solid' }));
  } else if (n.kind === 'method') g.append(s('path', { d: 'M0 -9 L8.5 6.5 L-8.5 6.5 Z', class: 'kg-open' }));
  else if (n.kind === 'dataset') g.append(s('rect', { x: -8.5, y: -7, width: 17, height: 14, class: 'kg-open' }), s('path', { d: 'M-8.5 -2.5 H8.5 M-2.5 -2.5 V7', class: 'kg-line' }));
  else if (n.kind === 'territory') g.append(s('path', { d: 'M-9 0 L-4.5 -7.8 L4.5 -7.8 L9 0 L4.5 7.8 L-4.5 7.8 Z', class: 'kg-open' }));
  else g.append(s('path', { d: 'M-6.5 -8.5 H3 L6.5 -5 V8.5 H-6.5 Z', class: 'kg-open' }), s('path', { d: 'M3 -8.5 V-5 H6.5', class: 'kg-line' }));
  return g;
}

function legendGlyph(n) {
  return s('svg', { class: 'kg-legend__glyph', width: 22, height: 22, viewBox: '-11 -11 22 22', 'aria-hidden': 'true', focusable: 'false' }, glyph(n));
}
export function lineSample(cls, w = 36) {
  return s('svg', { class: `kg-legend__line kg-c-${cls}`, width: w, height: 12, viewBox: `0 0 ${w} 12`, 'aria-hidden': 'true', focusable: 'false' },
    s('line', { x1: 1, x2: w - 1, y1: 6, y2: 6, class: `kg-e kg-e--${cls}` }));
}

let R = null; // DOM references for the mounted view
let L = null; // current layout
const T = { x: 0, y: 0, k: 1, moved: false };

function draw() {
  const G = viewGraph();
  L = layout(G);
  const world = R.world;
  const bands = s('g'), eg = s('g', { 'aria-hidden': 'true' }), lab = s('g', { class: 'kg-elabels', 'aria-hidden': 'true' }), ng = s('g', { role: 'list', 'aria-label': 'Nodes' });
  world.replaceChildren(bands, eg, lab, ng);
  if (L.band) {
    bands.append(s('line', { x1: -24, x2: L.band.w, y1: L.band.y, y2: L.band.y, class: 'kg-band__rule' }),
      s('text', { x: -24, y: L.band.y + 20, class: 'kg-band__t' }, 'NO DOCUMENTED RELATION IN THIS VIEW'),
      s('text', { x: -24, y: L.band.y + 36, class: 'kg-band__n' }, 'Absence in the reviewed sources does not prove that no relation exists.'));
  }
  for (const e of G.edges) {
    const r = route(L, e);
    eg.append(s('path', { d: r.d, class: `kg-e kg-e--${e.class}`, 'data-e': e.id, 'marker-end': `url(#kg-mk-${e.class})` }),
      s('path', { d: r.d, class: 'kg-hit', 'data-e': e.id }));
    lab.append(s('text', { x: r.mid.x, y: r.mid.y - 6, 'text-anchor': r.anchor, class: 'kg-elabel', 'data-e': e.id, 'data-y': r.mid.y - 6 }, predLabel(e)));
  }
  // the single tab stop: the selection, else the top-left node in reading order
  const byReading = [...G.nodes].sort((a, b) => L.pos.get(a.id).x - L.pos.get(b.id).x || L.pos.get(a.id).y - L.pos.get(b.id).y);
  const first = G.nodes.find((n) => n.id === (st.node || st.focus)) || byReading[0] || G.band[0];
  for (const n of [...G.nodes, ...G.band]) {
    const p = L.pos.get(n.id);
    const deg = G.edges.filter((e) => e.source === n.id || e.target === n.id).length;
    ng.append(s('g', { class: `kg-n kg-k-${n.kind}`, transform: `translate(${p.x},${p.y})`, 'data-n': n.id, role: 'listitem' },
      s('g', { class: 'kg-n__focus', tabindex: n === first ? '0' : '-1', role: 'button', 'aria-pressed': st.node === n.id ? 'true' : 'false',
        'aria-label': `${n.title}. ${n.kind === 'research' ? CLASS_LABEL[n.cls] : KIND_LABEL[n.kind]}. ${deg ? `${deg} documented relation${deg === 1 ? '' : 's'} in this view` : 'No documented relation in this view'}.` },
      s('rect', { x: -14, y: -16, width: p.w + 22, height: 34, rx: 2, class: 'kg-n__hit' }),
      s('circle', { r: 14, class: 'kg-n__ring' }), glyph(n),
      s('text', { x: PAD_GLYPH, y: -1, class: 'kg-n__t' }, n.short),
      s('text', { x: PAD_GLYPH, y: 14, class: 'kg-n__s' }, sub(n)))));
  }
  R.caption.replaceChildren(
    h('span.label', `Plate K · ${G.view.id === 'focus' ? `Neighbourhood of ${nm(st.focus)}` : G.view.title}`),
    h('span.body-s', `${G.view.note} ${G.edges.length} documented relation${G.edges.length === 1 ? '' : 's'} shown. Positions show relationship structure only; they are not geographic and are not a ranking.`));
  paint();
  table(G);
}

function paint() {
  if (!L) return;
  const svg = R.svg;
  const keyNode = R.hover || st.node;
  const keyEdge = st.edge;
  const nearN = new Set(), nearE = new Set();
  if (keyNode) {
    nearN.add(keyNode);
    L.G.edges.forEach((e) => { if (e.source === keyNode || e.target === keyNode) { nearE.add(e.id); nearN.add(e.source); nearN.add(e.target); } });
  }
  if (keyEdge && M.byId.has(keyEdge)) { const e = M.byId.get(keyEdge); nearE.add(e.id); nearN.add(e.source); nearN.add(e.target); }
  if (!keyNode && !keyEdge && st.q && R.qEdges.size) {
    L.G.edges.forEach((e) => { if (R.qEdges.has(e.id)) { nearE.add(e.id); nearN.add(e.source); nearN.add(e.target); } });
  }
  svg.classList.toggle('has-focus', nearN.size > 0);
  for (const el of svg.querySelectorAll('.kg-n')) {
    const id = el.dataset.n;
    el.classList.toggle('is-near', nearN.has(id));
    el.classList.toggle('is-sel', st.node === id);
    el.firstChild.setAttribute('aria-pressed', st.node === id ? 'true' : 'false');
  }
  for (const el of svg.querySelectorAll('.kg-e, .kg-hit')) {
    el.classList.toggle('is-near', nearE.has(el.dataset.e));
    el.classList.toggle('is-sel', el.dataset.e === keyEdge);
  }
  // edge labels: shown for the selection only, nudged apart so none collide
  const show = keyEdge ? new Set([keyEdge]) : keyNode && nearE.size <= 10 ? nearE : new Set();
  const boxes = [];
  for (const t of svg.querySelectorAll('.kg-elabel')) {
    const on = show.has(t.dataset.e);
    t.classList.toggle('is-on', on);
    if (!on) continue;
    let yy = Number(t.dataset.y);
    t.setAttribute('y', yy);
    let bb = t.getBBox();
    for (let i = 0; i < 12 && boxes.some((b) => !(bb.x + bb.width < b.x || b.x + b.width < bb.x || bb.y + bb.height < b.y || b.y + b.height < bb.y)); i++) {
      yy += 13; t.setAttribute('y', yy); bb = t.getBBox();
    }
    boxes.push(bb);
  }
  for (const tr of R.table.querySelectorAll('tr[data-e]')) tr.classList.toggle('is-sel', tr.dataset.e === keyEdge);
  R.selbar.replaceChildren(...selbar());
}

// ------------------------------------------------------------------ pan, zoom, animation

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function applyT() { R.world.setAttribute('transform', `translate(${T.x.toFixed(1)},${T.y.toFixed(1)}) scale(${T.k.toFixed(4)})`); }
let anim = 0;
function animateTo(x, y, k) {
  cancelAnimationFrame(anim);
  if (reduced()) { Object.assign(T, { x, y, k }); applyT(); return; }
  const from = { x: T.x, y: T.y, k: T.k }, t0 = performance.now(), dur = 220;
  const stepF = (t) => {
    const u = Math.min(1, (t - t0) / dur), ease = 1 - (1 - u) ** 3;
    T.x = from.x + (x - from.x) * ease; T.y = from.y + (y - from.y) * ease; T.k = from.k + (k - from.k) * ease;
    applyT();
    if (u < 1) anim = requestAnimationFrame(stepF);
  };
  anim = requestAnimationFrame(stepF);
}
const MIN_K = 0.6; // legible minimum on narrow screens; "Fit" always shows everything
function fit({ all = false, animate = false } = {}) {
  if (!L || !R) return;
  const W = R.svg.clientWidth, H = R.svg.clientHeight;
  if (!W || !H) return;
  const bb = R.world.getBBox();
  if (!bb.width || !bb.height) return;
  const pad = 28, top = 56;
  let k = Math.min((W - 2 * pad) / bb.width, (H - top - pad) / bb.height, 1.6);
  let cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
  if (!all && k < MIN_K) {
    k = MIN_K;
    const ids = st.node ? [st.node] : st.edge && M.byId.has(st.edge) ? [M.byId.get(st.edge).source, M.byId.get(st.edge).target] : st.focus ? [st.focus] : [];
    const ps = ids.map((id) => L.pos.get(id)).filter(Boolean);
    if (ps.length) { cx = ps.reduce((a, p) => a + p.x + p.w / 2, 0) / ps.length; cy = ps.reduce((a, p) => a + p.y, 0) / ps.length; }
    else { cx = bb.x + (W / 2 - pad) / k; }
  }
  const x = W / 2 - cx * k, y = top + (H - top - pad) / 2 - cy * k;
  T.moved = false;
  if (animate) animateTo(x, y, k); else { cancelAnimationFrame(anim); Object.assign(T, { x, y, k }); applyT(); }
}
function zoomBy(f, px, py) {
  const W = R.svg.clientWidth, H = R.svg.clientHeight;
  px ??= W / 2; py ??= H / 2;
  const k = Math.min(3, Math.max(0.2, T.k * f));
  T.moved = true;
  animateTo(px - ((px - T.x) * k) / T.k, py - ((py - T.y) * k) / T.k, k);
}
function centreOn(id) {
  const p = L && L.pos.get(id);
  if (!p) return;
  const W = R.svg.clientWidth, H = R.svg.clientHeight;
  const k = Math.max(T.k, MIN_K);
  T.moved = true;
  animateTo(W / 2 - (p.x + p.w / 2) * k, H / 2 - p.y * k, k);
}

function bindPointer() {
  const svg = R.svg;
  svg.addEventListener('wheel', (ev) => {
    if (!ev.ctrlKey && !R.root.classList.contains('kg--expanded') && !svg.matches(':focus-within')) return; // let the page scroll
    ev.preventDefault();
    const r = svg.getBoundingClientRect();
    const k = Math.min(3, Math.max(0.2, T.k * Math.exp(-ev.deltaY * 0.0015)));
    const px = ev.clientX - r.left, py = ev.clientY - r.top;
    T.x = px - ((px - T.x) * k) / T.k; T.y = py - ((py - T.y) * k) / T.k; T.k = k; T.moved = true;
    applyT();
  }, { passive: false });
  const ptrs = new Map();
  let start = null, pinch = null;
  svg.addEventListener('pointerdown', (ev) => {
    ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ptrs.size === 1) start = { x: ev.clientX, y: ev.clientY, tx: T.x, ty: T.y, moved: false };
    if (ptrs.size === 2) { const [p, q] = [...ptrs.values()]; pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), k: T.k }; }
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!ptrs.has(ev.pointerId)) return;
    ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ptrs.size === 2 && pinch) {
      const [p, q] = [...ptrs.values()];
      const r = svg.getBoundingClientRect();
      const k = Math.min(3, Math.max(0.2, pinch.k * (Math.hypot(p.x - q.x, p.y - q.y) / pinch.d)));
      const px = (p.x + q.x) / 2 - r.left, py = (p.y + q.y) / 2 - r.top;
      T.x = px - ((px - T.x) * k) / T.k; T.y = py - ((py - T.y) * k) / T.k; T.k = k; T.moved = true; applyT();
      if (start) start.moved = true;
      return;
    }
    if (!start) return;
    const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 5) return;
    if (!start.moved) { start.moved = true; svg.classList.add('is-dragging'); try { svg.setPointerCapture(ev.pointerId); } catch { /* not capturable */ } }
    T.x = start.tx + dx; T.y = start.ty + dy; T.moved = true; applyT();
  });
  const end = (ev) => {
    ptrs.delete(ev.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (!ptrs.size) { if (start && start.moved) R.suppress = true; start = null; svg.classList.remove('is-dragging'); }
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  svg.addEventListener('click', (ev) => {
    if (R.suppress) { R.suppress = false; return; }
    const n = ev.target.closest('.kg-n');
    const e = ev.target.closest('[data-e]');
    if (n) select({ node: n.dataset.n });
    else if (e) select({ edge: e.dataset.e });
    else if (st.node || st.edge) select({});
  });
  svg.addEventListener('pointerover', (ev) => {
    const n = ev.target.closest('.kg-n');
    const id = n ? n.dataset.n : null;
    if (id !== R.hover) { R.hover = id; paint(); }
  });
  svg.addEventListener('pointerleave', () => { if (R.hover) { R.hover = null; paint(); } });
  svg.addEventListener('focusin', (ev) => {
    const n = ev.target.closest('.kg-n');
    if (n) { R.hover = n.dataset.n; paint(); }
  });
  svg.addEventListener('focusout', () => { R.hover = null; paint(); });
  svg.addEventListener('keydown', (ev) => {
    const cur = ev.target.closest('.kg-n');
    if (cur && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); select({ node: cur.dataset.n }); return; }
    if (cur && ev.key.startsWith('Arrow')) { ev.preventDefault(); moveFocus(cur.dataset.n, ev.key); return; }
    if (cur && (ev.key === 'Home' || ev.key === 'End')) {
      ev.preventDefault();
      const nodesAll = [...R.svg.querySelectorAll('.kg-n')];
      focusNode((ev.key === 'Home' ? nodesAll[0] : nodesAll[nodesAll.length - 1]).dataset.n);
      return;
    }
    keys(ev);
  });
}
function keys(ev) {
  const map = { '+': () => zoomBy(1.25), '=': () => zoomBy(1.25), '-': () => zoomBy(0.8), 0: () => fit({ all: true, animate: true }),
    f: () => expand(), F: () => expand(), Escape: () => (R.root.classList.contains('kg--expanded') ? expand(false) : select({})) };
  if (map[ev.key] && !ev.ctrlKey && !ev.metaKey && !ev.altKey) { ev.preventDefault(); map[ev.key](); }
}
// spatial roving focus: arrow keys move to the nearest node in that direction
function moveFocus(fromId, key) {
  const a = L.pos.get(fromId);
  const dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[key];
  let best = null;
  for (const [id, p] of L.pos) {
    if (p.virt || id === fromId) continue;
    const dx = p.x - a.x, dy = p.y - a.y;
    const along = dx * dir[0] + dy * dir[1];
    if (along <= 4) continue;
    const across = Math.abs(dx * dir[1] - dy * dir[0]);
    const cost = along + across * 2.5;
    if (!best || cost < best.cost) best = { id, cost };
  }
  if (best) focusNode(best.id);
}
function focusNode(id) {
  for (const el of R.svg.querySelectorAll('.kg-n__focus')) el.setAttribute('tabindex', '-1');
  const el = R.svg.querySelector(`.kg-n[data-n="${CSS.escape(id)}"] .kg-n__focus`);
  if (!el) return;
  el.setAttribute('tabindex', '0');
  el.focus({ preventScroll: true });
  const p = L.pos.get(id), W = R.svg.clientWidth, H = R.svg.clientHeight;
  const sx = p.x * T.k + T.x, sy = p.y * T.k + T.y;
  if (sx < 20 || sx > W - 160 || sy < 60 || sy > H - 20) centreOn(id);
}

function expand(on) {
  const root = R.root;
  const next = on ?? !root.classList.contains('kg--expanded');
  root.classList.toggle('kg--expanded', next);
  document.documentElement.classList.toggle('kg-lock', next);
  R.expandBtn.setAttribute('aria-pressed', String(next));
  R.expandBtn.textContent = next ? 'Close expanded view' : 'Expand';
  requestAnimationFrame(() => fit({ animate: true }));
  R.live(next ? 'Expanded graph view. Press Escape to close.' : 'Expanded view closed.');
}

// ------------------------------------------------------------------ selection

function select(sel) {
  st.node = sel.node || null;
  st.edge = sel.edge || null;
  if (sel.node || sel.edge) st.q = null;
  const inView = st.node ? L.pos.has(st.node) && !L.pos.get(st.node).virt : st.edge ? L.G.edges.some((e) => e.id === st.edge) : true;
  if (!inView) {
    const e = st.edge ? M.byId.get(st.edge) : null;
    if (e && !st.cls.has(e.class)) st.cls.add(e.class);
    if (e) for (const k of [M.nodes.get(e.source).kind, M.nodes.get(e.target).kind]) if (k !== 'research') st.kinds.add(k);
    if (st.node && M.nodes.get(st.node).kind !== 'research') st.kinds.add(M.nodes.get(st.node).kind);
    st.focus = st.node || e.source;
    st.view = 'focus';
    syncControls();
    draw();
    fit({ animate: true });
  } else {
    paint();
    if (window.matchMedia('(max-width: 639px)').matches && (st.node || st.edge)) centreOn(st.node || M.byId.get(st.edge).source);
  }
  tabs();
  detail();
  writeUrl();
  if (!st.node && !st.edge) R.live('Selection cleared.');
  else if (st.node) R.live(`Selected ${M.nodes.get(st.node).title}. Details follow the graph.`);
  else { const e = M.byId.get(st.edge); R.live(`Selected relation: ${nm(e.source)} ${predLabel(e)} ${nm(e.target)}.`); }
}
function setView(id) {
  st.view = id;
  st.q = null;
  if (st.node && id !== 'focus') st.node = null;
  st.edge = null;
  rerender({ animate: false });
}
function rerender({ animate = false } = {}) {
  tabs(); syncControls(); draw(); detail(); writeUrl();
  requestAnimationFrame(() => fit({ animate }));
}

// ------------------------------------------------------------------ controls

function tabs() {
  const list = [...VIEWS];
  if (st.focus) list.push({ id: 'focus', label: `Neighbourhood: ${nm(st.focus)}` });
  R.tabs.replaceChildren(...list.map((v) => {
    const on = st.view === v.id;
    return h('button.kg-tab', { type: 'button', role: 'tab', 'aria-selected': on ? 'true' : 'false', tabindex: on ? '0' : '-1',
      'aria-controls': 'kg-plate', 'data-view': v.id, on: { click: () => setView(v.id) } }, v.label);
  }));
}
function syncControls() {
  for (const i of R.root.querySelectorAll('[data-cls]')) i.checked = st.cls.has(i.dataset.cls);
  for (const i of R.root.querySelectorAll('[data-kind]')) i.checked = st.kinds.has(i.dataset.kind);
}
function controls() {
  const cls = h('fieldset.kg-fs', h('legend', 'Relationship classes'),
    CLASS_ORDER.map((c) => h('label.kg-chk', h('input', { type: 'checkbox', 'data-cls': c, checked: st.cls.has(c),
      on: { change: (ev) => { if (ev.target.checked) st.cls.add(c); else st.cls.delete(c); rerender(); } } }), lineSample(c), M.classes.get(c).label)));
  const kinds = h('fieldset.kg-fs', h('legend', 'Node types'),
    h('label.kg-chk.kg-chk--fixed', h('input', { type: 'checkbox', checked: true, disabled: true }), legendGlyph({ kind: 'research', cls: 'documented_research' }), 'Research items'),
    FILTER_KINDS.map((k) => h('label.kg-chk', h('input', { type: 'checkbox', 'data-kind': k, checked: st.kinds.has(k),
      on: { change: (ev) => { if (ev.target.checked) st.kinds.add(k); else st.kinds.delete(k); rerender(); } } }), legendGlyph({ kind: k }), KIND_PLURAL[k])));
  const names = h('datalist', { id: 'kg-names' }, [...M.nodes.values()].map((n) => h('option', { value: n.short })));
  const input = h('input.kg-search__in', { id: 'kg-q', type: 'search', list: 'kg-names', autocomplete: 'off', placeholder: 'Item, method, dataset or territory' });
  const search = h('form.kg-search', { role: 'search', on: { submit: (ev) => {
    ev.preventDefault();
    const q = input.value.trim().toLowerCase();
    if (!q) return;
    const nodesAll = [...M.nodes.values()];
    const hit = nodesAll.find((n) => n.short.toLowerCase() === q || n.title.toLowerCase() === q)
      || nodesAll.find((n) => n.short.toLowerCase().includes(q) || n.title.toLowerCase().includes(q));
    if (!hit) { R.live(`No node matches “${input.value.trim()}”.`); return; }
    select({ node: hit.id });
    centreOn(hit.id);
  } } }, h('label.label', { for: 'kg-q' }, 'Find'), input, names, h('button.btn', { type: 'submit' }, 'Go'));
  return [cls, kinds, search];
}

function legend() {
  return h('div.kg-legend',
    h('p.label.kg-legend__head', 'Nodes'),
    [[{ kind: 'research', cls: 'documented_research' }, 'Documented research'], [{ kind: 'research', cls: 'experiment' }, 'Experiment'],
      [{ kind: 'research', cls: 'research_platform' }, 'Research platform'], [{ kind: 'research', cls: 'instrument' }, 'Instrument'],
      [{ kind: 'method' }, 'Method'], [{ kind: 'dataset' }, 'Dataset family (the extract is on each link)'],
      [{ kind: 'territory' }, 'Territory (text, not geometry)'], [{ kind: 'output' }, 'Output']]
      .map(([n, t]) => h('span.kg-legend__item', legendGlyph(n), t)),
    h('p.label.kg-legend__head', 'Relationships'),
    CLASS_ORDER.map((c) => h('span.kg-legend__item', lineSample(c), M.classes.get(c).label)),
    h('p.body-s.ink-2.kg-legend__note', 'A selected node or line stays in full ink, its direct neighbours stay visible and everything else recedes. Colour always repeats the shape, line pattern and text label; it is never the only cue.'));
}

// ------------------------------------------------------------------ detail panel

function sourceOf(id) { return M.db.S.get(id) || M.rel.sources.find((x) => x.id === id) || null; }
function srcLink(x) {
  const s0 = sourceOf(x.source_id);
  if (!s0) return h('p.micro', `Unresolved source ${x.source_id}`);
  const lines = x.lines ? `#L${x.lines[0]}-L${x.lines[1]}` : '';
  const url = lines && /github\.com\/.+\/blob\//.test(s0.url) ? s0.url + lines : s0.url;
  const repo = (s0.url.match(/github\.com\/[^/]+\/([^/]+)\//) || [])[1];
  return h('div.kg-src',
    ext(url, s0.label),
    h('p.micro', repo ? `${repo} @ ` : 'pin ', pin(s0.pinned_ref), x.lines ? ` · lines ${x.lines[0]}–${x.lines[1]}` : ' · whole record', ` · ${s0.access}`),
    x.summary ? h('p.body-s.ink-2', x.summary) : null);
}
function relSentence(e) {
  return h('p.kg-rel', h('b', nm(e.source)), ` ${predLabel(e)} `, h('b', nm(e.target)));
}
function relButton(e) {
  return h('button.kg-linkbtn', { type: 'button', on: { click: () => select({ edge: e.id }) } }, `${nm(e.source)} ${predLabel(e)} ${nm(e.target)}`);
}
function sec(title, ...kids) { return h('section.kg-sec', title ? h('h3.label', title) : null, ...kids); }
function back() {
  return h('button.kg-linkbtn.ui', { type: 'button', on: { click: () => { st.q = null; select({}); } } }, '← Questions this graph answers');
}
function verification(e) {
  const v = e.verification && e.verification.state === 'human_verified' ? e.verification : null;
  return v ? `Human-verified by ${v.verified_by} on ${v.verified_at}.`
    : `AI-assisted source check, ${M.rel.verification.checked_at}. Human verification: pending (K2). An AI check is not human verification.`;
}
function versionsBlock(e) {
  if (!(e.versions || []).length) return null;
  return sec('Versions (never substituted)', h('ul.kg-versions', e.versions.map((v) => {
    const node = M.nodes.get(v.node);
    const dossierRef = node.version ? node.version.ref : null;
    const same = dossierRef === v.ref;
    return h('li',
      h('p.body-s', h('b', node.short), ` — ${v.role}: `, pin(v.ref), same ? ' (the dossier version).' : '.'),
      same ? null : h('p.body-s.ink-2', 'The dossier describes ', pin(dossierRef), '. ', v.note || ''));
  })));
}

function edgeDetail(e) {
  const p = M.preds.get(e.predicate);
  const ends = [e.source, e.target].map((id) => M.nodes.get(id));
  return [back(),
    sec(null, h('p.label', `${M.classes.get(e.class).label}${e.derived_from ? ' · from a v0.3 record field' : ''}`), relSentence(e),
      h('p.micro', `${e.id} · ${p.direction}`)),
    sec('Why this connection exists', h('p.body-s', e.explanation),
      e.extract ? h('p.body-s', h('span.label', 'Extract used · '), e.extract) : null),
    versionsBlock(e),
    sec('Evidence', e.evidence.map(srcLink)),
    sec('What this does not establish', h('ul.limits.body-s',
      (e.limits || []).map((t) => h('li', t)), h('li', p.limits), (p.inference_rules || []).map((t) => h('li', t)),
      h('li', 'Connectivity in this graph says nothing about scientific agreement or validity.'))),
    sec('Predicate', h('p.body-s', p.definition), h('p.body-s.ink-2', h('span.label', 'Required evidence · '), p.required_evidence)),
    sec('Verification', h('p.body-s', verification(e))),
    sec('Open', h('ul.kg-open', ends.map((n) => h('li',
      h('button.kg-linkbtn', { type: 'button', on: { click: () => select({ node: n.id }) } }, `${n.short} in the graph`),
      n.href ? h('a', { href: n.href }, n.kind === 'research' ? 'dossier' : 'plate') : null))))];
}

function nodeDetail(n) {
  const rels = M.edges.filter((e) => e.source === n.id || e.target === n.id)
    .sort((a, b) => CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class) || a.predicate.localeCompare(b.predicate));
  const non = M.rel.non_relationships.filter((x) => x.subject === n.id || x.objects.includes(n.id));
  const out = [back(), sec(null,
    h('p.label', n.kind === 'research' ? CLASS_LABEL[n.cls] : KIND_LABEL[n.kind]),
    h('h3.kg-title', n.title),
    n.state ? h('p', h('span.verdict', n.state)) : null,
    n.summary ? h('p.body-s', n.summary) : null,
    h('dl.kv',
      n.lifecycle ? [h('dt', 'Lifecycle'), h('dd', n.lifecycle)] : null,
      n.version ? [h('dt', 'Dossier version'), h('dd', pin(n.version.ref))] : null,
      n.publisher ? [h('dt', 'Publisher'), h('dd', n.publisher)] : null,
      n.licence ? [h('dt', 'Licence'), h('dd', n.licence)] : null),
    h('ul.kg-open',
      n.href ? h('li', h('a', { href: n.href }, n.kind === 'research' ? 'Open the dossier' : 'Open the plate')) : null,
      h('li', h('button.kg-linkbtn', { type: 'button', on: { click: () => { st.focus = n.id; st.view = 'focus'; rerender({ animate: true }); } } }, 'Isolate its neighbourhood'))))];
  if (n.kind === 'research') {
    out.push(sec('Claim limits and verification', h('ul.limits.body-s',
      n.ceiling ? h('li', n.ceiling) : null,
      h('li', 'Per-claim human verification of this item is pending (SPEC.md §12.10 and §13.8).'))));
    if (n.findings && n.findings.length) out.push(sec(`Findings (${n.findings.length}), in the dossier`, h('ul.limits.body-s', n.findings.slice(0, 2).map((f) => h('li', f.statement)))));
  } else if (n.note) out.push(sec('Note', h('p.body-s', n.note)));
  out.push(sec(`Documented relations (${rels.length})`, rels.length
    ? h('ul.kg-rels', rels.map((e) => h('li', h('span.label.kg-rels__cls', M.classes.get(e.class).label), relButton(e))))
    : h('p.body-s.ink-2', ABSENCE)));
  if (non.length) out.push(sec('Documented non-relations', non.map((x) => h('div.kg-non', h('p.body-s', x.statement), h('p.body-s.ink-2', x.interpretation), srcLink(x.evidence)))));
  return out;
}

function defaultDetail() {
  return [sec(null, h('p.label', 'Questions this graph answers'),
    h('p.body-s.ink-2', 'Each answer is computed from the relationship records, highlights the relations it uses and links to them. Or select any node or line.')),
  h('ul.kg-qa', QUESTIONS.map((q) => h('li', h('button.kg-linkbtn', { type: 'button', on: { click: () => ask(q.id) } }, q.title))))];
}
function ask(id) {
  const q = QUESTIONS.find((x) => x.id === id);
  st.node = null; st.edge = null; st.q = id;
  const A = q.answer();
  if (A.view && A.view !== st.view) { st.view = A.view; rerender({ animate: true }); } else { detail(); writeUrl(); }
  R.rail.focus({ preventScroll: true });
}
function questionDetail(q) {
  const A = q.answer();
  R.qEdges = new Set((A.edges || []).map((e) => e.id));
  return [back(),
    sec(null, h('p.label', 'Question'), h('h3.kg-title', q.title)),
    sec('Answer from the records', h('div.kg-answer', A.paras.map((p) => (typeof p === 'string' ? h('p.body-s', p) : p)))),
    A.edges && A.edges.length ? sec(`Relations used (${A.edges.length})`, h('ul.kg-rels', A.edges.map((e) => h('li', h('span.label.kg-rels__cls', M.classes.get(e.class).label), relButton(e))))) : null,
    A.caveat ? sec('Reading limit', h('p.kg-caveat', A.caveat)) : null];
}
function detail() {
  R.qEdges = new Set();
  let content;
  if (st.edge && M.byId.has(st.edge)) content = edgeDetail(M.byId.get(st.edge));
  else if (st.node) content = nodeDetail(M.nodes.get(st.node));
  else if (st.q) content = questionDetail(QUESTIONS.find((x) => x.id === st.q));
  else content = defaultDetail();
  R.detail.replaceChildren(...content.filter(Boolean));
  paint();
}
function selbar() {
  if (st.edge && M.byId.has(st.edge)) {
    const e = M.byId.get(st.edge);
    return [h('span.label', M.classes.get(e.class).label), relSentence(e), h('a.kg-selbar__go', { href: '#kg-detail' }, 'Why this connection exists ↓')];
  }
  if (st.node) return [h('span.label', 'Selected'), h('p.kg-rel', h('b', M.nodes.get(st.node).title)), h('a.kg-selbar__go', { href: '#kg-detail' }, 'Details and relations ↓')];
  return [h('span.body-s.ink-2', 'Select a node or a line to see why it is here and where it is documented.')];
}

// ------------------------------------------------------------------ questions (computed)

const all = () => M.edges;
function group(list, key) { const m = new Map(); for (const x of list) { if (!m.has(x[key])) m.set(x[key], []); m.get(x[key]).push(x); } return m; }
const QUESTIONS = [
  { id: 'hati-lens', title: 'What is the documented relationship between HATI and the Madrid Urban Evidence Lens?',
    answer: () => {
      const es = all().filter((e) => [e.source, e.target].includes('p-lens') && [e.source, e.target].some((x) => x.startsWith('r-hati')));
      return { view: 'ecosystem', edges: es,
        paras: [...es.map((e) => e.explanation), 'No record links the Lens to the HATI pedestrian heat extension. The Lens reads the pilot at HATI commit f02f5f6, which is not the preprint version the HATI dossier describes.'],
        caveat: es.flatMap((e) => e.limits).join(' ') };
    } },
  { id: 'used-by', title: 'Which research instruments or platforms are actually used by other items?',
    answer: () => {
      const tech = all().filter((e) => e.class === 'technical');
      return { view: 'ecosystem', edges: tech,
        paras: [...group(tech, 'target').entries()].map(([t, es]) => `${nm(t)}: ${es.map((e) => `${e.predicate === 'depends_on' ? 'loaded at a pinned version by' : 'outputs read by'} ${nm(e.source)}`).join('; ')}.`)
          .concat(['No other item has a documented technical user.']),
        caveat: 'Hosting is not use: the Lens hosts two research packages that its application does not read (documented non-relations).' };
    } },
  { id: 'same-data', title: 'Which items depend on the same official or open data sources?',
    answer: () => {
      const byD = group(all().filter((e) => e.predicate === 'uses_dataset'), 'target');
      const multi = [...byD.entries()].filter(([, es]) => es.length > 1);
      return { view: 'data', edges: multi.flatMap(([, es]) => es),
        paras: multi.map(([d, es]) => h('p.body-s', h('b', `${nm(d)} (${es.length} items). `), es.map((e) => `${nm(e.source)}: ${e.extract}`).join('; '), '.'))
          .concat(['PNOA appears as three separate datasets (LiDAR 1st coverage, LiDAR 3rd coverage, historical orthophotos), each used by a different item in a different role.']),
        caveat: 'Each item uses a different extract, product, date or area. A shared dataset family does not make the observations comparable and does not establish agreement.' };
    } },
  { id: 'methods', title: 'Which research items use similar spatial methodologies?',
    answer: () => {
      const byM = group(all().filter((e) => e.predicate === 'applies_method'), 'target');
      const shared = [...byM.entries()].filter(([, es]) => es.length > 1);
      const single = [...byM.entries()].filter(([, es]) => es.length === 1);
      const ext2 = all().filter((e) => e.predicate === 'extends');
      return { view: 'methods', edges: [...shared.flatMap(([, es]) => es), ...ext2],
        paras: [...shared.map(([m, es]) => `${nm(m)}: ${es.map((e) => nm(e.source)).join(' and ')}. The second is a declared extension of the first, with a corrected pipeline and a different question, not an independent replication.`),
          `One item each: ${single.map(([m, es]) => `${nm(m)} (${nm(es[0].source)})`).join('; ')}.`,
          'The network pilot and the Transit Graph both work with networks, but their sources name different methods; no shared method is recorded.'],
        caveat: 'A shared method node means a named method in common, not shared configuration, inputs, calibration or validity.' };
    } },
  { id: 'territories', title: 'Which territories have been studied from different analytical perspectives?',
    answer: () => {
      const within = all().filter((e) => e.predicate === 'within');
      const sit = all().filter((e) => e.predicate === 'situated_in');
      const am = all().filter((e) => e.predicate === 'applies_method');
      const area = (t) => [t, ...within.filter((w) => w.target === t).flatMap((w) => area(w.source))];
      const paras = [], used = [];
      for (const t of [...M.nodes.values()].filter((n) => n.kind === 'territory' && !within.some((w) => w.source === n.id))) {
        const ids = area(t.id);
        const es = sit.filter((e) => ids.includes(e.target));
        if (es.length < 2) continue;
        used.push(...es, ...within.filter((w) => ids.includes(w.source)));
        paras.push(h('p.body-s', h('b', `${nm(t.id)}: `), es.map((e) => {
          const ms = am.filter((x) => x.source === e.source).map((x) => nm(x.target));
          return `${nm(e.source)} (${nm(e.target)}${ms.length ? `; ${ms.join(', ')}` : '; no method node'})`;
        }).join('; '), '.'));
      }
      return { view: 'territories', edges: used, paras,
        caveat: 'Sibling study areas inside one territory are not compared: their extents, periods and phenomena differ, and overlap is never computed. Embajadores (PNOA-LiDAR pilot) and the Lavapiés isovist area are kept separate.' };
    } },
  { id: 'platform-evidence', title: 'Can a platform expose evidence produced by a research study?',
    answer: () => {
      const paras = [], used = [];
      for (const p of [...M.nodes.values()].filter((n) => n.cls === 'research_platform')) {
        const reads = all().filter((e) => e.source === p.id && e.predicate === 'consumes_output_of');
        const hosts = all().filter((e) => e.source === p.id && e.predicate === 'hosts');
        const non = M.rel.non_relationships.filter((x) => x.subject === p.id);
        used.push(...reads, ...hosts);
        paras.push(h('p.body-s', h('b', `${nm(p.id)}. `),
          reads.length ? `Exposes a documented subset of: ${reads.map((e) => nm(e.target)).join(', ')}. ` : 'Exposes no other item\'s outputs. ',
          hosts.length ? `Hosts: ${hosts.map((e) => nm(e.target)).join(', ')}. ` : '',
          non.length ? `Recorded as not integrated with: ${non.flatMap((x) => x.objects).map(nm).join(', ')}.` : ''));
      }
      return { view: 'ecosystem', edges: used, paras: paras.concat(['The Madrid Evidence MCP exposes the Lens\'s registry answers at a pinned Lens version, not research-study evidence.']),
        caveat: 'Yes in one documented case, and only for the subset its provenance record names. Hosting a study is not exposing it.' };
    } },
  { id: 'outputs', title: 'Which publications and outputs originate from which investigations?',
    answer: () => {
      const ho = all().filter((e) => e.predicate === 'has_output');
      const owners = new Set(ho.map((e) => e.source));
      return { view: 'data', edges: ho,
        paras: [...group(ho, 'source').entries()].map(([r, es]) => `${nm(r)}: ${es.map((e) => M.nodes.get(e.target).title).join(' | ')}`)
          .concat([`No output is recorded for: ${M.db.order.filter((r) => !owners.has(r.id)).map((r) => r.short_title).join(', ')}.`]),
        caveat: 'Outputs exist only attached to their item. Publication type, editorial status and identifier are separate facts; none is a quality grade.' };
    } },
  { id: 'gaps', title: 'Where are the scientific validation gaps?',
    answer: () => ({ view: 'ecosystem', edges: [],
      paras: ['Per-claim human verification is pending for every item (SPEC.md §12.10 for the v0.3 items, §13.8 for the v0.4 items), and for every relation (K2).',
        ...M.db.order.map((r) => h('p.body-s', h('b', `${r.short_title}. `), M.db.of(r.id).outcome ? `Documented result: ${M.db.of(r.id).outcome.verdict_label}.` : 'A platform: no result of its own.', ' ', r.lifecycle_note || ''))],
      caveat: 'Abstention, insufficient evidence, MODIFY, HOLD, FREEZE, MIXTO and NO-GO are documented outcomes, not failures. They are listed as stated and never ranked.' }) },
  { id: 'not-documented', title: 'Which apparent connections are not documented?',
    answer: () => {
      const items = M.db.order.filter((r) => !all().some((e) => (e.source === r.id || e.target === r.id) && ['technical', 'structural'].includes(e.class) && e.predicate !== 'has_output'));
      return { view: 'ecosystem', edges: [],
        paras: [h('p.body-s', h('b', 'Recorded as not integrated. '), M.rel.non_relationships.map((x) => `${nm(x.subject)} ⟂ ${x.objects.map(nm).join(', ')}`).join('; '), '.'),
          h('p.body-s', h('b', 'No documented technical or hosting relation. '), items.map((r) => r.short_title).join(', '), '.'),
          'Analyst-defined associations and hypothetical future applications are excluded from this graph (decision E5) and kept only in the development record.'],
        caveat: 'Absence of a documented relation in the reviewed sources does not prove that no relation exists. Shared authorship, place or vocabulary is never used to draw one.' };
    } },
  { id: 'versions', title: 'Which relations refer to a version other than the one a dossier describes?',
    answer: () => {
      const es = all().filter((e) => (e.versions || []).some((v) => { const n = M.nodes.get(v.node); return n.version && n.version.ref !== v.ref; }));
      return { view: 'ecosystem', edges: es,
        paras: es.map((e) => h('p.body-s', h('b', `${nm(e.source)} ${predLabel(e)} ${nm(e.target)}. `),
          e.versions.filter((v) => M.nodes.get(v.node).version.ref !== v.ref).map((v) => `${nm(v.node)}: ${v.role} ${v.ref.slice(0, 7)}; the dossier describes ${M.nodes.get(v.node).version.ref.slice(0, 7)}.`).join(' '))),
        caveat: 'Both versions are shown, and neither stands in for the other (decision E3).' };
    } },
  { id: 'heat-access', title: 'Which findings concern thermal exposure or pedestrian accessibility?',
    answer: () => {
      const am = all().filter((e) => e.predicate === 'applies_method' && ['m-solweig-utci', 'm-network-distance'].includes(e.target));
      return { view: 'methods', edges: am,
        paras: am.map((e) => {
          const n = M.nodes.get(e.source);
          return h('p.body-s', h('b', `${nm(e.target)} → ${n.short}. `), n.findings.length ? `${n.findings.length} findings, for example: “${n.findings[0].statement}” ` : 'No findings recorded. ', h('a', { href: n.href }, 'Dossier'));
        }),
        caveat: 'Grouped by the method each item\'s source names. The Atlas does not tag findings by topic, and the Lens\'s HATI layer is a reading of the pilot, not a finding of the Lens.' };
    } },
];

// ------------------------------------------------------------------ text alternative

function table(G) {
  const rows = [...G.edges].sort((a, b) => CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class) || ordIdx(a.source) - ordIdx(b.source) || a.id.localeCompare(b.id));
  R.table.replaceChildren(rows.length
    ? h('table.table.kg-table',
      h('caption.sr-only', 'Relations shown in the current view'),
      h('thead', h('tr', ['From', 'Relation', 'To', 'Class', 'Evidence'].map((t) => h('th', { scope: 'col' }, t)))),
      h('tbody', rows.map((e) => h('tr', { 'data-e': e.id },
        h('td', nm(e.source)),
        h('td', { 'data-label': 'Relation' }, h('button.kg-linkbtn', { type: 'button', on: { click: () => { select({ edge: e.id }); R.detail.scrollIntoView({ block: 'nearest' }); } } }, predLabel(e))),
        h('td', { 'data-label': 'To' }, nm(e.target)),
        h('td', { 'data-label': 'Class' }, M.classes.get(e.class).label),
        h('td', { 'data-label': 'Evidence' }, e.evidence.map((x) => (sourceOf(x.source_id) || {}).label).join('; '))))))
    : h('p.body-s.ink-2', 'No relation in this view with the current filters.'));
}

// ------------------------------------------------------------------ the view

function defs() {
  return s('defs', {}, CLASS_ORDER.map((c) => s('marker', { id: `kg-mk-${c}`, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, markerUnits: 'userSpaceOnUse', orient: 'auto' },
    s('path', { d: 'M0 0 L10 5 L0 10 Z', class: `kg-mk kg-c-${c}` }))));
}

function build(db, { head }) {
  const liveEl = h('p.sr-only', { 'aria-live': 'polite' });
  const svg = s('svg', { class: 'kg-svg', id: 'kg-svg', role: 'group', 'aria-roledescription': 'relationship graph',
    'aria-label': 'Knowledge graph. Use the arrow keys to move between nodes, Enter to select, plus and minus to zoom, 0 to fit, F to expand.' });
  const world = s('g');
  svg.append(defs(), world);
  const expandBtn = h('button.btn', { type: 'button', 'aria-pressed': 'false', on: { click: () => expand() } }, 'Expand');
  const plate = h('div.kg-plate', { id: 'kg-plate' }, svg,
    h('div.kg-zoom', { role: 'group', 'aria-label': 'Zoom and view' },
      h('button.btn.kg-zoom__b', { type: 'button', 'aria-label': 'Zoom in', on: { click: () => zoomBy(1.25) } }, '+'),
      h('button.btn.kg-zoom__b', { type: 'button', 'aria-label': 'Zoom out', on: { click: () => zoomBy(0.8) } }, '−'),
      h('button.btn', { type: 'button', on: { click: () => fit({ all: true, animate: true }) } }, 'Fit'),
      expandBtn));
  const caption = h('div.kg-caption');
  const selbarEl = h('div.kg-selbar');
  const detailEl = h('div.kg-detail', { id: 'kg-detail', tabindex: '-1' });
  const rail = h('aside.kg-rail', { 'aria-label': 'Details', tabindex: '-1' }, detailEl);
  const tabsEl = h('div.kg-tabs', { role: 'tablist', 'aria-label': 'View' });
  tabsEl.addEventListener('keydown', (ev) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(ev.key)) return;
    const bs = [...tabsEl.querySelectorAll('.kg-tab')];
    const i = bs.indexOf(document.activeElement);
    if (i < 0) return;
    const nb = bs[(i + (ev.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
    nb.click();
    tabsEl.querySelector(`[data-view="${nb.dataset.view}"]`).focus();
  });
  const tableEl = h('div.kg-tablewrap');
  const root = h('div.kg',
    head('Knowledge Graph', 'How are the research items connected, and on what evidence?',
      'Every line is a relation documented by a pinned public source, with its direction, meaning, limits and verification state. Select any node or line to see why it is there.'),
    h('p.body-s.notice', M.rel.notice),
    h('div.kg-controls', tabsEl, ...controls()),
    h('div.kg-body', h('div.kg-main', plate, selbarEl, caption, legend()), rail),
    h('section.section.kg-block', { 'aria-labelledby': 'kg-text' },
      h('div.sec-head', h('span.num', { 'aria-hidden': 'true' }, '01'), h('h2', { id: 'kg-text' }, 'Relations in this view, as text')),
      h('p.body-s.ink-2.kg-prose', 'The same relations as the plate, in reading order. Select a relation to see why it exists.'), tableEl),
    h('section.section.kg-block', { 'aria-labelledby': 'kg-non' },
      h('div.sec-head', h('span.num', { 'aria-hidden': 'true' }, '02'), h('h2', { id: 'kg-non' }, 'Documented non-relations')),
      h('p.body-s.ink-2.kg-prose', 'Sources that state two items are not integrated, recorded so that proximity is not read as a link.'),
      h('ul.kg-nonlist', M.rel.non_relationships.map((x) => h('li', h('p.label', `${nm(x.subject)} ⟂ ${x.objects.map(nm).join(', ')}`),
        h('p.body-s', x.statement), h('p.body-s.ink-2', x.interpretation), srcLink(x.evidence))))),
    h('section.section.kg-block', { 'aria-labelledby': 'kg-vocab' },
      h('div.sec-head', h('span.num', { 'aria-hidden': 'true' }, '03'), h('h2', { id: 'kg-vocab' }, 'Relation vocabulary')),
      h('div.kg-vocab', M.rel.predicates.map((p) => h('article',
        h('p.label', lineSample(p.class), ' ', `${p.label} · ${M.classes.get(p.class).label}`),
        h('p.body-s', p.definition), h('p.body-s.ink-2', h('span.label', 'Direction · '), p.direction),
        h('p.body-s.ink-2', h('span.label', 'Required evidence · '), p.required_evidence),
        h('p.body-s.ink-2', h('span.label', 'Limit · '), p.limits))))),
    liveEl);
  R = { root, svg, world, caption, selbar: selbarEl, detail: detailEl, rail, tabs: tabsEl, table: tableEl, expandBtn, qEdges: new Set(), hover: null, suppress: false,
    live: (t) => { liveEl.textContent = ''; setTimeout(() => { liveEl.textContent = t; }, 50); } };
  bindPointer();
  root.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && root.classList.contains('kg--expanded')) { ev.preventDefault(); expand(false); } });
  new ResizeObserver(() => { if (!T.moved) fit(); }).observe(plate);
  return root;
}

// Route entry point. The first call builds the view; later calls on the same
// mounted view only apply the new query, so pan, zoom and focus survive.
export function graphView(db, q, ctx) {
  model(db);
  const mounted = R && document.contains(R.root);
  if (!mounted) { R = null; document.documentElement.classList.remove('kg-lock'); }
  st = readQuery(q);
  if (!R) {
    const root = build(db, ctx);
    tabs(); draw(); detail();
    requestAnimationFrame(() => fit());
    return { title: 'Knowledge Graph', nodes: [root] };
  }
  rerender({ animate: true });
  return { title: 'Knowledge Graph', nodes: [R.root], inPlace: true };
}

// Used by dossiers: the documented relations and non-relations of one item.
export function relationsOf(db, id) {
  model(db);
  return {
    rels: M.edges.filter((e) => e.source === id || e.target === id)
      .sort((a, b) => CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class) || a.predicate.localeCompare(b.predicate)),
    non: M.rel.non_relationships.filter((x) => x.subject === id || x.objects.includes(id)),
    label: (e) => `${nm(e.source)} ${predLabel(e)} ${nm(e.target)}`,
    cls: (e) => M.classes.get(e.class).label,
    name: nm,
  };
}
