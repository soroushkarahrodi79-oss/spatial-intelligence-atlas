/*
 * Immersive Globe Atlas — experimental prototype.
 * Reads the deployed v0.2.0 dataset (../../data/atlas.json) READ-ONLY and a
 * prototype-local set of representative geographic locators (geo.json).
 * It does not modify, re-rank, integrate, or infer over the scientific data.
 */
'use strict';

const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion:reduce)');
const state = { mode: 'territory', caseId: null };

const verdictLabel = { abstain: 'ABSTAIN', insufficient_evidence: 'INSUFFICIENT EVIDENCE', no_go: 'NO-GO', functional_test: 'FUNCTIONAL TEST' };
const substantiationLabel = { source_stated: 'SOURCE-STATED', owner_attested: 'OWNER-ATTESTED', not_established: 'NOT ESTABLISHED' };
const ns = 'http://www.w3.org/2000/svg';

let atlas, geo, kinds, nodes, geoById, world = null, globeReady = false;

const el = (tag, text, className) => {
  const n = document.createElement(tag);
  if (text != null) n.textContent = text;
  if (className) n.className = className;
  return n;
};
const svg = (tag, attrs = {}) => {
  const n = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
};
const announce = t => { $('live').textContent = t; };

function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

/* ---------- data helpers ---------- */
const cases = () => atlas.entities.filter(e => e.kind === 'case');
const entityById = id => atlas.entities.find(e => e.id === id);
const outcomeFor = id => {
  const rel = atlas.relationships.find(r => r.type === 'reports' && r.source === id);
  return rel && nodes.get(rel.target);
};
const territoryFor = id => {
  const rel = atlas.relationships.find(r => r.type === 'situated_in' && r.source === id);
  return rel && nodes.get(rel.target);
};
const evidenceFor = id => atlas.relationships
  .filter(r => r.type === 'documents' && r.source === id)
  .map(r => nodes.get(r.target));

/* ---------- shared UI atoms ---------- */
function glyph(kind) {
  const g = svg('g', { fill: 'none', stroke: kind.color, 'stroke-width': 1 });
  const circle = r => svg('circle', { r });
  switch (kind.glyph) {
    case 'filled-circle': g.append(svg('circle', { r: 5, fill: kind.color })); break;
    case 'half-circle': g.append(circle(5), svg('path', { d: 'M0 -5 A5 5 0 0 0 0 5 Z', fill: kind.color })); break;
    case 'ringed-circle': g.append(circle(6), circle(3)); break;
    case 'diamond': g.append(svg('path', { d: 'M0 -6 L6 0 L0 6 L-6 0 Z' })); break;
    case 'slashed-circle': g.append(circle(5), svg('path', { d: 'M-6 6 L6 -6' })); break;
    default: g.append(circle(5));
  }
  return g;
}
function inputKindTag(id) {
  const kind = kinds.get(id);
  const tag = el('span', null, 'evidence-tag');
  const mark = svg('svg', { viewBox: '0 0 48 20', 'aria-hidden': 'true', class: 'evidence-swatch' });
  const g = glyph(kind); g.setAttribute('transform', 'translate(8 10)');
  mark.append(g, svg('line', { x1: 20, x2: 48, y1: 10, y2: 10, stroke: kind.color, 'stroke-width': kind.stroke_width, 'stroke-dasharray': kind.dash }));
  tag.append(mark, el('span', kind.label));
  return tag;
}
function sourceLink(id) {
  const s = atlas.sources.find(x => x.id === id);
  const a = el('a', s.label);
  a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', `${s.label}, opens in a new tab`);
  a.className = 'source-link';
  return a;
}
function sourceList(ids) {
  const list = el('ul', null, 'source-list');
  ids.forEach(id => { const li = el('li'); li.append(sourceLink(id)); list.append(li); });
  return list;
}

/* ---------- globe ---------- */
const CLUSTER_ALT = () => (geo.cluster_altitude_threshold || 1.4);
const HOME = { lat: 34, lng: 10, altitude: 2.4 };
let clusters = [], memberToCluster = new Map(), clustered = true;

