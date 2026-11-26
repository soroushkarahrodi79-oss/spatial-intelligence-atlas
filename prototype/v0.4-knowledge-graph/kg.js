// Research Relationships — v0.4 prototype.
// Native ES module; no dependencies, no third-party requests, no persistence.
// Reads graph.json (this proposal) and ../../data/atlas.json (the released
// v0.3 dataset, read-only). Layout is deterministic: the same data and state
// always produce the same picture. Every answer below is computed from the
// relationship records, and each one links back to them.

const SVGNS = 'http://www.w3.org/2000/svg';
const $ = (sel, root = document) => root.querySelector(sel);

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  setAttrs(el, attrs);
  append(el, kids);
  return el;
}
function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  setAttrs(el, attrs);
  append(el, kids);
  return el;
}
function setAttrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
}
function append(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
}

const CLASS_LABEL = {
  documented_research: 'DOCUMENTED RESEARCH', experiment: 'EXPERIMENT',
  research_platform: 'RESEARCH PLATFORM', instrument: 'INSTRUMENT',
};
const KIND_LABEL = { method: 'METHOD', dataset: 'DATASET', territory: 'TERRITORY', output: 'OUTPUT' };
const CLASS_ORDER = ['technical', 'structural', 'methodological', 'territorial', 'hypothetical', 'conceptual'];
const FILTERABLE = ['technical', 'structural', 'methodological', 'territorial'];
// Reading order for items: families stay together; never a ranking.
const ORDER = ['r-hati-pilot', 'r-hati-pedestrian', 'p-lens', 'r-network-pilot', 'x-pnoa-lidar-pilot',
  'x-madrid-mcp', 'x-studio', 'x-sk-lab', 'x-tid', 'r-snto-pnsg', 'p-snto', 'x-snto-alpine',
  'i-fieldos', 'x-transit', 'x-isovist'];

const VIEWS = [
  { id: 'ecosystem', label: 'Ecosystem', title: 'Research ecosystem', kinds: ['research'],
    preds: ['depends_on', 'consumes_output_of', 'derived_from', 'hosts', 'extends', 'potential_application', 'conceptually_related'],
    cols: 'layered', band: 'NO DOCUMENTED RELATIONSHIP TO ANOTHER ITEM',
    note: 'Items and the documented links between them. Arrows point from the dependent, reading, deriving, extending or hosting item to the item it relies on or hosts.' },
  { id: 'methods', label: 'Methods', title: 'Methodology', kinds: ['research', 'method'],
    preds: ['applies_method', 'extends'], cols: (n) => (n.kind === 'method' ? 1 : 0),
    band: 'NO METHOD NODE RECORDED FOR THESE ITEMS',
    note: 'Each item links to the method its own methodology source names. A method node shared by two items means a named method in common, not shared configuration, inputs or validity.' },
  { id: 'lineage', label: 'Data & outputs', title: 'Dataset and publication lineage', kinds: ['dataset', 'research', 'output'],
    preds: ['uses_dataset', 'has_output', 'consumes_output_of'], cols: (n) => ({ dataset: 0, research: 1, output: 2 })[n.kind],
    band: 'NO DATASET OR OUTPUT RECORDED FOR THESE ITEMS',
    note: 'Datasets on the left, items in the centre, outputs on the right. Each dataset link records the extract, product or vintage used: a common dataset does not establish comparability or agreement.' },
  { id: 'territories', label: 'Territories', title: 'Territorial frame', kinds: ['research', 'territory'],
    preds: ['situated_in', 'within'], cols: null, band: 'NO CASE-SPECIFIC TERRITORY',
    note: 'Items link to the territory their source names; a smaller territory links to the one that contains it. Positions are not geographic and overlap is never computed.' },
];
const FOCUS = { id: 'focus', label: 'Neighbourhood', title: 'Neighbourhood', note: 'The selected node and every relationship touching it, across all views.' };

const st = {
  view: 'ecosystem', sel: null, focus: null, q: null,
  cls: new Set(FILTERABLE), hyp: false, dev: false,
};
let M = null;          // model
let L = null;          // current layout
const T = { x: 0, y: 0, k: 1, moved: false };

// ---------------------------------------------------------------- model
function index(arr) { return new Map(arr.map((x) => [x.id, x])); }
function group(arr, key) {
  const m = new Map();
  for (const x of arr) { if (!m.has(x[key])) m.set(x[key], []); m.get(x[key]).push(x); }
  return m;
}

function buildModel(atlas, g) {
  const AR = index(atlas.research), AT = index(atlas.territories), AO = index(atlas.outputs);
  const outcomes = group(atlas.outcomes, 'research_id');
  const findings = group(atlas.findings, 'research_id');
  const evidence = group(atlas.evidence, 'research_id');
  const sources = new Map();
  for (const x of atlas.sources) sources.set(x.id, { ...x, origin: 'atlas' });
  for (const x of g.sources) sources.set(x.id, { ...x, origin: 'graph' });
  const preds = index(g.predicates);
  const classes = index(g.classes);

  const nodes = new Map();
  for (const n of g.nodes) {
    let node;
    if (n.atlas && n.kind === 'research') {
      const r = AR.get(n.id);
      const o = (outcomes.get(n.id) || [])[0] || null;
      node = { id: n.id, kind: 'research', atlas: true, admission: 'atlas', class: r.class, title: r.title,
        short: r.short_title, summary: r.summary, state_label: o ? o.verdict_label : null,
        lifecycle: r.lifecycle_status, license_code: r.license && r.license.code ? r.license.code.value : null,
        source_ids: r.source_ids, claim_ceiling: o ? o.claim_ceiling : null, claim_limits: r.claim_limits || null,
        findings: findings.get(n.id) || [], evidence: evidence.get(n.id) || [],
        dossier: `../../#/research/${n.id}` };
    } else if (n.atlas && n.kind === 'territory') {
      const t = AT.get(n.id);
      node = { id: n.id, kind: 'territory', atlas: true, admission: 'atlas', title: t.label, short: n.short || t.label,
        summary: t.basis, source_ids: t.source_ids, plate: t.geometry_id ? `../../#/atlas/${n.id}` : null };
    } else if (n.atlas && n.kind === 'output') {
      const o = AO.get(n.id);
      node = { id: n.id, kind: 'output', atlas: true, admission: 'atlas', title: o.citation, short: n.short,
        summary: `${o.publication_type.replace('_', ' ')} · ${o.editorial_status.replaceAll('_', ' ')} · ${o.identifier.availability === 'pid' ? `${o.identifier.scheme.toUpperCase()} ${o.identifier.value}` : 'no persistent identifier'}`,
        source_ids: [o.source_id], research_id: o.research_id, url: o.url || null };
    } else {
      node = { admission: n.kind === 'research' ? (n.admission || 'candidate') : 'proposal', ...n };
    }
    nodes.set(node.id, node);
  }

  const edges = [];
  const derivedNote = 'Derived from the released v0.3 record, unchanged. Its content was frozen at Gate 2; per-claim human verification (SPEC §12.10, A2) is pending.';
  for (const r of atlas.research) {
    for (const hid of r.hosts || []) {
      edges.push({ id: `atlas:hosts:${r.id}:${hid}`, predicate: 'hosts', class: 'structural', public: true, derived: true,
        source: r.id, target: hid,
        explanation: `The v0.3 platform record lists this item as hosted.${r.hosts_note ? ' ' + r.hosts_note : ''}`,
        evidence: r.source_ids.map((x) => ({ source: x, quote_summary: 'v0.3 platform record (`hosts`).' })), limits: [] });
    }
    for (const tid of r.territory_ids || []) {
      const t = AT.get(tid);
      edges.push({ id: `atlas:situated_in:${r.id}:${tid}`, predicate: 'situated_in', class: 'territorial', public: true, derived: true,
        source: r.id, target: tid, explanation: t.basis,
        evidence: t.source_ids.map((x) => ({ source: x, quote_summary: 'v0.3 territory record.' })), limits: [] });
    }
  }
  for (const o of atlas.outputs) {
    edges.push({ id: `atlas:has_output:${o.research_id}:${o.id}`, predicate: 'has_output', class: 'structural', public: true, derived: true,
      source: o.research_id, target: o.id, explanation: o.citation,
      evidence: [{ source: o.source_id, quote_summary: 'v0.3 output record (I16).' }], limits: [] });
  }
  for (const e of g.relationships) edges.push({ ...e, derived: false });
  for (const e of edges) e.derivedNote = e.derived ? derivedNote : null;

  return { atlas, g, nodes, edges, sources, preds, classes, nonrel: g.non_relationships,
    edgeById: new Map(edges.map((e) => [e.id, e])) };
}

