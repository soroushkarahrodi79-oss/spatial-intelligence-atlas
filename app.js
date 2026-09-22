/* Stable keyboard order: SPEC §4 type order (entity, territory, evidence_record, outcome), then dataset order. */
'use strict';
const state = { mode: 'territory', selectedNodeId: null };
const $ = id => document.getElementById(id);
const ns = 'http://www.w3.org/2000/svg';
const typeOrder = ['entity', 'territory', 'evidence_record', 'outcome'];
let atlas, nodes, ordered, kinds, nodeElements, edgeElements;
const narrow = matchMedia('(max-width:639px)');
const el = (tag, text, className) => {
  const element = document.createElement(tag);
  if (text != null) element.textContent = text;
  if (className) element.className = className;
  return element;
};
const svg = (tag, attrs = {}) => {
  const element = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
};
const mode = () => atlas.meta.modes.find(item => item.id === state.mode);
const connections = id => atlas.relationships.filter(r => r.source === id || r.target === id);
const other = (rel, id) => nodes.get(rel.source === id ? rel.target : rel.source);
const visibleNode = node => mode().node_types.includes(node.node_type);
const visibleEdge = rel => mode().edge_types.includes(rel.type);
const announce = text => { $('live').textContent = text; };
const verdictLabel = { abstain: 'ABSTAIN', insufficient_evidence: 'INSUFFICIENT EVIDENCE', no_go: 'NO-GO', functional_test: 'FUNCTIONAL TEST' };
const substantiationLabel = { source_stated: 'SOURCE-STATED', owner_attested: 'OWNER-ATTESTED', not_established: 'NOT ESTABLISHED' };
function glyph(kind) {
  const group = svg('g', { fill: 'none', stroke: kind.color, 'stroke-width': 1 });
  const circle = r => svg('circle', { r });
  switch (kind.glyph) {
    case 'filled-circle': group.append(svg('circle', { r: 5, fill: kind.color })); break;
    case 'half-circle': group.append(circle(5), svg('path', { d: 'M0 -5 A5 5 0 0 0 0 5 Z', fill: kind.color })); break;
    case 'ringed-circle': group.append(circle(6), circle(3)); break;
    case 'diamond': group.append(svg('path', { d: 'M0 -6 L6 0 L0 6 L-6 0 Z' })); break;
    case 'slashed-circle': group.append(circle(5), svg('path', { d: 'M-6 6 L6 -6' })); break;
    default: group.append(circle(5));
  }
  return group;
}
function inputKindTag(id, count = false) {
  const kind = kinds.get(id);
  const tag = el('span', null, 'evidence-tag');
  const mark = svg('svg', { viewBox: '0 0 48 20', 'aria-hidden': 'true', class: 'evidence-swatch' });
  const g = glyph(kind); g.setAttribute('transform', 'translate(8 10)');
  mark.append(g, svg('line', { x1: 20, x2: 48, y1: 10, y2: 10, stroke: kind.color, 'stroke-width': kind.stroke_width, 'stroke-dasharray': kind.dash }));
  tag.append(mark, el('span', kind.label));
  if (count) tag.append(el('span', ` ${evidenceCount(id)}`, 'micro'));
  return tag;
}
function evidenceCount(kindId) { return atlas.evidence_records.filter(r => r.input_kind === kindId).length; }
function sourceLink(id) {
  const source = atlas.sources.find(s => s.id === id);
  const a = el('a', source.label);
  a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', `${source.label}, opens in a new tab`);
  a.className = 'source-link';
  return a;
}
function sourceList(ids) {
  const list = el('ul', null, 'source-list');
  ids.forEach(id => { const item = el('li'); item.append(sourceLink(id)); list.append(item); });
  return list;
}
function buildGraph() {
  const edges = svg('g', { 'aria-hidden': 'true' });
  const nodeLayer = svg('g');
  $('graph').append(edges, nodeLayer);
  edgeElements = new Map(atlas.relationships.map(rel => {
    const target = nodes.get(rel.target);
    const kind = target.node_type === 'evidence_record' ? kinds.get(target.input_kind) : null;
    const path = svg('path', {
      class: 'edge', fill: 'none', stroke: kind?.color || 'var(--edge)',
      'stroke-width': kind?.stroke_width || 1, 'stroke-dasharray': kind?.dash || 'none', 'data-edge': rel.id
    });
    edges.append(path); return [rel.id, path];
  }));
  nodeElements = new Map(ordered.map(node => {
    const group = svg('g', { class: `node ${node.node_type}`, role: 'button', tabindex: 0, 'data-node': node.id });
    group.append(
      svg('rect', { x: -22, y: -22, width: 44, height: 44, fill: 'transparent' }),
      svg('rect', { x: -24, y: -24, width: 48, height: 48, class: 'selection' })
    );
    let shape;
    if (node.node_type === 'entity' && node.kind === 'case') {
      shape = svg('rect', { x: -8, y: -8, width: 16, height: 16, fill: 'var(--ink)' });
    } else if (node.node_type === 'entity' && node.kind === 'instrument') {
      shape = svg('g');
      shape.append(
        svg('rect', { x: -8, y: -8, width: 16, height: 16, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2 }),
        svg('rect', { x: -5, y: -5, width: 10, height: 10, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 1 })
      );
    } else if (node.node_type === 'territory') {
      shape = svg('rect', { x: -10, y: -6, width: 20, height: 12, fill: 'var(--bg)', stroke: 'var(--ink-2)', 'stroke-width': 2 });
    } else if (node.node_type === 'outcome') {
      shape = svg('path', { d: 'M0 -8 L8 0 L0 8 L-8 0 Z', fill: 'var(--bg)', stroke: 'var(--ink-2)', 'stroke-width': 2 });
    } else if (node.node_type === 'evidence_record') {
      const kind = kinds.get(node.input_kind);
      shape = svg('g');
      shape.append(svg('circle', { r: 9, fill: 'var(--bg)', stroke: kind.color, 'stroke-width': kind.stroke_width, 'stroke-dasharray': kind.dash }), glyph(kind));
    }
    group.append(shape, svg('text', { 'text-anchor': 'middle', y: 26, class: 'node-label' }));
    group.setAttribute('aria-label', ariaLabel(node));
    wireNode(group, node);
    nodeLayer.append(group); return [node.id, group];
  }));
}
function ariaLabel(node) {
  const parts = [node.node_type === 'outcome' ? verdictLabel[node.outcome_type] : (node.label || node.id)];
  if (node.node_type === 'entity') {
    parts.push(node.kind === 'case' ? 'core case' : 'supporting instrument');
    const territoryRel = atlas.relationships.find(r => r.type === 'situated_in' && r.source === node.id);
    if (territoryRel) parts.push(nodes.get(territoryRel.target).label);
    const outcomeRel = atlas.relationships.find(r => r.type === 'reports' && r.source === node.id);
    if (outcomeRel) parts.push(`documented outcome: ${nodes.get(outcomeRel.target).outcome_type.replace('_', ' ')}`);
  } else if (node.node_type === 'evidence_record') {
    parts.push(`evidence record, ${kinds.get(node.input_kind).label.toLowerCase()}`);
  } else if (node.node_type === 'territory') {
    parts.push('territory');
  } else if (node.node_type === 'outcome') {
    parts.push('documented outcome');
  }
  parts.push(`${connections(node.id).length} connections`);
  return parts.join(', ');
}
function wireNode(element, node) {
  element.addEventListener('mouseenter', () => highlight(node.id, element));
  element.addEventListener('mouseleave', () => highlight(focusedNode()));
  element.addEventListener('focus', () => highlight(node.id, element));
  element.addEventListener('blur', () => highlight(null));
  element.addEventListener('click', () => select(node.id, element));
  if (element.namespaceURI === ns) element.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(node.id, element); }
  });
}
function focusedNode() { return document.activeElement?.getAttribute('data-node') || null; }
function highlight(id, origin) {
  const active = id || state.selectedNodeId;
  const neighbours = new Set(active ? [active, ...connections(active).filter(visibleEdge).map(r => other(r, active).id)] : []);
  document.querySelectorAll('[data-node]').forEach(element => {
    const node = nodes.get(element.getAttribute('data-node'));
    element.classList.toggle('dimmed', !!active && !neighbours.has(node.id));
    element.classList.toggle('selected', node.id === state.selectedNodeId);
    element.setAttribute('aria-pressed', String(node.id === state.selectedNodeId));
  });
  atlas.relationships.forEach(rel => {
    const path = edgeElements.get(rel.id);
    const connected = rel.source === active || rel.target === active;
    path.classList.toggle('dimmed', !!active && !connected);
    path.classList.toggle('highlighted', !!active && connected);
  });
  const tip = $('tooltip'); tip.hidden = !id || narrow.matches;
  if (id && !narrow.matches) {
    const node = nodes.get(id);
    tip.textContent = tooltipText(node);
    const box = (origin || nodeElements.get(id)).getBoundingClientRect();
    const canvas = $('canvas').getBoundingClientRect();
    tip.style.left = `${Math.max(8, Math.min(canvas.width - tip.offsetWidth - 8, box.left - canvas.left))}px`;
    tip.style.top = `${Math.max(8, Math.min(canvas.height - tip.offsetHeight - 8, box.top - canvas.top - tip.offsetHeight - 8))}px`;
  }
}
function tooltipText(node) {
  if (node.node_type === 'outcome') return `${verdictLabel[node.outcome_type]} · documented outcome`;
  if (node.node_type === 'evidence_record') return `${node.label} · ${kinds.get(node.input_kind).label} · ${substantiationLabel[node.substantiation]}`;
  if (node.node_type === 'territory') return `${node.label} · territory`;
  return `${node.label} · ${node.kind === 'case' ? 'core case' : 'supporting instrument'}`;
}
function wrapLabel(text, label, width) {
  text.replaceChildren();
  const words = label.split(/\s+/); let line = ''; let row = 0;
  let span = svg('tspan', { x: 0, dy: 0 }); text.append(span);
  words.forEach(word => {
    span.textContent = line ? `${line} ${word}` : word;
    if (line && span.getComputedTextLength() > width) {
      span.textContent = line; span = svg('tspan', { x: 0, dy: 16 }); text.append(span); line = word; row++;
    } else line = span.textContent;
    span.textContent = line;
  });
  return row + 1;
}
function nodeLabelText(node) {
  if (node.node_type === 'outcome') return verdictLabel[node.outcome_type];
  return node.label;
}
function layout() {
  if (!atlas || narrow.matches) return;
  const width = $('canvas').clientWidth, height = $('canvas').clientHeight;
  const inset = innerWidth < 1024 ? 32 : 48;
  $('graph').setAttribute('viewBox', `0 0 ${width} ${height}`);
  const position = node => ({ x: inset + node.layout[state.mode].x * (width - 2 * inset), y: inset + node.layout[state.mode].y * (height - 2 * inset) });
  ordered.forEach(node => {
    const group = nodeElements.get(node.id);
    group.querySelectorAll('.aux-label').forEach(item => item.remove());
    group.style.display = visibleNode(node) ? '' : 'none';
    if (!visibleNode(node)) return;
    const p = position(node);
    group.style.transform = `translate(${p.x}px,${p.y}px)`;
    const sameRow = ordered.filter(n => n.id !== node.id && visibleNode(n) && n.layout[state.mode].y === node.layout[state.mode].y);
    const nearest = Math.min(...sameRow.map(n => Math.abs(position(n).x - p.x)), 200);
    const labelWidth = Math.max(48, Math.min(nearest - 8, 2 * (p.x - 8), 2 * (width - p.x - 8), 184));
    const lines = wrapLabel(group.querySelector('.node-label'), nodeLabelText(node), labelWidth);
    const aux = node.node_type === 'entity' ? (node.kind === 'case' ? 'CORE CASE' : 'SUPPORTING INSTRUMENT')
      : node.node_type === 'evidence_record' ? kinds.get(node.input_kind).label
      : '';
    if (aux) {
      const text = svg('text', { 'text-anchor': 'middle', y: 26 + lines * 16 + 8, class: 'aux-label' });
      group.append(text); wrapLabel(text, aux, labelWidth);
    }
  });
  atlas.relationships.forEach(rel => {
    const path = edgeElements.get(rel.id);
    const visible = visibleEdge(rel);
    path.style.display = visible ? '' : 'none';
    if (!visible) return;
    const a = position(nodes.get(rel.source)), b = position(nodes.get(rel.target));
    const length = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const ax = a.x + (b.x - a.x) * 10 / length, ay = a.y + (b.y - a.y) * 10 / length;
    const bx = b.x - (b.x - a.x) * 12 / length, by = b.y - (b.y - a.y) * 12 / length;
    path.setAttribute('d', `M${ax} ${ay} L${bx} ${by}`);
  });
}
function detailSection(content, heading, text, inline) {
  content.append(el(inline ? 'h4' : 'h3', heading), el('p', text));
}
function caseDetail(content, node, inline) {
  content.append(el(inline ? 'h4' : 'h2', node.label), el('p', 'CORE CASE', 'label'));
  detailSection(content, 'Research question', node.research_question, inline);
  const outcomeRel = atlas.relationships.find(r => r.type === 'reports' && r.source === node.id);
  const outcome = outcomeRel && nodes.get(outcomeRel.target);
  if (outcome) {
    detailSection(content, 'Documented result', `${verdictLabel[outcome.outcome_type]}: ${outcome.statement}`, inline);
    detailSection(content, 'Claim ceiling', outcome.claim_ceiling, inline);
  }
  detailSection(content, 'Research status', `${node.research_status} · reviewed ${node.reviewed_at}`, inline);
  const territoryRel = atlas.relationships.find(r => r.type === 'situated_in' && r.source === node.id);
  if (territoryRel) detailSection(content, 'Territory', nodes.get(territoryRel.target).label, inline);
  appendEvidenceRecords(content, node, inline);
  content.append(el(inline ? 'h4' : 'h3', 'Primary sources'));
  content.append(sourceList(node.source_ids));
}
function instrumentDetail(content, node, inline) {
  content.append(el(inline ? 'h4' : 'h2', node.label), el('p', 'SUPPORTING INSTRUMENT', 'label'));
  detailSection(content, 'Role', node.role, inline);
  const outcomeRel = atlas.relationships.find(r => r.type === 'reports' && r.source === node.id);
  const outcome = outcomeRel && nodes.get(outcomeRel.target);
  if (outcome) {
    detailSection(content, 'Documented functional result', `${verdictLabel[outcome.outcome_type]}: ${outcome.statement}`, inline);
    detailSection(content, 'Limitations', outcome.claim_ceiling, inline);
  }
  detailSection(content, 'Research status', `${node.research_status} · reviewed ${node.reviewed_at}`, inline);
  detailSection(content, 'Territory', 'No case-specific territory assigned.', inline);
  appendEvidenceRecords(content, node, inline);
  content.append(el(inline ? 'h4' : 'h3', 'Primary sources'));
  content.append(sourceList(node.source_ids));
}
function appendEvidenceRecords(content, node, inline) {
  const records = atlas.relationships.filter(r => r.type === 'documents' && r.source === node.id).map(r => nodes.get(r.target));
  content.append(el(inline ? 'h4' : 'h3', 'Evidence records'));
  if (!records.length) { content.append(el('p', 'No evidence records declared.')); return; }
  records.forEach(record => {
    const item = el('div', null, 'connection');
    item.append(el('p', record.label), inputKindTag(record.input_kind));
    item.append(el('p', `Substantiation: ${substantiationLabel[record.substantiation]}`, 'micro'));
    item.append(el('p', record.basis));
    item.append(el('p', `Limitation: ${record.limitation}`));
    content.append(item);
  });
}
function genericDetail(content, node, inline) {
  const kindLabel = node.node_type === 'territory' ? 'TERRITORY' : node.node_type === 'evidence_record' ? 'EVIDENCE RECORD' : 'DOCUMENTED OUTCOME';
  const title = node.node_type === 'outcome' ? verdictLabel[node.outcome_type] : node.label;
  content.append(el(inline ? 'h4' : 'h2', title), el('p', kindLabel, 'label'));
  const parentRel = atlas.relationships.find(r => r.target === node.id);
  const parent = parentRel && nodes.get(parentRel.source);
  if (node.node_type === 'territory') {
    detailSection(content, 'Basis', node.basis, inline);
  } else if (node.node_type === 'evidence_record') {
    content.append(inputKindTag(node.input_kind));
    detailSection(content, 'Substantiation', substantiationLabel[node.substantiation], inline);
    detailSection(content, 'Basis', node.basis, inline);
    detailSection(content, 'Limitation', node.limitation, inline);
  } else if (node.node_type === 'outcome') {
    detailSection(content, 'Statement', node.statement, inline);
    detailSection(content, 'Claim ceiling', node.claim_ceiling, inline);
    detailSection(content, 'Reviewed', node.reviewed_at, inline);
  }
  if (parent) {
    const parentLabel = node.node_type === 'territory' ? 'Situated case' : 'Parent entity';
    detailSection(content, parentLabel, parent.label, inline);
  }
  content.append(el(inline ? 'h4' : 'h3', 'Sources'));
  content.append(sourceList(node.source_ids));
}
function detailContent(node, inline = false) {
  const content = el('div', null, 'detail-content');
  if (node.node_type === 'entity' && node.kind === 'case') caseDetail(content, node, inline);
  else if (node.node_type === 'entity') instrumentDetail(content, node, inline);
  else genericDetail(content, node, inline);
  return content;
}
function updateDetail(origin) {
  document.querySelectorAll('.inline-detail').forEach(item => item.remove());
  const node = nodes.get(state.selectedNodeId);
  $('detail').replaceChildren();
  if (!node) {
    $('detail').hidden = false;
    $('detail').append(el('h2', 'Select a node'), el('p', 'Inspect its documented question, result, evidence and sources.'), el('p', 'Focus or hover to trace direct connections. Enter to select. Esc to deselect.', 'micro'));
  } else if (narrow.matches) {
    $('detail').hidden = true;
    const anchor = origin || [...$('outline').querySelectorAll('[data-node]')].find(item => item.getAttribute('data-node') === node.id);
    if (anchor) {
      const block = el('div', null, 'inline-detail'); block.append(detailContent(node, true));
      (anchor.closest('h3') || anchor).after(block);
    }
  } else {
    $('detail').hidden = false; $('detail').append(detailContent(node)); $('detail').scrollTop = 0;
  }
}
function select(id, origin) { state.selectedNodeId = id; updateDetail(origin); highlight(id, origin); announce(`${nodeLabelText(nodes.get(id))} selected.`); }
function renderOutline() {
  $('outline').replaceChildren();
  if (!narrow.matches) return;
  const included = new Set();
  function row(node, kindId) {
    included.add(node.id);
    const button = el('button', null, 'outline-row'); button.type = 'button'; button.dataset.node = node.id;
    button.append(el('span', nodeLabelText(node)), el('span', node.node_type.replace('_', ' '), 'micro'));
    if (kindId) button.append(inputKindTag(kindId));
    wireNode(button, node); return button;
  }
  ordered.filter(n => n.node_type === mode().anchor_type).forEach(anchor => {
    const section = el('section', null, 'outline-section'), heading = el('h3');
    const button = row(anchor); button.classList.add('anchor-row'); heading.append(button); section.append(heading);
    const direct = connections(anchor.id).filter(visibleEdge).map(r => other(r, anchor.id));
    ordered.filter(n => direct.some(d => d.id === n.id)).forEach(n => {
      section.append(row(n, n.node_type === 'evidence_record' ? n.input_kind : null));
    });
    if (!direct.length) section.append(el('p', 'No connected nodes in this mode.', 'micro'));
    $('outline').append(section);
  });
  const remaining = ordered.filter(n => visibleNode(n) && !included.has(n.id));
  if (remaining.length) {
    const isInstrumentRail = mode().id === 'territory' && remaining.every(n => n.node_type === 'entity' && n.kind === 'instrument');
    const section = el('section', null, 'outline-section');
    section.append(el('h3', isInstrumentRail ? 'Supporting instrument' : 'Other nodes in this mode'));
    remaining.forEach(n => {
      section.append(row(n, n.node_type === 'evidence_record' ? n.input_kind : null));
      if (isInstrumentRail) section.append(el('p', 'No case-specific territory assigned.', 'micro'));
    });
    $('outline').append(section);
  }
}
function renderLegend() {
  $('legend').replaceChildren();
  if (state.mode === 'evidence') atlas.meta.input_kinds.forEach(kind => {
    const entry = el('span', null, 'legend-entry');
    entry.setAttribute('aria-label', `${kind.label}, ${evidenceCount(kind.id)} evidence records`);
    entry.append(inputKindTag(kind.id, true));
    $('legend').append(entry);
  });
  else if (state.mode === 'territory') $('legend').append(el('p', 'Territories are conceptual anchors, not map geometry. The supporting instrument has no case-specific territory.', 'label'));
  else $('legend').append(el('p', 'Documented results, not hypothetical uses. Every outcome carries a claim ceiling in the detail panel.', 'label'));
}
function switchMode(id, report = true) {
  state.mode = id;
  if (state.selectedNodeId && !visibleNode(nodes.get(state.selectedNodeId))) state.selectedNodeId = null;
  $('question').textContent = mode().question;
  $('mode-count').textContent = `${ordered.filter(visibleNode).length} nodes · ${atlas.relationships.filter(visibleEdge).length} relationships`;
  $('graph').setAttribute('aria-label', `${mode().label} mode. ${mode().question}`);
  [...$('modes').children].forEach(tab => { const selected = tab.dataset.mode === id; tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1; });
  renderOutline(); layout(); renderLegend(); updateDetail(); highlight(null);
  if (report) announce(`${mode().label} mode. ${mode().question}`);
}
async function start() {
  try {
    const response = await fetch('data/atlas.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    atlas = await response.json();
    kinds = new Map(atlas.meta.input_kinds.map(k => [k.id, k]));
    const tagged = [
      ...atlas.entities.map(n => ({ ...n, node_type: 'entity' })),
      ...atlas.territories.map(n => ({ ...n, node_type: 'territory' })),
      ...atlas.evidence_records.map(n => ({ ...n, node_type: 'evidence_record' })),
      ...atlas.outcomes.map(n => ({ ...n, node_type: 'outcome' }))
    ];
    nodes = new Map(tagged.map(n => [n.id, n]));
    ordered = typeOrder.flatMap(type => tagged.filter(n => n.node_type === type));
    document.querySelector('h1').textContent = atlas.meta.title;
    $('subtitle').textContent = atlas.meta.subtitle; $('notice').textContent = atlas.meta.notice;
    $('dataset-counts').textContent = `v${atlas.schema_version} · reviewed ${atlas.meta.reviewed_at} · ${atlas.entities.length} entities · ${atlas.territories.length} territories · ${atlas.evidence_records.length} evidence records · ${atlas.outcomes.length} outcomes`;
    atlas.meta.modes.forEach((item, index) => {
      const tab = el('button', item.label); tab.type = 'button'; tab.role = 'tab'; tab.dataset.mode = item.id;
      tab.addEventListener('click', () => switchMode(item.id));
      tab.addEventListener('keydown', event => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault(); const next = (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
        switchMode(atlas.meta.modes[next].id); $('modes').children[next].focus();
      }); $('modes').append(tab);
    });
    buildGraph(); switchMode(state.mode, false);
    $('reset').addEventListener('click', () => { state.selectedNodeId = null; switchMode(atlas.meta.modes[0].id); });
    document.addEventListener('keydown', event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (['1', '2', '3'].includes(event.key)) { event.preventDefault(); switchMode(atlas.meta.modes[Number(event.key) - 1].id); $('modes').children[Number(event.key) - 1].focus(); }
      if (event.key === 'Escape') {
        const previous = state.selectedNodeId; state.selectedNodeId = null; updateDetail();
        const target = narrow.matches ? [...$('outline').querySelectorAll('[data-node]')].find(item => item.dataset.node === previous) : nodeElements.get(previous);
        target?.focus(); highlight(focusedNode()); announce('Selection cleared.');
      }
    });
    new ResizeObserver(() => layout()).observe($('canvas'));
    narrow.addEventListener('change', () => { renderOutline(); layout(); updateDetail(); highlight(null); });
  } catch (error) {
    $('question').textContent = 'The atlas could not be loaded'; $('canvas').hidden = true;
    $('error').hidden = false; $('error').replaceChildren(el('h2', 'Serve this directory locally'), el('p', 'The atlas reads data/atlas.json at runtime. Opening index.html directly with file:// will not work. Start a local static server from this directory:'), el('p', 'python -m http.server 8000'), el('p', 'Then open http://localhost:8000. If a server is already running, check that data/atlas.json is present and valid.'));
    $('reset').disabled = true;
  }
}
start();