function buildClusters() {
  clusters = (geo.clusters || []).map(c => {
    const pts = c.members.map(id => geoById.get(id)).filter(Boolean);
    const lat = pts.reduce((s, p) => s + p.lat, 0) / pts.length;
    const lng = pts.reduce((s, p) => s + p.lng, 0) / pts.length;
    return { ...c, lat, lng, pts };
  });
  memberToCluster = new Map();
  clusters.forEach(c => c.members.forEach(m => memberToCluster.set(m, c)));
}
// Deterministic label set.
// - World scale (clustered): a multi-member cluster collapses to one shared
//   regional label; singletons keep their own label.
// - Closer zoom (expanded): every point keeps its dot, but within a multi-member
//   cluster only ONE verified label is shown at a time (the selected case, or the
//   primary member if none is selected). Because Globe.GL label text and dot
//   separation scale together with zoom, this — not altitude — is what prevents
//   two labels ~0.5° apart from overprinting. Coordinates are never moved.
function computeLabels(isClustered) {
  const out = [];
  if (isClustered) {
    const hidden = new Set();
    clusters.forEach(c => {
      if (c.members.length > 1) {
        out.push({ kind: 'cluster', id: c.id, label: c.label, lat: c.lat, lng: c.lng, selected: c.members.includes(state.caseId) });
        c.members.forEach(m => hidden.add(m));
      }
    });
    geo.reference_points.forEach(p => {
      if (!hidden.has(p.entity_id)) out.push({ kind: 'point', entity_id: p.entity_id, label: p.short_label, lat: p.lat, lng: p.lng, selected: p.entity_id === state.caseId });
    });
  } else {
    geo.reference_points.forEach(p => {
      const c = memberToCluster.get(p.entity_id);
      let show = true;
      if (c && c.members.length > 1) {
        const selectedInCluster = c.members.includes(state.caseId);
        show = selectedInCluster ? (state.caseId === p.entity_id) : (c.members[0] === p.entity_id);
      }
      out.push({ kind: 'point', entity_id: p.entity_id, label: show ? p.short_label : '', lat: p.lat, lng: p.lng, selected: p.entity_id === state.caseId });
    });
  }
  return out;
}
function applyLabels() { if (globeReady) world.labelsData(computeLabels(clustered)); }
function setClustered(next) { if (next !== clustered) { clustered = next; applyLabels(); } }

function initGlobe(features) {
  buildClusters();
  if (!webglSupported() || typeof Globe === 'undefined') { $('globe-fallback').hidden = false; renderFallback(); return; }
  try {
    world = Globe()(($('globe')))
      .backgroundColor('#0F1113')
      .showGlobe(true)
      .showGraticules(true)
      .showAtmosphere(true)
      .atmosphereColor('#5b7086')
      .atmosphereAltitude(0.18)
      .polygonsData([])
      .polygonCapColor(() => 'rgba(64,74,86,0.95)')
      .polygonSideColor(() => 'rgba(0,0,0,0)')
      .polygonStrokeColor(() => '#9aa3ad')
      .polygonAltitude(0.008)
      .polygonCapCurvatureResolution(3)
      .polygonsTransitionDuration(0)
      .labelsData(computeLabels(true))
      .labelLat(d => d.lat).labelLng(d => d.lng)
      .labelText(d => d.label)
      .labelSize(d => d.selected ? 1.75 : d.kind === 'cluster' ? 1.4 : 1.55)
      .labelDotRadius(d => d.selected ? 1.0 : d.kind === 'cluster' ? 0.7 : 0.55)
      .labelColor(d => d.selected ? '#FFFFFF' : d.kind === 'cluster' ? '#C9CDD3' : '#EDECE9')
      .labelResolution(2)
      .onLabelClick(d => {
        if (d.kind === 'cluster') { flyToLatLng(d.lat, d.lng, 0.6); announce(`${d.label}: zooming in to individual cases.`); }
        else { selectCase(d.entity_id); flyTo(d.entity_id); }
      })
      .onZoom(pov => setClustered(pov.altitude > CLUSTER_ALT()))
      .onGlobeClick(() => { /* no-op: interaction is via labels/controls */ });
    world.globeMaterial().color.set('#0f1a24');
    const ctrl = world.controls();
    ctrl.enableZoom = true;
    ctrl.autoRotate = !reduced.matches;
    ctrl.autoRotateSpeed = 0.32;
    // Stop ambient rotation on first user interaction.
    ctrl.addEventListener('start', () => { ctrl.autoRotate = false; });
    globeReady = true;
    sizeGlobe();
    world.pointOfView({ ...HOME }, 0);
    // Defer the heavy country-outline tessellation off the critical path so the
    // globe and labels are interactive first; borders fade in a moment later.
    const paintBorders = () => { if (globeReady) world.polygonsData(features); };
    if ('requestIdleCallback' in window) requestIdleCallback(paintBorders, { timeout: 1500 });
    else setTimeout(paintBorders, 200);
  } catch (e) {
    console.error('Globe init failed:', e);
    world = null; globeReady = false;
    $('globe-fallback').hidden = false; renderFallback();
  }
}
function sizeGlobe() {
  if (!globeReady) return;
  const wrap = $('globe-wrap');
  world.width(wrap.clientWidth).height(wrap.clientHeight);
}
function flyToLatLng(lat, lng, altitude) {
  if (!globeReady) return;
  if (world.controls()) world.controls().autoRotate = false;
  const target = { lat, lng, altitude };
  world.pointOfView(target, reduced.matches ? 0 : 1100);
  // Ensure label state matches the destination even if onZoom does not fire.
  setClustered(altitude > CLUSTER_ALT());
}
function flyTo(id) {
  const p = geoById.get(id);
  if (!p) return; // FieldOS / no location
  // Members of a multi-point cluster get a closer altitude so nearby sibling
  // labels separate legibly rather than overprinting.
  const inCluster = memberToCluster.has(id) && memberToCluster.get(id).members.length > 1;
  flyToLatLng(p.lat, p.lng, inCluster ? 0.45 : 0.9);
}
function renderFallback() {
  const list = $('fallback-list'); list.replaceChildren();
  geo.reference_points.forEach(p => {
    const li = el('li');
    li.append(el('h4', p.label));
    li.append(el('p', `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)} — representative locator`, 'coord'));
    li.append(el('p', p.precision, 'micro'));
    const b = el('button', 'Read this case'); b.type = 'button';
    b.addEventListener('click', () => { selectCase(p.entity_id); });
    li.append(b);
    list.append(li);
  });
  const fi = el('li');
  fi.append(el('h4', 'FieldOS'));
  fi.append(el('p', 'Supporting instrument — no case-specific geographic location.', 'micro'));
  list.append(fi);
}