// ---------------------------------------------------------------- visibility
const nodeAllowed = (n) => n && (n.admission !== 'deferred' || st.dev);
function edgeVisible(e) {
  if (!e.public && !st.dev) return false;
  if (e.class === 'hypothetical' && !st.hyp) return false;
  if (e.class === 'conceptual' && !st.dev) return false;
  if (FILTERABLE.includes(e.class) && !st.cls.has(e.class)) return false;
  return nodeAllowed(M.nodes.get(e.source)) && nodeAllowed(M.nodes.get(e.target));
}
const ordIdx = (id) => { const i = ORDER.indexOf(id); return i < 0 ? 100 + [...M.nodes.keys()].indexOf(id) : i; };

function viewGraph() {
  if (st.view === 'focus' && M.nodes.has(st.focus)) {
    const edges = M.edges.filter((e) => edgeVisible(e) && (e.source === st.focus || e.target === st.focus));
    const ids = new Set([st.focus]);
    edges.forEach((e) => { ids.add(e.source); ids.add(e.target); });
    return { view: FOCUS, nodes: [...ids].map((id) => M.nodes.get(id)), edges, band: [] };
  }
  const V = VIEWS.find((v) => v.id === st.view) || VIEWS[0];
  const kinds = new Set(V.kinds);
  const edges = M.edges.filter((e) => V.preds.includes(e.predicate) && edgeVisible(e)
    && kinds.has(M.nodes.get(e.source).kind) && kinds.has(M.nodes.get(e.target).kind));
  const touched = new Set();
  edges.forEach((e) => { touched.add(e.source); touched.add(e.target); });
  const nodes = [], band = [];
  for (const n of M.nodes.values()) {
    if (!kinds.has(n.kind) || !nodeAllowed(n)) continue;
    if (touched.has(n.id)) nodes.push(n);
    else if (n.kind === 'research') band.push(n);
  }
  band.sort((a, b) => ordIdx(a.id) - ordIdx(b.id));
  return { view: V, nodes, edges, band };
}

// ---------------------------------------------------------------- layout
let COLW = 290;
const ROWH = 62;

function columnsFor(G) {
  const col = new Map();
  if (G.view.cols === 'layered') {
    const out = new Map(G.nodes.map((n) => [n.id, []]));
    G.edges.forEach((e) => { if (e.class !== 'conceptual') out.get(e.source).push(e.target); });
    const memo = new Map();
    const height = (id, depth = 0) => {
      if (memo.has(id)) return memo.get(id);
      if (depth > 50) return 0;
      const hgt = Math.max(0, ...out.get(id).map((t) => height(t, depth + 1) + 1));
      memo.set(id, hgt);
      return hgt;
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
  const pos = new Map();
  if (G.view.id === 'focus') {
    const c = st.focus;
    pos.set(c, { x: 0, y: 0, anchor: 'start' });
    const nb = G.nodes.filter((n) => n.id !== c);
    const ePer = (id) => G.edges.find((e) => e.source === id || e.target === id);
    nb.sort((a, b) => {
      const ea = ePer(a.id), eb = ePer(b.id);
      return CLASS_ORDER.indexOf(ea.class) - CLASS_ORDER.indexOf(eb.class)
        || ea.predicate.localeCompare(eb.predicate) || ordIdx(a.id) - ordIdx(b.id);
    });
    const R = Math.max(200, nb.length * 30);
    nb.forEach((n, i) => {
      const a = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, nb.length);
      const x = Math.round(Math.cos(a) * R * 1.25), y = Math.round(Math.sin(a) * R);
      pos.set(n.id, { x, y, anchor: Math.cos(a) < -0.15 ? 'end' : 'start' });
    });
    return { pos, bandY: null, G };
  }
  COLW = G.view.cols === 'layered' ? 250 : 300;
  const col = columnsFor(G);
  const ncol = Math.max(0, ...col.values()) + 1;
  const cols = Array.from({ length: ncol }, () => []);
  [...G.nodes].sort((a, b) => ordIdx(a.id) - ordIdx(b.id)).forEach((n) => cols[col.get(n.id)].push(n.id));
  const nbrs = new Map(G.nodes.map((n) => [n.id, []]));
  G.edges.forEach((e) => { nbrs.get(e.source).push(e.target); nbrs.get(e.target).push(e.source); });
  const yOf = new Map();
  const place = () => cols.forEach((c) => c.forEach((id, i) => yOf.set(id, i - (c.length - 1) / 2)));
  place();
  for (let it = 0; it < 6; it++) {
    const seq = it % 2 ? [...cols.keys()].reverse() : [...cols.keys()];
    for (const ci of seq) {
      const c = cols[ci];
      const key = new Map(c.map((id, i) => {
        const ns = nbrs.get(id).filter((o) => col.get(o) !== ci);
        return [id, [ns.length ? ns.reduce((a, o) => a + yOf.get(o), 0) / ns.length : yOf.get(id), i]];
      }));
      c.sort((a, b) => key.get(a)[0] - key.get(b)[0] || key.get(a)[1] - key.get(b)[1]);
      place();
    }
  }
  cols.forEach((c, ci) => c.forEach((id) => pos.set(id, { x: ci * COLW, y: Math.round(yOf.get(id) * ROWH), anchor: 'start' })));
  const half = Math.max(0, ...cols.map((c) => (c.length - 1) / 2));
  let bandY = null;
  if (G.band.length) {
    bandY = Math.round(half * ROWH + 104);
    const per = Math.max(3, ncol);
    G.band.forEach((n, k) => pos.set(n.id, { x: (k % per) * COLW, y: bandY + 34 + Math.floor(k / per) * ROWH, anchor: 'start' }));
  }
  return { pos, bandY, G, ncol: Math.max(ncol, G.band.length ? 3 : 1) };
}

// ---------------------------------------------------------------- drawing
function glyph(n) {
  const g = s('g', { class: 'n__glyph' });
  if (n.kind === 'research') {
    if (n.class === 'documented_research') g.append(s('circle', { r: 7.5, class: 'n__g n__g--solid' }));
    else if (n.class === 'experiment') g.append(s('circle', { r: 7.5, class: 'n__g' }), s('circle', { r: 2.75, class: 'n__g n__g--solid' }));
    else if (n.class === 'research_platform') g.append(s('rect', { x: -7, y: -7, width: 14, height: 14, class: 'n__g n__g--solid' }));
    else g.append(s('path', { d: 'M0 -9 L9 0 L0 9 L-9 0 Z', class: 'n__g n__g--solid' }));
  } else if (n.kind === 'method') g.append(s('path', { d: 'M0 -8.5 L8 6 L-8 6 Z', class: 'n__g' }));
  else if (n.kind === 'dataset') g.append(s('rect', { x: -8, y: -6.5, width: 16, height: 13, class: 'n__g' }), s('path', { d: 'M-8 -2 H8 M-2.5 -2 V6.5', class: 'n__g' }));
  else if (n.kind === 'territory') g.append(s('path', { d: 'M-8 0 L-4 -7 L4 -7 L8 0 L4 7 L-4 7 Z', class: 'n__g' }));
  else g.append(s('path', { d: 'M-6 -8 H3 L6 -5 V8 H-6 Z M3 -8 V-5 H6', class: 'n__g' }));
  return g;
}
function subLabel(n) {
  const base = n.kind === 'research' ? CLASS_LABEL[n.class] || 'ITEM' : KIND_LABEL[n.kind];
  if (n.admission === 'candidate') return `${base} · CANDIDATE`;
  if (n.admission === 'deferred') return `${base} · DEFERRED`;
  return base;
}
function admissionText(n) {
  if (n.admission === 'atlas') return 'in the released Atlas';
  if (n.admission === 'candidate') return 'candidate, not an admitted Atlas item';
  if (n.admission === 'deferred') return 'deferred, development inventory only';
  return 'proposed node';
}

function defs() {
  const d = $('#kg-defs');
  d.replaceChildren(
    s('marker', { id: 'mk', viewBox: '0 0 10 10', refX: 22, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' },
      s('path', { d: 'M0 0 L10 5 L0 10 Z', class: 'mk' })),
    s('marker', { id: 'mk-open', viewBox: '0 0 10 10', refX: 22, refY: 5, markerWidth: 9, markerHeight: 9, markerUnits: 'userSpaceOnUse', orient: 'auto-start-reverse' },
      s('path', { d: 'M1 1 L9 5 L1 9', class: 'mk-open' })),
  );
}

function bez(a, b, focus) {
  if (focus) return { d: `M${a.x},${a.y} L${b.x},${b.y}`, mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 } };
  let p1, p2;
  if (Math.abs(a.x - b.x) < 1) {
    const dx = 64 + Math.abs(a.y - b.y) * 0.22;
    p1 = { x: a.x - dx, y: a.y }; p2 = { x: b.x - dx, y: b.y };
  } else {
    const mx = (a.x + b.x) / 2;
    p1 = { x: mx, y: a.y }; p2 = { x: mx, y: b.y };
  }
  const mid = { x: 0.125 * a.x + 0.375 * p1.x + 0.375 * p2.x + 0.125 * b.x, y: 0.125 * a.y + 0.375 * p1.y + 0.375 * p2.y + 0.125 * b.y };
  return { d: `M${a.x},${a.y} C${p1.x},${p1.y} ${p2.x},${p2.y} ${b.x},${b.y}`, mid };
}

function draw() {
  const G = viewGraph();
  L = layout(G);
  const isFocus = G.view.id === 'focus';
  const bands = $('#kg-bands'), eg = $('#kg-edges'), ng = $('#kg-nodes');
  bands.replaceChildren(); eg.replaceChildren(); ng.replaceChildren();

  if (L.bandY != null) {
    const w = (L.ncol - 1) * COLW + 220;
    bands.append(s('line', { x1: -20, x2: w, y1: L.bandY, y2: L.bandY, class: 'band-r' }),
      s('text', { x: -20, y: L.bandY + 18, class: 'band-t', text: G.view.band }));
  }
  for (const e of G.edges) {
    const a = L.pos.get(e.source), b = L.pos.get(e.target);
    const { d, mid } = bez(a, b, isFocus);
    const marker = e.class === 'conceptual' ? null : e.class === 'hypothetical' ? 'url(#mk-open)' : 'url(#mk)';
    const path = s('path', { d, class: `e e--${e.class}${e.public ? '' : ' e--nonpublic'}`, 'data-e': e.id, 'marker-end': marker });
    const hit = s('path', { d, class: 'e-hit', 'data-e': e.id });
    const pr = M.preds.get(e.predicate);
    const lab = s('text', { x: mid.x, y: mid.y - 5, 'text-anchor': 'middle', class: 'e-lab', 'data-e': e.id, text: pr ? pr.label : e.predicate });
    lab.style.display = 'none';
    eg.append(path, hit, lab);
  }
  const all = [...G.nodes, ...G.band];
  for (const n of all) {
    const p = L.pos.get(n.id);
    const deg = G.edges.filter((e) => e.source === n.id || e.target === n.id).length;
    const end = p.anchor === 'end';
    const gEl = s('g', { class: `n n--${n.admission}`, transform: `translate(${p.x},${p.y})`, tabindex: 0, role: 'button',
      'data-n': n.id, 'aria-label': `${n.title}. ${subLabel(n).toLowerCase()}, ${admissionText(n)}. ${deg} relationship${deg === 1 ? '' : 's'} in this view.`,
      'aria-pressed': st.sel && st.sel.type === 'node' && st.sel.id === n.id ? 'true' : 'false' },
    s('circle', { r: 13, class: 'n__ring' }), glyph(n),
    s('text', { x: end ? -16 : 16, y: -1, 'text-anchor': end ? 'end' : 'start', class: 'n__t', text: n.short || n.title }),
    s('text', { x: end ? -16 : 16, y: 13, 'text-anchor': end ? 'end' : 'start', class: 'n__s', text: subLabel(n) }));
    ng.append(gEl);
  }
  paintHot();
  caption(G);
  table(G);
  $('#kg').setAttribute('aria-busy', 'false');
}

function caption(G) {
  const nItems = [...G.nodes, ...G.band].filter((n) => n.kind === 'research').length;
  const nPub = G.edges.filter((e) => e.public).length, nDev = G.edges.length - nPub;
  const title = G.view.id === 'focus' ? `Neighbourhood of ${M.nodes.get(st.focus).short}` : G.view.title;
  $('#kg-plate-title').textContent = `Plate K · ${title}`;
  $('#kg-caption-text').textContent = `${G.view.note} ${nItems} item${nItems === 1 ? '' : 's'}, ${nPub} documented relationship${nPub === 1 ? '' : 's'}${nDev ? ` and ${nDev} development-inventory reading${nDev === 1 ? '' : 's'}` : ''} shown. Positions show relationship structure only: they are not geographic and are not a ranking.`;
}

// highlight selection/hover neighbourhood
let hover = null;
function paintHot() {
  const svg = $('#kg-svg');
  const keyNode = hover || (st.sel && st.sel.type === 'node' ? st.sel.id : null);
  const keyEdge = st.sel && st.sel.type === 'edge' ? st.sel.id : null;
  const hotN = new Set(), hotE = new Set();
  if (keyNode) {
    hotN.add(keyNode);
    L.G.edges.forEach((e) => { if (e.source === keyNode || e.target === keyNode) { hotE.add(e.id); hotN.add(e.source); hotN.add(e.target); } });
  }
  if (keyEdge) {
    const e = M.edgeById.get(keyEdge);
    if (e) { hotE.add(e.id); hotN.add(e.source); hotN.add(e.target); }
  }
  if (!keyNode && !keyEdge && st.q && qEdges.size) {
    L.G.edges.forEach((e) => { if (qEdges.has(e.id)) { hotE.add(e.id); hotN.add(e.source); hotN.add(e.target); } });
  }
  svg.classList.toggle('dim', hotN.size > 0);
  const showLab = !!keyEdge || (!!keyNode && hotE.size <= 8);
  svg.querySelectorAll('.n').forEach((el) => {
    const id = el.dataset.n;
    el.classList.toggle('n--hot', hotN.has(id));
    el.classList.toggle('n--sel', !!(st.sel && st.sel.type === 'node' && st.sel.id === id));
    el.setAttribute('aria-pressed', st.sel && st.sel.type === 'node' && st.sel.id === id ? 'true' : 'false');
  });
  svg.querySelectorAll('.e, .e-lab').forEach((el) => {
    const id = el.dataset.e;
    el.classList.toggle('e--hot', hotE.has(id));
    if (el.classList.contains('e')) el.classList.toggle('e--sel', id === keyEdge);
    if (el.classList.contains('e-lab')) el.style.display = hotE.has(id) && showLab ? '' : 'none';
  });
  document.querySelectorAll('#kg-table tr[data-e]').forEach((tr) => tr.classList.toggle('is-sel', tr.dataset.e === keyEdge));
}

// ---------------------------------------------------------------- pan / zoom
function applyT() { $('#kg-world').setAttribute('transform', `translate(${T.x},${T.y}) scale(${T.k})`); }
// On narrow plates a whole-graph fit would be unreadable, so the initial
// view keeps a legible minimum scale and centres the selection (or the
// content); the Fit button always shows everything.
const MIN_READABLE_K = 0.62;
function fit(all = false) {
  if (!L) return;
  const svg = $('#kg-svg');
  const W = svg.clientWidth;
  let H = svg.clientHeight;
  if (!W || !H) return;
  // Measure the drawn content (labels included) in world coordinates.
  const bb = $('#kg-world').getBBox();
  const x0 = bb.x, y0 = bb.y, x1 = bb.x + bb.width, y1 = bb.y + bb.height;
  const pad = 24;
  const top = 64; // strip kept clear for the zoom controls
  const plate = $('#kg-plate');
  let k = Math.min((W - 2 * pad) / (x1 - x0), 1.5);
  const readable = !all && k < MIN_READABLE_K;
  if (readable) k = MIN_READABLE_K;
  // Size the plate to the content so short views do not float in empty space.
  const maxH = Math.max(360, Math.min(window.innerHeight * 0.78, 760));
  const want = Math.round(Math.min(maxH, Math.max(360, (y1 - y0) * k + top + pad)));
  if (Math.abs(plate.clientHeight - want) > 2) { plate.style.height = `${want}px`; }
  H = svg.clientHeight;
  k = Math.min(k, Math.max(readable ? MIN_READABLE_K : 0, (H - top - pad) / (y1 - y0)));
  T.k = Math.max(0.25, k);
  let cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  if (readable && st.sel) {
    const ids = st.sel.type === 'node' ? [st.sel.id] : (() => { const e = M.edgeById.get(st.sel.id); return e ? [e.source, e.target] : []; })();
    const ps = ids.map((id) => L.pos.get(id)).filter(Boolean);
    if (ps.length) { cx = ps.reduce((a, p) => a + p.x, 0) / ps.length + 60; cy = ps.reduce((a, p) => a + p.y, 0) / ps.length; }
  } else if (readable) {
    cx = x0 + (W / 2 - pad) / T.k; // start at the left edge, reading order
  }
  T.x = W / 2 - cx * T.k;
  T.y = top + (H - top - pad) / 2 - cy * T.k;
  T.moved = false;
  applyT();
}
function zoomAt(px, py, f) {
  const k = Math.min(3, Math.max(0.25, T.k * f));
  T.x = px - ((px - T.x) * k) / T.k;
  T.y = py - ((py - T.y) * k) / T.k;
  T.k = k; T.moved = true; applyT();
}
function initPanZoom() {
  const svg = $('#kg-svg');
  svg.setAttribute('tabindex', '0');
  svg.setAttribute('aria-roledescription', 'relationship graph');
  svg.addEventListener('wheel', (ev) => {
    ev.preventDefault();
    const r = svg.getBoundingClientRect();
    zoomAt(ev.clientX - r.left, ev.clientY - r.top, Math.exp(-ev.deltaY * 0.0015));
  }, { passive: false });
  const ptrs = new Map();
  let start = null, pinch = null;
  svg.addEventListener('pointerdown', (ev) => {
    ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ptrs.size === 1) start = { x: ev.clientX, y: ev.clientY, tx: T.x, ty: T.y, moved: false };
    if (ptrs.size === 2) {
      const [p, q] = [...ptrs.values()];
      pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), k: T.k };
    }
  });
  svg.addEventListener('pointermove', (ev) => {
    if (!ptrs.has(ev.pointerId)) return;
    ptrs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    if (ptrs.size === 2 && pinch) {
      const [p, q] = [...ptrs.values()];
      const r = svg.getBoundingClientRect();
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      zoomAt((p.x + q.x) / 2 - r.left, (p.y + q.y) / 2 - r.top, (pinch.k * (d / pinch.d)) / T.k);
      if (start) start.moved = true;
      return;
    }
    if (!start) return;
    const dx = ev.clientX - start.x, dy = ev.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 4) return;
    if (!start.moved) { start.moved = true; svg.classList.add('dragging'); try { svg.setPointerCapture(ev.pointerId); } catch { /* ignore */ } }
    T.x = start.tx + dx; T.y = start.ty + dy; T.moved = true; applyT();
  });
  const end = (ev) => {
    ptrs.delete(ev.pointerId);
    if (ptrs.size < 2) pinch = null;
    if (ptrs.size === 0) {
      if (start && start.moved) svg.dataset.suppress = '1';
      start = null; svg.classList.remove('dragging');
    }
  };
  svg.addEventListener('pointerup', end);
  svg.addEventListener('pointercancel', end);
  svg.addEventListener('click', (ev) => {
    if (svg.dataset.suppress) { delete svg.dataset.suppress; return; }
    const n = ev.target.closest('.n');
    const e = ev.target.closest('[data-e]');
    if (n) select({ type: 'node', id: n.dataset.n });
    else if (e) select({ type: 'edge', id: e.dataset.e });
    else if (st.sel) select(null);
  });
  svg.addEventListener('pointerover', (ev) => {
    const n = ev.target.closest('.n');
    const id = n ? n.dataset.n : null;
    if (id !== hover) { hover = id; paintHot(); }
  });
  svg.addEventListener('pointerleave', () => { if (hover) { hover = null; paintHot(); } });
  svg.addEventListener('keydown', (ev) => {
    const n = ev.target.closest('.n');
    if (n && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); select({ type: 'node', id: n.dataset.n }); return; }
    const W = svg.clientWidth, H = svg.clientHeight;
    const step = 60;
    const map = { '+': () => zoomAt(W / 2, H / 2, 1.25), '=': () => zoomAt(W / 2, H / 2, 1.25), '-': () => zoomAt(W / 2, H / 2, 0.8), '0': fit,
      ArrowLeft: () => { T.x += step; applyT(); }, ArrowRight: () => { T.x -= step; applyT(); },
      ArrowUp: () => { T.y += step; applyT(); }, ArrowDown: () => { T.y -= step; applyT(); },
      Escape: () => select(null) };
    if (map[ev.key] && (ev.target === svg || ['+', '=', '-', '0', 'Escape'].includes(ev.key))) { ev.preventDefault(); map[ev.key](); }
  });
  svg.addEventListener('focusin', (ev) => {
    const n = ev.target.closest('.n');
    if (n) { hover = n.dataset.n; paintHot(); }
  });
  svg.addEventListener('focusout', () => { hover = null; paintHot(); });
  document.querySelectorAll('[data-zoom]').forEach((b) => b.addEventListener('click', () => {
    const W = svg.clientWidth, H = svg.clientHeight;
    if (b.dataset.zoom === 'fit') fit(true); else zoomAt(W / 2, H / 2, b.dataset.zoom === 'in' ? 1.25 : 0.8);
  }));
  new ResizeObserver(() => { if (!T.moved) fit(); }).observe($('#kg-plate'));
}