/* ---------- navigation controls ---------- */
function buildNav() {
  const wrap = $('nav-buttons'); wrap.replaceChildren();
  cases().forEach(c => {
    const p = geoById.get(c.id);
    const b = el('button', p ? p.short_label : c.label); b.type = 'button';
    b.dataset.case = c.id;
    b.setAttribute('aria-label', `Fly to ${p ? p.label : c.label}`);
    b.addEventListener('click', () => { selectCase(c.id); flyTo(c.id); });
    wrap.append(b);
  });
}
function markNav() {
  [...$('nav-buttons').children].forEach(b => b.setAttribute('aria-current', String(b.dataset.case === state.caseId)));
}

/* ---------- case picker (reading modes) ---------- */
function buildPicker() {
  const wrap = $('case-picker'); wrap.replaceChildren();
  atlas.entities.forEach(e => {
    const b = el('button', e.kind === 'instrument' ? `${e.label} (instrument)` : e.label);
    b.type = 'button'; b.dataset.case = e.id;
    b.addEventListener('click', () => selectCase(e.id));
    wrap.append(b);
  });
}
function markPicker() {
  [...$('case-picker').children].forEach(b => b.setAttribute('aria-pressed', String(b.dataset.case === state.caseId)));
}

/* ---------- detail aside ---------- */
function renderDetail() {
  const box = $('detail'); box.replaceChildren();
  const e = state.caseId && entityById(state.caseId);
  if (!e) {
    box.append(el('h2', 'Select a case'),
      el('p', 'Choose a location on the globe, a “Fly to” control, or a case above to inspect its documented question, evidence, outcome, claim ceiling and sources.'));
    return;
  }
  // Case context only. The full outcome statement and claim ceiling live in the
  // Decisions reading area and are intentionally NOT repeated here.
  const content = el('div', null, 'detail-content');
  content.append(el('h2', e.label), el('p', e.kind === 'case' ? 'CORE CASE' : 'SUPPORTING INSTRUMENT', 'label'));
  content.append(el('p', e.role, 'panel-role'));
  const p = geoById.get(e.id);
  const terr = territoryFor(e.id);
  if (p) {
    content.append(el('h3', 'Territory (representative)'));
    content.append(el('p', terr ? terr.label : p.label));
    content.append(el('p', `Locator: ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`, 'micro'));
    const flag = el('div', null, 'geo-flag');
    flag.textContent = 'Representative point only — not the study-area geometry, boundary, or route. ' + p.source_note;
    content.append(flag);
  } else {
    content.append(el('h3', 'Territory'));
    content.append(el('p', 'No case-specific geographic location. FieldOS is a supporting instrument.', 'instrument-note'));
  }
  content.append(el('h3', 'Research status'));
  content.append(el('p', `${e.research_status} · reviewed ${e.reviewed_at}`, 'micro'));
  const out = outcomeFor(e.id);
  if (out) {
    content.append(el('h3', 'Documented outcome'));
    const v = el('p'); v.append(el('span', verdictLabel[out.outcome_type], 'verdict'));
    content.append(v);
    content.append(el('p', 'Full result statement and claim ceiling are in the Decisions view.', 'micro'));
  }
  content.append(el('h3', 'Primary sources'));
  content.append(sourceList(e.source_ids));
  box.append(content);
}