// ---------------------------------------------------------------- state / hash
function readHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  const v = p.get('view');
  st.view = [...VIEWS.map((x) => x.id), 'focus'].includes(v) ? v : 'ecosystem';
  st.focus = p.get('focus') && M.nodes.has(p.get('focus')) ? p.get('focus') : null;
  if (st.view === 'focus' && !st.focus) st.view = 'ecosystem';
  st.hyp = p.get('hyp') === '1';
  st.dev = p.get('dev') === '1';
  st.cls = p.has('cls') ? new Set(p.get('cls').split('.').filter((c) => FILTERABLE.includes(c))) : new Set(FILTERABLE);
  st.q = p.get('q');
  if (p.get('node') && M.nodes.has(p.get('node'))) st.sel = { type: 'node', id: p.get('node') };
  else if (p.get('edge') && M.edgeById.has(p.get('edge'))) st.sel = { type: 'edge', id: p.get('edge') };
  else st.sel = null;
}
function hashOf() {
  const p = new URLSearchParams();
  p.set('view', st.view);
  if (st.view === 'focus' && st.focus) p.set('focus', st.focus);
  if (st.sel) p.set(st.sel.type, st.sel.id);
  else if (st.q) p.set('q', st.q);
  if (st.cls.size !== FILTERABLE.length) p.set('cls', [...st.cls].join('.'));
  if (st.hyp) p.set('hyp', '1');
  if (st.dev) p.set('dev', '1');
  return '#' + p.toString();
}
function writeHash() { history.replaceState(null, '', hashOf()); }

// ---------------------------------------------------------------- interactions
function inView(sel) {
  if (!sel || !L) return true;
  if (sel.type === 'node') return L.pos.has(sel.id);
  return L.G.edges.some((e) => e.id === sel.id);
}
function select(sel, { keepView = false } = {}) {
  st.sel = sel;
  if (sel) st.q = null;
  if (sel && !keepView && !inView(sel)) {
    const e = sel.type === 'edge' ? M.edgeById.get(sel.id) : null;
    if (e && !edgeVisible(e)) {
      if (e.class === 'hypothetical') st.hyp = true;
      if (!e.public || e.class === 'conceptual') st.dev = true;
      if (FILTERABLE.includes(e.class)) st.cls.add(e.class);
      syncControls();
    }
    st.focus = sel.type === 'node' ? sel.id : e.source;
    st.view = 'focus';
    render();
  } else {
    paintHot();
    detail();
    tabs();
  }
  writeHash();
  const live = $('#kg-live');
  if (!sel) live.textContent = 'Selection cleared.';
  else if (sel.type === 'node') live.textContent = `Selected ${M.nodes.get(sel.id).title}. Details shown in the panel.`;
  else { const e = M.edgeById.get(sel.id); live.textContent = `Selected relationship: ${M.nodes.get(e.source).short} ${M.preds.get(e.predicate).label} ${M.nodes.get(e.target).short}.`; }
}
function setView(id) {
  st.view = id;
  if (id !== 'focus') st.focus = st.view === 'focus' ? st.focus : st.focus;
  render();
  writeHash();
}

function tabs() {
  const box = $('#kg-views');
  box.replaceChildren();
  const list = [...VIEWS];
  if (st.focus) list.push({ id: 'focus', label: `Neighbourhood: ${M.nodes.get(st.focus).short}` });
  list.forEach((v) => {
    const on = st.view === v.id;
    box.append(h('button', { class: 'tab', role: 'tab', type: 'button', 'aria-selected': on ? 'true' : 'false', tabindex: on ? '0' : '-1',
      'aria-controls': 'kg-plate', 'data-view': v.id, onclick: () => setView(v.id), text: v.label }));
  });
}

function lineSample(cls, w = 34) {
  const dash = { technical: null, structural: null, methodological: '6 3', territorial: '12 4', hypothetical: '1 5', conceptual: '2 3' }[cls];
  const sw = { technical: 2.25, hypothetical: 1.6, conceptual: 1.4 }[cls] || 1.2;
  return s('svg', { width: w, height: 12, viewBox: `0 0 ${w} 12`, 'aria-hidden': 'true', focusable: 'false' },
    s('line', { x1: 1, x2: w - 1, y1: 6, y2: 6, stroke: 'currentColor', 'stroke-width': sw, 'stroke-dasharray': dash, 'stroke-linecap': cls === 'hypothetical' ? 'round' : 'butt' }));
}

function controls() {
  const fs = $('#kg-filters');
  [...fs.querySelectorAll('label')].forEach((x) => x.remove());
  for (const c of FILTERABLE) {
    const def = M.classes.get(c);
    fs.append(h('label', { class: 'chk' },
      h('input', { type: 'checkbox', 'data-cls': c, checked: st.cls.has(c), onchange: (ev) => {
        if (ev.target.checked) st.cls.add(c); else st.cls.delete(c);
        render(); writeHash();
      } }), lineSample(c), def.label.toLowerCase().replace(/^\w/, (m) => m.toUpperCase())));
  }
  fs.append(h('label', { class: 'chk chk--sep' },
    h('input', { type: 'checkbox', id: 'kg-hyp', checked: st.hyp, onchange: (ev) => { st.hyp = ev.target.checked; render(); writeHash(); } }),
    lineSample('hypothetical'), 'Hypothetical (source-named, not undertaken)'));
  fs.append(h('label', { class: 'chk' },
    h('input', { type: 'checkbox', id: 'kg-dev-toggle', checked: st.dev, onchange: (ev) => { st.dev = ev.target.checked; render(); writeHash(); } }),
    lineSample('conceptual'), 'Development inventory (not public)'));
}
function syncControls() {
  document.querySelectorAll('[data-cls]').forEach((i) => { i.checked = st.cls.has(i.dataset.cls); });
  $('#kg-hyp').checked = st.hyp;
  $('#kg-dev-toggle').checked = st.dev;
}

function legend() {
  const box = $('#kg-legend');
  const glyphSvg = (n) => s('svg', { width: 22, height: 22, viewBox: '-11 -11 22 22', 'aria-hidden': 'true', focusable: 'false' }, glyph(n));
  const ringSvg = (cls) => s('svg', { width: 22, height: 22, viewBox: '-11 -11 22 22', 'aria-hidden': 'true', focusable: 'false' },
    s('g', { class: `n n--${cls}` }, s('circle', { r: 9.5, class: 'n__ring' }), s('circle', { r: 4, class: 'n__g n__g--solid' })));
  box.replaceChildren(
    h('p', { class: 'label legend__head', text: 'Nodes' }),
    ...[
      [{ kind: 'research', class: 'documented_research' }, 'Documented research'],
      [{ kind: 'research', class: 'experiment' }, 'Experiment'],
      [{ kind: 'research', class: 'research_platform' }, 'Research platform'],
      [{ kind: 'research', class: 'instrument' }, 'Instrument'],
      [{ kind: 'method' }, 'Method'], [{ kind: 'dataset' }, 'Dataset (family; extract on each link)'],
      [{ kind: 'territory' }, 'Territory (text, not geometry)'], [{ kind: 'output' }, 'Output'],
    ].map(([n, t]) => h('span', { class: 'legend__item' }, glyphSvg(n), t)),
    h('span', { class: 'legend__item' }, ringSvg('candidate'), 'Dashed ring: candidate, not an admitted Atlas item'),
    h('p', { class: 'label legend__head', text: 'Relationships' }),
    ...CLASS_ORDER.map((c) => h('span', { class: 'legend__item' }, lineSample(c), M.classes.get(c).label.toLowerCase().replace(/^\w/, (m) => m.toUpperCase()) + (M.classes.get(c).public ? '' : ' — not public'))),
  );
}

// ---------------------------------------------------------------- detail panel
const srcShort = (sid) => {
  const x = M.sources.get(sid);
  if (!x) return sid;
  return x.label;
};
function srcEntry(sid, extra) {
  const x = M.sources.get(sid);
  if (!x) return h('div', { class: 'src' }, h('span', { class: 'micro', text: `Unresolved source ${sid}` }));
  const pin = x.pinned_ref || '';
  const pinShort = /^[0-9a-f]{40}$/.test(pin) ? pin.slice(0, 7) : pin;
  return h('div', { class: 'src' },
    h('a', { href: x.url, target: '_blank', rel: 'noopener noreferrer' }, x.label, h('span', { class: 'sr-only', text: ' (opens in a new tab)' })),
    h('span', { class: 'micro' }, [x.repository ? `${x.repository} @ ${pinShort}` : `pin ${pinShort}`, x.path ? ` · ${x.path}` : '', x.locator ? ` · ${x.locator}` : '', ` · ${x.access}`, x.origin === 'atlas' ? ' · v0.3 source' : ''].join('')),
    extra ? h('span', { class: 'body-s muted', text: extra }) : null);
}
function relSentence(e) {
  const a = M.nodes.get(e.source), b = M.nodes.get(e.target), p = M.preds.get(e.predicate);
  return h('p', { class: 'd-rel' }, h('b', { text: a.short || a.title }), ` ${p ? p.label : e.predicate} `, h('b', { text: b.short || b.title }));
}
function relButton(e, label) {
  return h('button', { class: 'btn--link', type: 'button', onclick: () => select({ type: 'edge', id: e.id }) }, label || relSentence(e).textContent);
}
function sec(title, ...kids) { return h('section', { class: 'd-sec' }, title ? h('h3', { class: 'label', text: title }) : null, ...kids); }
function verificationText(e) {
  if (e.derived) return e.derivedNote;
  const v = M.g.verification_default;
  return `AI-assisted source check, ${v.checked_at}. Human verification: ${v.human_verification}. ${v.statement}`;
}

function detail() {
  const box = $('#kg-detail');
  box.replaceChildren();
  qEdges = new Set();
  if (st.sel && st.sel.type === 'edge') box.append(...edgeDetail(M.edgeById.get(st.sel.id)));
  else if (st.sel && st.sel.type === 'node') box.append(...nodeDetail(M.nodes.get(st.sel.id)));
  else if (st.q && QUESTIONS.find((q) => q.id === st.q)) box.append(...questionDetail(QUESTIONS.find((q) => q.id === st.q)));
  else box.append(...defaultDetail());
}

function backLink() {
  return h('button', { class: 'btn--link ui', type: 'button', onclick: () => { st.q = null; select(null); detail(); writeHash(); } }, '← Questions this graph answers');
}