/* ---------- evidence input-kind key (inline, discoverable while reading) ---------- */
function legendInline() {
  const box = el('div', null, 'legend-inline');
  box.setAttribute('aria-label', 'Evidence input-kind key. Categories, not a quality ranking.');
  atlas.meta.input_kinds.forEach(k => {
    const entry = el('span', null, 'legend-entry');
    entry.setAttribute('aria-label', k.label);
    entry.append(inputKindTag(k.id));
    box.append(entry);
  });
  return box;
}

/* ---------- evidence view ---------- */
function renderEvidence() {
  const wrap = $('reading'); wrap.replaceChildren();
  const e = state.caseId && entityById(state.caseId);
  if (!e) { wrap.append(el('p', 'Select a case to see its documented evidence records.', 'micro')); return; }
  wrap.append(el('h2', e.label), el('p', e.kind === 'case' ? 'CORE CASE' : 'SUPPORTING INSTRUMENT', 'label'));
  wrap.append(el('p', 'What is actually documented, with the evidence input kind and how well it is substantiated. Missing or unestablished support stays visible.', 'read-note'));
  wrap.append(legendInline());
  const records = evidenceFor(e.id);
  if (!records.length) { wrap.append(el('p', 'No evidence records declared.')); return; }
  const grid = el('div', null, 'ev-grid');
  records.forEach(r => {
    const box = el('div', null, 'ev-record');
    box.append(el('h3', r.label));
    box.append(inputKindTag(r.input_kind));
    box.append(el('p', `Substantiation: ${substantiationLabel[r.substantiation]}`, 'micro'));
    box.append(el('p', r.basis));
    box.append(el('p', `Limitation: ${r.limitation}`));
    grid.append(box);
  });
  wrap.append(grid);
}

/* ---------- decisions / reading strip (STEP 5) ---------- */
function readStep(num, heading, kids) {
  const box = el('div', null, 'read-step');
  const head = el('div', null, 'read-head');
  head.append(el('span', num, 'read-num'), el('h3', heading));
  box.append(head);
  const body = el('div', null, 'read-body');
  kids.forEach(k => body.append(k));
  box.append(body);
  return box;
}
function renderDecisions() {
  const wrap = $('reading'); wrap.replaceChildren();
  const e = state.caseId && entityById(state.caseId);
  if (!e) { wrap.append(el('p', 'Select a case to read its evidence-to-outcome narrative.', 'micro')); return; }
  wrap.append(el('h2', e.label), el('p', e.kind === 'case' ? 'CORE CASE' : 'SUPPORTING INSTRUMENT', 'label'));
  const note = el('div', null, 'read-note');
  note.append(el('p', 'Reading order, not an asserted causal pipeline. Each step is documented independently by the pinned sources; the sequence is how to read the case, not a claim that one step caused the next.'));
  wrap.append(note);

  const strip = el('div', null, 'read-strip');

  // 1. Research question (or role for the instrument)
  strip.append(readStep('1', e.kind === 'case' ? 'Research question' : 'Role',
    [el('p', e.research_question || e.role)]));

  // 2. Documented evidence (card grid)
  const records = evidenceFor(e.id);
  const grid = el('div', null, 'ev-grid');
  records.forEach(r => {
    const d = el('div', null, 'ev-record');
    d.append(el('h4', r.label));
    d.append(inputKindTag(r.input_kind));
    d.append(el('p', `Substantiation: ${substantiationLabel[r.substantiation]}`, 'micro'));
    d.append(el('p', r.basis));
    grid.append(d);
  });
  strip.append(readStep('2', 'Documented evidence', records.length ? [grid] : [el('p', 'None declared.')]));

  // 3. Limitations (per record)
  const lims = records.map(r => el('p', `${r.label}: ${r.limitation}`));
  strip.append(readStep('3', 'What the evidence does not establish', lims.length ? lims : [el('p', 'None declared.')]));

  // 4. Documented outcome
  const out = outcomeFor(e.id);
  const outNodes = [];
  if (out) {
    const v = el('p'); v.append(el('span', verdictLabel[out.outcome_type], 'verdict'));
    outNodes.push(v, el('p', out.statement));
  }
  strip.append(readStep('4', 'Documented outcome', outNodes.length ? outNodes : [el('p', 'None declared.')]));

  // 5. Claim ceiling
  strip.append(readStep('5', 'Claim ceiling — how far this may be taken', [el('p', out ? out.claim_ceiling : '—')]));

  wrap.append(strip);

  const src = el('div', null, 'read-sources');
  src.append(el('h3', 'Primary sources'));
  src.append(sourceList(e.source_ids));
  wrap.append(src);
}