function edgeDetail(e) {
  const cls = M.classes.get(e.class), p = M.preds.get(e.predicate);
  const out = [backLink(),
    sec(null, h('p', { class: 'label', text: `${cls.label}${e.public ? '' : ` · ${(e.status || 'not public').toUpperCase()} · NOT PUBLIC`}` }), relSentence(e),
      h('p', { class: 'micro', text: `${e.id} · ${p.direction}` })),
    sec('Why this connection exists', h('p', { class: 'body-s', text: e.explanation }),
      e.extract ? h('p', { class: 'body-s' }, h('span', { class: 'label', text: 'Extract used · ' }), e.extract) : null),
    sec('Evidence', ...e.evidence.map((x) => srcEntry(x.source, x.quote_summary))),
    sec('What this does not establish', h('ul', { class: 'limits' },
      ...(e.limits || []).map((t) => h('li', { text: t })),
      h('li', { text: p.limits }),
      ...(p.inference_rules || []).map((t) => h('li', { text: t })))),
    e.inventory_decision ? sec('Inventory decision', h('p', { class: 'body-s', text: e.inventory_decision })) : null,
    sec('Predicate', h('p', { class: 'body-s', text: p.definition }),
      h('p', { class: 'body-s muted' }, h('span', { class: 'label', text: 'Required evidence · ' }), p.required_evidence)),
    sec('Verification', h('p', { class: 'body-s', text: verificationText(e) })),
    sec(null, h('p', { class: 'ui' },
      h('button', { class: 'btn--link', type: 'button', onclick: () => select({ type: 'node', id: e.source }) }, `Open ${M.nodes.get(e.source).short}`),
      h('button', { class: 'btn--link', type: 'button', onclick: () => select({ type: 'node', id: e.target }) }, `Open ${M.nodes.get(e.target).short}`))),
  ];
  return out.filter(Boolean);
}

function nodeDetail(n) {
  const rels = M.edges.filter((e) => (e.source === n.id || e.target === n.id) && (e.public || st.dev) && nodeAllowed(M.nodes.get(e.source)) && nodeAllowed(M.nodes.get(e.target)));
  rels.sort((a, b) => CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class) || a.predicate.localeCompare(b.predicate));
  const non = M.nonrel.filter((x) => x.subject === n.id || x.objects.includes(n.id));
  const head = sec(null,
    h('p', { class: 'label', text: `${subLabel(n)}` }),
    h('h3', { class: 'd-title', text: n.title }),
    n.state_label ? h('p', { class: 'verdict', text: n.state_label }) : null,
    n.summary ? h('p', { class: 'body-s', text: n.summary }) : null,
    h('dl', { class: 'kv' },
      h('dt', { text: 'Status' }), h('dd', { text: admissionText(n) }),
      n.lifecycle ? [h('dt', { text: 'Lifecycle' }), h('dd', { text: n.lifecycle })] : null,
      n.license_code ? [h('dt', { text: 'Code licence' }), h('dd', { text: n.license_code })] : null,
      n.note ? [h('dt', { text: 'Note' }), h('dd', { text: n.note })] : null),
    h('p', { class: 'ui' },
      n.dossier ? h('a', { href: n.dossier, text: 'Open dossier in the Atlas' }) : null,
      n.plate ? h('a', { href: n.plate, text: 'Open plate in the Atlas' }) : null,
      h('button', { class: 'btn--link', type: 'button', onclick: () => { st.focus = n.id; setView('focus'); } }, 'Isolate neighbourhood')));
  const out = [backLink(), head];
  if (n.kind === 'research') {
    const gaps = [];
    if (n.admission === 'atlas') {
      gaps.push('Per-claim human verification of this item (SPEC §12.10, acceptance A2) is pending.');
      if (n.claim_ceiling) gaps.push(`Claim ceiling: ${n.claim_ceiling}`);
      if (n.claim_limits) gaps.push(`Interpretation limits: ${n.claim_limits}`);
    } else {
      if (n.validation_note) gaps.push(n.validation_note);
      gaps.push('Not an admitted Atlas item: no content freeze, no dossier and no human verification.');
    }
    out.push(sec('Validation and claim limits', h('ul', { class: 'limits' }, ...gaps.map((t) => h('li', { text: t })))));
    if (n.findings && n.findings.length) {
      out.push(sec(`Findings in the dossier (${n.findings.length})`,
        h('ul', { class: 'bullets' }, ...n.findings.slice(0, 3).map((f) => h('li', { text: f.statement }))),
        n.findings.length > 3 ? h('p', { class: 'ui' }, h('a', { href: n.dossier, text: `All ${n.findings.length} findings and ${n.evidence.length} evidence records in the dossier` })) : null));
    }
  }
  out.push(sec(`Relationships (${rels.length})`, rels.length
    ? h('ul', { class: 'relist' }, ...rels.map((e) => h('li', {},
      h('span', { class: 'label muted', text: `${M.classes.get(e.class).label}${e.public ? '' : ' · NOT PUBLIC'}` }),
      relButton(e))))
    : h('p', { class: 'body-s muted', text: 'No documented relationship. Absence is reported, not filled in.' })));
  if (non.length) {
    out.push(sec('Documented non-relationships', h('ul', { class: 'relist' }, ...non.map((x) => h('li', {},
      h('p', { class: 'body-s', text: x.statement }), srcEntry(x.source))))));
  }
  if (n.source_ids && n.source_ids.length) out.push(sec('Sources for this node', ...n.source_ids.map((sid) => srcEntry(sid))));
  return out;
}

function defaultDetail() {
  return [
    sec(null, h('p', { class: 'label', text: 'Questions this graph answers' }),
      h('p', { class: 'body-s muted', text: 'Each answer is computed from the relationship records and links to them. Or select any node or line on the plate.' })),
    h('ul', { class: 'qa' }, ...QUESTIONS.map((q) => h('li', {},
      h('button', { class: 'btn--link', type: 'button', onclick: () => ask(q.id) }, q.title)))),
  ];
}
function ask(id) {
  const q = QUESTIONS.find((x) => x.id === id);
  st.sel = null; st.q = id;
  const A = q.answer();
  if (A.view && A.view !== st.view) { st.view = A.view; if (A.focus) st.focus = A.focus; render(); }
  else { paintHot(); detail(); }
  if (A.select) { select(A.select, { keepView: true }); st.q = id; detail(); }
  writeHash();
  $('#kg-rail').focus({ preventScroll: true });
}
let qEdges = new Set();
function questionDetail(q) {
  const A = q.answer();
  qEdges = new Set((A.edges || []).map((e) => e.id));
  paintHot();
  return [backLink(),
    sec(null, h('p', { class: 'label', text: 'Question' }), h('h3', { class: 'd-title', text: q.title })),
    sec('Answer from the records', h('div', { class: 'answer' }, ...A.paras.map((p) => (typeof p === 'string' ? h('p', { text: p }) : p)))),
    A.edges && A.edges.length ? sec(`Relationships used (${A.edges.length})`, h('ul', { class: 'relist' },
      ...A.edges.map((e) => h('li', {}, h('span', { class: 'label muted', text: M.classes.get(e.class).label }), relButton(e))))) : null,
    A.caveat ? sec('Reading limit', h('p', { class: 'caveat', text: A.caveat })) : null,
  ].filter(Boolean);
}