/* ---------- legend ---------- */
function renderLegend() {
  const box = $('legend'); box.replaceChildren();
  if (state.mode === 'territory') {
    box.append(el('p', 'Representative locators on a reference globe — conceptual anchors, not study geometry. FieldOS has no location.', 'label'));
  } else if (state.mode === 'evidence') {
    box.append(el('p', 'Colour, dash and glyph encode the evidence input kind — categories, not a quality ranking. Full key sits above the records.', 'label'));
  } else {
    box.append(el('p', 'Documented results, not hypothetical uses. Every outcome carries a claim ceiling.', 'label'));
  }
}

/* ---------- mode switching ---------- */
const modeMeta = {
  territory: { label: 'Globe', question: 'Where was the work situated?' },
  evidence: { label: 'Evidence', question: 'What is actually documented?' },
  decisions: { label: 'Decisions', question: 'What result was documented?' }
};
function buildModes() {
  const wrap = $('modes'); wrap.replaceChildren();
  ['territory', 'evidence', 'decisions'].forEach((id, i) => {
    const t = el('button', modeMeta[id].label); t.type = 'button'; t.role = 'tab'; t.dataset.mode = id;
    t.addEventListener('click', () => switchMode(id));
    t.addEventListener('keydown', ev => {
      if (!['ArrowLeft', 'ArrowRight'].includes(ev.key)) return;
      ev.preventDefault();
      const order = ['territory', 'evidence', 'decisions'];
      const next = (i + (ev.key === 'ArrowRight' ? 1 : 2)) % 3;
      switchMode(order[next]); wrap.children[next].focus();
    });
    wrap.append(t);
  });
}
function switchMode(id) {
  state.mode = id;
  $('question').textContent = modeMeta[id].question;
  [...$('modes').children].forEach(t => {
    const sel = t.dataset.mode === id;
    t.setAttribute('aria-selected', String(sel)); t.tabIndex = sel ? 0 : -1;
  });
  const territory = id === 'territory';
  $('territory-view').hidden = !territory;
  $('reading-view').hidden = territory;
  if (territory) { sizeGlobe(); }
  else { markPicker(); (id === 'evidence' ? renderEvidence : renderDecisions)(); }
  renderLegend();
  updateCount();
  announce(`${modeMeta[id].label} perspective. ${modeMeta[id].question}`);
}
function updateCount() {
  if (state.mode === 'territory') {
    $('mode-count').textContent = `${geo.reference_points.length} located cases · 1 instrument without location`;
  } else if (state.mode === 'evidence') {
    $('mode-count').textContent = `${atlas.evidence_records.length} evidence records · ${atlas.meta.input_kinds.length} input kinds`;
  } else {
    $('mode-count').textContent = `${atlas.outcomes.length} documented outcomes`;
  }
}

/* ---------- selection ---------- */
function selectCase(id) {
  state.caseId = id;
  if (globeReady && !clustered) applyLabels();
  markNav(); markPicker();
  renderDetail();
  if (state.mode === 'evidence') renderEvidence();
  if (state.mode === 'decisions') renderDecisions();
  const e = entityById(id);
  if (e) announce(`${e.label} selected.`);
}