// ---------------------------------------------------------------- questions
const pub = () => M.edges.filter((e) => e.public && nodeAllowed(M.nodes.get(e.source)) && nodeAllowed(M.nodes.get(e.target)));
const nm = (id) => M.nodes.get(id).short || M.nodes.get(id).title;
const QUESTIONS = [
  { id: 'hati-lens', title: 'What is the documented relationship between HATI and the Madrid Urban Evidence Lens?',
    answer: () => {
      const e = M.edgeById.get('kg-lens-reads-hati-pilot');
      const ext = pub().filter((x) => (x.source === 'p-lens' && x.target === 'r-hati-pedestrian') || (x.target === 'p-lens' && x.source.startsWith('r-hati')));
      return { view: 'ecosystem', select: { type: 'edge', id: e.id }, edges: [e],
        paras: [e.explanation, ext.length ? '' : 'No record links the Lens to the HATI pedestrian heat extension.'].filter(Boolean),
        caveat: e.limits.join(' ') };
    } },
  { id: 'used-by', title: 'Which research instruments or platforms are actually used by other items?',
    answer: () => {
      const tech = pub().filter((e) => ['depends_on', 'consumes_output_of', 'derived_from'].includes(e.predicate));
      const byT = group(tech, 'target');
      return { view: 'ecosystem', edges: tech,
        paras: [...byT.entries()].map(([t, es]) => `${nm(t)}: ${es.map((e) => `${M.preds.get(e.predicate).label.replace(/ of$| from$| on$/, '')} by ${nm(e.source)}`).join('; ')}.`)
          .concat(['Every other item has no documented technical user.']),
        caveat: 'Hosting is not use: the Lens hosts two research packages that its application does not read (see documented non-relationships).' };
    } },
  { id: 'same-data', title: 'Which items depend on the same data sources?',
    answer: () => {
      const uses = pub().filter((e) => e.predicate === 'uses_dataset');
      const byD = group(uses, 'target');
      const multi = [...byD.entries()].filter(([, es]) => es.length > 1);
      return { view: 'lineage', edges: multi.flatMap(([, es]) => es),
        paras: multi.map(([d, es]) => h('p', {}, h('b', { text: `${nm(d)} (${es.length} items). ` }), es.map((e) => `${nm(e.source)}: ${e.extract}`).join('; ') + '.'))
          .concat(['PNOA appears as three separate datasets (LiDAR 1st coverage, LiDAR 3rd coverage, historical orthophotos) used by three different items in three different roles.']),
        caveat: 'Each item uses a different extract, product or vintage. A common dataset does not establish comparability or scientific agreement between the items.' };
    } },
  { id: 'methods', title: 'Which research items use similar spatial methodologies?',
    answer: () => {
      const am = pub().filter((e) => e.predicate === 'applies_method');
      const byM = group(am, 'target');
      const shared = [...byM.entries()].filter(([, es]) => es.length > 1);
      const single = [...byM.entries()].filter(([, es]) => es.length === 1);
      const ext = pub().filter((e) => e.predicate === 'extends');
      return { view: 'methods', edges: [...shared.flatMap(([, es]) => es), ...ext],
        paras: [
          ...shared.map(([m, es]) => `${nm(m)}: ${es.map((e) => nm(e.source)).join(' and ')}.${ext.some((x) => es.some((e) => e.source === x.source)) ? ' The second is a declared extension of the first, not an independent replication.' : ''}`),
          `One item each: ${single.map(([m, es]) => `${nm(m)} (${nm(es[0].source)})`).join('; ')}.`,
          'The pedestrian network pilot and the Transit Graph both model networks, but their sources name different methods; no shared method is recorded.'],
        caveat: 'A shared method node means a named method in common, not shared configuration, inputs, calibration or validity.' };
    } },
  { id: 'territories', title: 'Which territories have been studied from different analytical perspectives?',
    answer: () => {
      const within = pub().filter((e) => e.predicate === 'within');
      const sit = pub().filter((e) => e.predicate === 'situated_in');
      const am = pub().filter((e) => e.predicate === 'applies_method');
      const kids = (t) => [t, ...within.filter((w) => w.target === t).flatMap((w) => kids(w.source))];
      const paras = [], used = [];
      for (const t of [...M.nodes.values()].filter((n) => n.kind === 'territory')) {
        if (within.some((w) => w.source === t.id)) continue;
        const area = kids(t.id);
        const es = sit.filter((e) => area.includes(e.target));
        if (es.length < 2) continue;
        used.push(...es, ...within.filter((w) => area.includes(w.source)));
        paras.push(h('p', {}, h('b', { text: `${nm(t.id)}: ` }), es.map((e) => {
          const m = am.filter((x) => x.source === e.source).map((x) => nm(x.target));
          return `${nm(e.source)} (${nm(e.target)}${m.length ? '; ' + m.join(', ') : ''})`;
        }).join('; ') + '.'));
      }
      return { view: 'territories', edges: used, paras,
        caveat: 'Sibling study areas inside one territory are not compared: their overlap, period and phenomena differ and are never computed. Embajadores (PNOA-LiDAR pilot) and the Lavapiés isovist area are kept separate.' };
    } },
  { id: 'platform-evidence', title: 'Can a platform expose evidence produced by a research study?',
    answer: () => {
      const plats = [...M.nodes.values()].filter((n) => n.kind === 'research' && n.class === 'research_platform' && nodeAllowed(n));
      const all = pub();
      const paras = [], used = [];
      for (const p of plats) {
        const reads = all.filter((e) => e.source === p.id && e.predicate === 'consumes_output_of');
        const hosts = all.filter((e) => e.source === p.id && e.predicate === 'hosts');
        const non = M.nonrel.filter((x) => x.subject === p.id);
        if (!reads.length && !hosts.length) continue;
        used.push(...reads, ...hosts);
        paras.push(h('p', {}, h('b', { text: `${nm(p.id)}. ` }),
          reads.length ? `Exposes: ${reads.map((e) => `${nm(e.target)} (${e.explanation.split('.')[0].toLowerCase()})`).join('; ')}. ` : 'Exposes no other item\'s outputs. ',
          hosts.length ? `Hosts: ${hosts.map((e) => nm(e.target)).join(', ')}. ` : '',
          non.length ? `Recorded as not integrated: ${non.flatMap((x) => x.objects).map(nm).join(', ')}.` : ''));
      }
      return { view: 'ecosystem', edges: used, paras: paras.concat(['The Madrid Evidence MCP exposes Lens answers, not research-study evidence; it depends on a pinned Lens version.']),
        caveat: 'Yes, in one documented case, and only for the subset its provenance record names. Hosting a study is not exposing it.' };
    } },
  { id: 'publications', title: 'Which publications and outputs originate from which investigations?',
    answer: () => {
      const ho = pub().filter((e) => e.predicate === 'has_output');
      const by = group(ho, 'source');
      return { view: 'lineage', edges: ho,
        paras: [...by.entries()].map(([r, es]) => `${nm(r)}: ${es.map((e) => `${M.nodes.get(e.target).short} — ${M.nodes.get(e.target).title}`).join(' | ')}`)
          .concat(['No output is recorded for the HATI pedestrian extension, SNTO — PNSG, FieldOS or any candidate item.']),
        caveat: 'Outputs exist only attached to their item (v0.3). Publication type, editorial status and identifier are separate facts; none is a quality grade.' };
    } },
  { id: 'gaps', title: 'Where are the scientific validation gaps?',
    answer: () => {
      const items = [...M.nodes.values()].filter((n) => n.kind === 'research' && nodeAllowed(n));
      return { view: 'ecosystem', edges: [],
        paras: [
          'Every Atlas item: per-claim human verification (SPEC §12.10, A2) is pending.',
          ...items.map((n) => h('p', {}, h('b', { text: `${n.short}. ` }), n.admission === 'atlas' ? `Documented result: ${n.state_label || 'none (platform)'}.` : `${n.state_label}. ${n.validation_note || ''}`)),
          `Every one of the ${pub().filter((e) => !e.derived).length} new relationships in this proposal has an AI-assisted source check only; none has human verification.`],
        caveat: 'Abstention, insufficient evidence, MODIFY, HOLD, MIXTO and NO-GO are documented outcomes, not failures; they are listed as stated, never ranked.' };
    } },
  { id: 'hypothetical', title: 'Which apparent relationships are only conceptual or hypothetical?',
    answer: () => {
      const hyp = M.edges.filter((e) => e.class === 'hypothetical');
      const con = M.edges.filter((e) => e.class === 'conceptual' || (!e.public && e.status === 'rejected'));
      st.hyp = true; syncControls();
      return { view: 'ecosystem', edges: [...hyp, ...con],
        paras: [`Hypothetical (public, off by default): ${hyp.map((e) => `${nm(e.source)} → ${nm(e.target)}`).join('; ')}.`,
          `Analyst-defined or rejected (development inventory, never public): ${con.map((e) => `${nm(e.source)} ~ ${nm(e.target)}`).join('; ')}.`,
          `Documented non-relationships: ${M.nonrel.map((x) => `${nm(x.subject)} ⟂ ${x.objects.map(nm).join(', ')}`).join('; ')}.`],
        caveat: 'Hypothetical links never count as dependencies. Conceptual associations are not evidence and are kept out of the public graph.' };
    } },
  { id: 'heat-access', title: 'Which findings concern thermal exposure or pedestrian accessibility?',
    answer: () => {
      const am = pub().filter((e) => e.predicate === 'applies_method' && ['m-solweig-utci', 'm-network-distance'].includes(e.target));
      const paras = am.map((e) => {
        const n = M.nodes.get(e.source);
        return h('p', {}, h('b', { text: `${nm(e.target)} → ${n.short}. ` }),
          n.findings && n.findings.length ? `${n.findings.length} findings, for example: “${n.findings[0].statement}” ` : 'No findings recorded. ',
          n.dossier ? h('a', { href: n.dossier, text: 'Dossier' }) : null);
      });
      return { view: 'methods', edges: am, paras,
        caveat: 'Grouped by the method each item\'s source names. The Atlas does not tag findings by topic, and the Lens\'s HATI layer is a reading of the pilot, not a finding of its own.' };
    } },
];