/* ---------- boot ---------- */
async function start() {
  try {
    // Lighter simplified borders by default; ?borders=full loads the original
    // Natural Earth 110m for before/after tessellation comparison.
    const bordersUrl = new URLSearchParams(location.search).get('borders') === 'full'
      ? 'vendor/countries-110m.geojson' : 'vendor/countries-110m.min.geojson';
    const [aRes, gRes, cRes] = await Promise.all([
      fetch('../../data/atlas.json'),
      fetch('geo.json'),
      fetch(bordersUrl)
    ]);
    if (!aRes.ok) throw new Error(`atlas.json HTTP ${aRes.status}`);
    if (!gRes.ok) throw new Error(`geo.json HTTP ${gRes.status}`);
    atlas = await aRes.json();
    geo = await gRes.json();
    const features = cRes.ok ? (await cRes.json()).features : [];

    kinds = new Map(atlas.meta.input_kinds.map(k => [k.id, k]));
    const tagged = [
      ...atlas.entities.map(n => ({ ...n, node_type: 'entity' })),
      ...atlas.territories.map(n => ({ ...n, node_type: 'territory' })),
      ...atlas.evidence_records.map(n => ({ ...n, node_type: 'evidence_record' })),
      ...atlas.outcomes.map(n => ({ ...n, node_type: 'outcome' }))
    ];
    nodes = new Map(tagged.map(n => [n.id, n]));
    geoById = new Map(geo.reference_points.map(p => [p.entity_id, p]));

    $('subtitle').textContent = atlas.meta.subtitle + ' — prototype';
    $('notice').textContent = atlas.meta.notice;
    $('dataset-counts').textContent = `dataset v${atlas.schema_version} · reviewed ${atlas.meta.reviewed_at} · ${atlas.entities.length} entities · ${atlas.evidence_records.length} evidence records · ${atlas.outcomes.length} outcomes · prototype geo: ${geo.reference_points.length} representative locators`;

    buildModes(); buildNav(); buildPicker();
    $('territory-view').hidden = false;
    initGlobe(features);
    if (!globeReady && $('globe-fallback').hidden) { $('globe-fallback').hidden = false; renderFallback(); }

    $('reset').addEventListener('click', () => {
      state.caseId = null; renderDetail(); markNav(); markPicker();
      switchMode('territory');
      if (globeReady) { setClustered(true); world.pointOfView({ ...HOME }, reduced.matches ? 0 : 900); }
      $('modes').children[0].focus();
    });
    document.addEventListener('keydown', ev => {
      if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
      const order = ['territory', 'evidence', 'decisions'];
      if (['1', '2', '3'].includes(ev.key) && !/^(INPUT|TEXTAREA)$/.test(document.activeElement?.tagName)) {
        ev.preventDefault(); const i = Number(ev.key) - 1; switchMode(order[i]); $('modes').children[i].focus();
      }
      if (ev.key === 'Escape' && state.caseId) {
        ev.preventDefault();
        const prev = state.caseId;
        state.caseId = null; renderDetail(); markNav(); markPicker();
        if (globeReady && !clustered) applyLabels();
        if (state.mode === 'evidence') renderEvidence();
        if (state.mode === 'decisions') renderDecisions();
        const scope = state.mode === 'territory' ? $('nav-buttons') : $('case-picker');
        const btn = scope.querySelector(`[data-case="${prev}"]`);
        (btn || $('modes').children[0]).focus();
        announce('Selection cleared.');
      }
    });
    new ResizeObserver(() => sizeGlobe()).observe($('globe-wrap'));
    reduced.addEventListener('change', () => { if (globeReady && world.controls()) world.controls().autoRotate = !reduced.matches; });

    switchMode('territory');
    renderDetail();
  } catch (err) {
    console.error(err);
    $('question').textContent = 'The prototype could not be loaded';
    $('territory-view').hidden = true; $('reading-view').hidden = true;
    $('error').hidden = false;
    $('error').replaceChildren(
      el('h2', 'Serve this directory locally'),
      el('p', 'The prototype reads ../../data/atlas.json and geo.json at runtime. Opening index.html with file:// will not work.'),
      el('p', 'From the repository root run:  python -m http.server 8000'),
      el('p', 'Then open http://localhost:8000/prototype/immersive-globe/'),
      el('p', String(err.message || err), 'micro')
    );
  }
}
/* Minimal read-only hook for browser-based verification/review. No side effects. */
window.__proto = {
  labels: () => (typeof computeLabels === 'function' ? computeLabels(clustered) : []),
  clustered: () => clustered,
  mode: () => state.mode,
  caseId: () => state.caseId,
  globeReady: () => globeReady,
  autoRotate: () => !!(world && world.controls && world.controls() && world.controls().autoRotate)
};

start();