// ---------------------------------------------------------------- lists below
function table(G) {
  const box = $('#kg-table');
  const rows = [...G.edges].sort((a, b) => CLASS_ORDER.indexOf(a.class) - CLASS_ORDER.indexOf(b.class) || ordIdx(a.source) - ordIdx(b.source) || a.id.localeCompare(b.id));
  if (!rows.length) { box.replaceChildren(h('p', { class: 'body-s muted', text: 'No relationship in this view with the current filters.' })); return; }
  box.replaceChildren(h('table', { class: 'tbl' },
    h('thead', {}, h('tr', {}, ...['From', 'Relationship', 'To', 'Class', 'Evidence'].map((t) => h('th', { scope: 'col', text: t })))),
    h('tbody', {}, ...rows.map((e) => h('tr', { 'data-e': e.id, class: st.sel && st.sel.id === e.id ? 'is-sel' : null },
      h('td', { 'data-th': 'From', text: nm(e.source) }),
      h('td', { 'data-th': 'Relationship' }, h('button', { class: 'btn--link', type: 'button', onclick: () => { select({ type: 'edge', id: e.id }); $('#kg-rail').focus({ preventScroll: false }); } }, M.preds.get(e.predicate).label)),
      h('td', { 'data-th': 'To', text: nm(e.target) }),
      h('td', { 'data-th': 'Class', text: M.classes.get(e.class).label.toLowerCase() + (e.public ? '' : ' · not public') }),
      h('td', { 'data-th': 'Evidence', text: e.evidence.map((x) => srcShort(x.source)).join('; ') }))))));
}

function staticLists() {
  $('#kg-non').replaceChildren(...M.nonrel.map((x) => h('li', {},
    h('p', { class: 'label', text: `${nm(x.subject)} ⟂ ${x.objects.map(nm).join(', ')}` }),
    h('p', { class: 'body-s', text: x.statement }), srcEntry(x.source))));

  const onto = $('#kg-onto');
  onto.replaceChildren(
    h('p', { class: 'label', text: 'Classes' }),
    h('div', { class: 'onto' }, ...M.g.classes.map((c) => h('article', {},
      h('p', { class: 'label' }, lineSample(c.id), ' ', c.label), h('p', { class: 'body-s', text: c.definition }),
      h('p', { class: 'micro', text: c.public ? (c.default_on ? 'public · shown by default' : 'public · off by default') : 'development inventory only' })))),
    h('p', { class: 'label', style: 'margin-top:24px', text: 'Predicates' }),
    h('div', { class: 'onto' }, ...M.g.predicates.map((p) => h('article', {},
      h('p', { class: 'pred', text: p.label }), h('p', { class: 'micro', text: `${p.id} · ${p.domain.join('|')} → ${p.range.join('|')} · ${p.class}` }),
      h('p', { class: 'body-s', text: p.definition }),
      h('p', { class: 'body-s muted' }, h('span', { class: 'label', text: 'Evidence · ' }), p.required_evidence),
      h('p', { class: 'body-s muted' }, h('span', { class: 'label', text: 'Limit · ' }), p.limits)))),
    h('p', { class: 'label', style: 'margin-top:24px', text: 'Considered and rejected' }),
    h('ul', { class: 'records' }, ...M.g.rejected_predicates.map((r) => h('li', {}, h('p', { class: 'pred', text: r.id }), h('p', { class: 'body-s', text: r.reason })))),
  );

  const dev = M.edges.filter((e) => !e.public);
  const deferred = [...M.nodes.values()].filter((n) => n.admission === 'deferred');
  $('#kg-dev').replaceChildren(
    ...dev.map((e) => h('li', {},
      h('p', { class: 'label', text: `${(e.status || '').toUpperCase()} · ${M.classes.get(e.class).label}` }),
      h('p', { class: 'body-s' }, h('b', { text: `${nm(e.source)} ${M.preds.get(e.predicate).label} ${nm(e.target)}. ` }), e.explanation),
      h('p', { class: 'body-s muted', text: e.inventory_decision }),
      h('p', { class: 'ui' }, h('button', { class: 'btn--link', type: 'button', onclick: () => select({ type: 'edge', id: e.id }) }, 'Inspect'))) ),
    ...deferred.map((n) => h('li', {}, h('p', { class: 'label', text: `DEFERRED NODE · ${CLASS_LABEL[n.class]}` }),
      h('p', { class: 'body-s' }, h('b', { text: `${n.title}. ` }), n.summary, ` Licence: ${n.license_code}.`))),
    ...M.g.excluded_candidates.map((x) => h('li', {}, h('p', { class: 'label', text: 'EXCLUDED' }), h('p', { class: 'body-s' }, h('b', { text: `${x.name}. ` }), x.reason))),
  );
}

function names() {
  const dl = $('#kg-names');
  dl.replaceChildren(...[...M.nodes.values()].filter(nodeAllowed).map((n) => h('option', { value: n.short || n.title })));
  $('#kg-search').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const q = $('#kg-q').value.trim().toLowerCase();
    if (!q) return;
    const list = [...M.nodes.values()].filter(nodeAllowed);
    const hit = list.find((n) => (n.short || '').toLowerCase() === q || n.title.toLowerCase() === q)
      || list.find((n) => (n.short || '').toLowerCase().includes(q) || n.title.toLowerCase().includes(q) || n.id === q);
    const live = $('#kg-live');
    if (!hit) { live.textContent = `No node matches “${q}”.`; return; }
    select({ type: 'node', id: hit.id });
    const p = L.pos.get(hit.id);
    if (p) {
      const svg = $('#kg-svg');
      T.x = svg.clientWidth / 2 - p.x * T.k; T.y = svg.clientHeight / 2 - p.y * T.k; T.moved = true; applyT();
    }
  });
}

function footer() {
  const pubNew = M.edges.filter((e) => e.public && !e.derived).length;
  const pubDer = M.edges.filter((e) => e.public && e.derived).length;
  $('#kg-footer').textContent = `Graph schema ${M.g.schema_version} · Atlas dataset schema ${M.atlas.schema_version} (read-only) · reviewed ${M.g.reviewed_at} · ${pubNew} proposed public relationships (AI-assisted source check; human verification pending) and ${pubDer} derived unchanged from v0.3 records · ${M.edges.filter((e) => !e.public).length} development-inventory readings · prototype, not released`;
}

function render() {
  tabs();
  draw();
  detail();
  fit();
}

async function main() {
  try {
    const [atlas, g] = await Promise.all([
      fetch('../../data/atlas.json').then((r) => { if (!r.ok) throw new Error(`atlas.json ${r.status}`); return r.json(); }),
      fetch('graph.json').then((r) => { if (!r.ok) throw new Error(`graph.json ${r.status}`); return r.json(); }),
    ]);
    M = buildModel(atlas, g);
  } catch (err) {
    $('#kg-detail').replaceChildren(h('p', { class: 'body-s', text: `The prototype could not load its data (${err.message}). Serve the repository root over HTTP and open /prototype/v0.4-knowledge-graph/.` }));
    return;
  }
  readHash();
  defs(); controls(); legend(); names(); staticLists(); footer(); initPanZoom();
  render();
  window.addEventListener('hashchange', () => { readHash(); syncControls(); render(); });
  $('#kg-views').addEventListener('keydown', (ev) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(ev.key)) return;
    const bs = [...document.querySelectorAll('#kg-views .tab')];
    const i = bs.indexOf(document.activeElement);
    if (i < 0) return;
    const nb = bs[(i + (ev.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length];
    nb.focus(); nb.click();
    document.querySelector(`#kg-views .tab[data-view="${nb.dataset.view}"]`).focus();
  });
}
main();
