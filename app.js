/* Stable keyboard order: SPEC §4 type order, then original dataset order. */
'use strict';
const state = { mode: 'territory', selectedNodeId: null, hiddenEvidenceClasses: new Set() };
const $ = id => document.getElementById(id);
const ns = 'http://www.w3.org/2000/svg';
const typeOrder = ['project', 'territory', 'method', 'evidence', 'decision'];
let atlas, nodes, ordered, classes, nodeElements, edgeElements;
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
const connections = id => atlas.edges.filter(e => e.source === id || e.target === id);
const other = (edge, id) => nodes.get(edge.source === id ? edge.target : edge.source);
const methodClass = id => atlas.edges.find(e => e.source === id && e.type === 'yields_evidence')?.target;
const classFor = node => node.type === 'evidence' ? node.id : methodClass(node.id) || node.evidence_declaration;
const evidenceCount = id => atlas.edges.filter(e => e.evidence === id).length;
const visibleNode = node => mode().node_types.includes(node.type);
const visibleEdge = edge => mode().edge_types.includes(edge.type);
const announce = text => { $('live').textContent = text; };
function floor(node) {
  const ranks = atlas.edges.filter(e => e.target === node.id && e.type === 'supports_decision')
    .map(e => nodes.get(e.source)).filter(n => n.type === 'method' && !n.governance)
    .map(n => nodes.get(methodClass(n.id))?.rank ?? 0);
  return atlas.meta.evidence_floor_labels[ranks.length ? Math.min(...ranks) : 0];
}
function glyph(evidence) {
  const group = svg('g', { fill:'none', stroke:evidence.color, 'stroke-width':1 });
  const circle = r => svg('circle', { r });
  switch (evidence.glyph) {
    case 'filled-circle': group.append(svg('circle', { r:5, fill:evidence.color })); break;
    case 'half-circle': group.append(circle(5), svg('path', { d:'M0 -5 A5 5 0 0 0 0 5 Z', fill:evidence.color })); break;
    case 'ringed-circle': group.append(circle(6), circle(3)); break;
    case 'diamond': group.append(svg('path', { d:'M0 -6 L6 0 L0 6 L-6 0 Z' })); break;
    case 'slashed-circle': group.append(circle(5), svg('path', { d:'M-6 6 L6 -6' })); break;
    default: group.append(circle(5));
  }
  return group;
}
function evidenceTag(id, count = false) {
  const evidence = nodes.get(id);
  const tag = el('span', null, 'evidence-tag');
  if (!evidence) { tag.textContent = 'Evidence not assigned'; return tag; }
  const mark = svg('svg', { viewBox:'0 0 48 20', 'aria-hidden':'true', class:'evidence-swatch' });
  const g = glyph(evidence); g.setAttribute('transform','translate(8 10)');
  mark.append(g, svg('line', { x1:20, x2:48, y1:10, y2:10, stroke:evidence.color,
    'stroke-width':evidence.stroke_width, 'stroke-dasharray':evidence.dash }));
  tag.append(mark, el('span', evidence.label));
  if (count) tag.append(el('span', ` ${evidenceCount(id)}`, 'micro'));
  return tag;
}
function buildGraph() {
  const defs = svg('defs');
  [null, ...classes].forEach(evidence => {
    const marker = svg('marker', { id:`arrow-${evidence?.id || 'neutral'}`, viewBox:'0 0 5 5',
      markerWidth:5, markerHeight:5, refX:5, refY:2.5, orient:'auto', markerUnits:'userSpaceOnUse' });
    marker.append(svg('path', { d:'M0 0 L5 2.5 L0 5 Z', fill:evidence?.color || 'var(--edge)' })); defs.append(marker);
  });
  const edges = svg('g', { 'aria-hidden':'true' });
  const nodeLayer = svg('g');
  $('graph').append(defs, edges, nodeLayer);
  edgeElements = new Map(atlas.edges.map(edge => {
    const evidence = nodes.get(edge.evidence);
    const path = svg('path', { class:'edge', fill:'none', stroke:evidence?.color || 'var(--edge)',
      'stroke-width':evidence?.stroke_width || 1, 'stroke-dasharray':evidence?.dash || 'none', 'data-edge':edge.id });
    if (['yields_evidence','supports_decision'].includes(edge.type)) path.setAttribute('marker-end',`url(#arrow-${edge.evidence || 'neutral'})`);
    edges.append(path); return [edge.id,path];
  }));
  nodeElements = new Map(ordered.map(node => {
    const group = svg('g', { class:`node ${node.type}`, role:'button', tabindex:0, 'data-node':node.id });
    group.append(svg('rect', { x:-22, y:-22, width:44, height:44, fill:'transparent' }),
      svg('rect', { x:-24, y:-24, width:48, height:48, class:'selection' }));
    let shape;
    if (node.type === 'project') shape = svg('rect', { x:-8, y:-8, width:16, height:16, fill:'var(--ink)' });
    if (node.type === 'method') shape = svg('circle', { r:4, fill:'var(--ink-2)' });
    if (node.type === 'territory') shape = svg('rect', { x:-10, y:-6, width:20, height:12, fill:'var(--bg)', stroke:'var(--ink-2)', 'stroke-width':2, 'stroke-dasharray':node.is_null ? '3 3':'none' });
    if (node.type === 'decision') shape = svg('path', { d:'M0 -8 L8 0 L0 8 L-8 0 Z', fill:'var(--bg)', stroke:'var(--ink-2)', 'stroke-width':2 });
    if (node.type === 'evidence') {
      shape = svg('g');
      shape.append(svg('circle', { r:9, fill:'var(--bg)', stroke:node.color, 'stroke-width':node.stroke_width, 'stroke-dasharray':node.dash }), glyph(node));
    }
    group.append(shape, svg('text', { 'text-anchor':'middle', y:26, class:'node-label' }));
    const territory = connections(node.id).find(e => e.type === 'operates_in');
    group.setAttribute('aria-label', `${node.label}, ${node.type}${territory ? ', ' + nodes.get(territory.target).label : ''}, ${connections(node.id).length} connections`);
    wireNode(group, node);
    nodeLayer.append(group); return [node.id,group];
  }));
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
  const neighbours = new Set(active ? [active, ...connections(active).filter(visibleEdge).map(e => other(e,active).id)] : []);
  document.querySelectorAll('[data-node]').forEach(element => {
    const node = nodes.get(element.getAttribute('data-node'));
    const filtered = state.mode === 'evidence' && state.hiddenEvidenceClasses.has(classFor(node));
    element.classList.toggle('dimmed', filtered || !!active && !neighbours.has(node.id));
    element.classList.toggle('selected', node.id === state.selectedNodeId);
    element.setAttribute('aria-pressed', String(node.id === state.selectedNodeId));
  });
  atlas.edges.forEach(edge => {
    const path = edgeElements.get(edge.id);
    const filtered = state.mode === 'evidence' && (state.hiddenEvidenceClasses.has(edge.evidence) || state.hiddenEvidenceClasses.has(methodClass(edge.target)));
    const connected = edge.source === active || edge.target === active;
    path.classList.toggle('dimmed', filtered || !!active && !connected);
    path.classList.toggle('highlighted', !!active && connected && !filtered);
  });
  const tip = $('tooltip'); tip.hidden = !id || narrow.matches;
  if (id && !narrow.matches) {
    const node = nodes.get(id);
    tip.textContent = `${node.full_label || node.label} · ${node.type}${node.type === 'method' ? ' · ' + (nodes.get(methodClass(id))?.label || (node.governance ? 'Governance; no evidence class' : 'Evidence not assigned')) : ''}`;
    const box = (origin || nodeElements.get(id)).getBoundingClientRect();
    const canvas = $('canvas').getBoundingClientRect();
    tip.style.left = `${Math.max(8,Math.min(canvas.width - tip.offsetWidth - 8, box.left - canvas.left))}px`;
    tip.style.top = `${Math.max(8,Math.min(canvas.height - tip.offsetHeight - 8,box.top - canvas.top - tip.offsetHeight - 8))}px`;
  }
}
function wrapLabel(text, label, width) {
  text.replaceChildren();
  const words = label.split(/\s+/); let line = ''; let row = 0;
  let span = svg('tspan', { x:0, dy:0 }); text.append(span);
  words.forEach(word => {
    span.textContent = line ? `${line} ${word}` : word;
    if (line && span.getComputedTextLength() > width) {
      span.textContent = line; span = svg('tspan', { x:0, dy:16 }); text.append(span); line = word; row++;
    } else line = span.textContent;
    span.textContent = line;
  });
  return row + 1;
}
function layout() {
  if (!atlas || narrow.matches) return;
  const width = $('canvas').clientWidth, height = $('canvas').clientHeight;
  const inset = innerWidth < 1024 ? 32 : 48;
  $('graph').setAttribute('viewBox',`0 0 ${width} ${height}`);
  const position = node => ({ x:inset + node.layout[state.mode].x * (width - 2*inset), y:inset + node.layout[state.mode].y * (height - 2*inset) });
  ordered.forEach(node => {
    const group = nodeElements.get(node.id), p = position(node);
    group.style.transform = `translate(${p.x}px,${p.y}px)`;
    group.style.display = visibleNode(node) ? '' : 'none';
    group.querySelectorAll('.aux-label,.floor-label').forEach(item => item.remove());
    if (!visibleNode(node)) return;
    const sameRow = ordered.filter(n => n.id !== node.id && visibleNode(n) && n.layout[state.mode].y === node.layout[state.mode].y);
    const nearest = Math.min(...sameRow.map(n => Math.abs(position(n).x - p.x)), 200);
    const labelWidth = Math.max(48, Math.min(nearest - 8, 2*(p.x-8), 2*(width-p.x-8), 184));
    const lines = wrapLabel(group.querySelector('.node-label'), node.label, labelWidth);
    const aux = node.type === 'decision' ? floor(node) : node.type === 'evidence' ? `${evidenceCount(node.id)} relationships` : node.evidence_declaration ? 'Not an evidence source' : '';
    if (aux) {
      const text = svg('text', { 'text-anchor':'middle', y:26 + lines*16 + 8, class:node.type === 'decision' ? 'floor-label':'aux-label' });
      group.append(text); wrapLabel(text, aux, labelWidth);
    }
  });
  atlas.edges.forEach(edge => {
    const path = edgeElements.get(edge.id); path.style.display = visibleEdge(edge) ? '' : 'none';
    const a = position(nodes.get(edge.source)), b = position(nodes.get(edge.target));
    const length = Math.hypot(b.x-a.x,b.y-a.y) || 1;
    const end = ['yields_evidence','supports_decision'].includes(edge.type) ? 12 : 10;
    const ax = a.x+(b.x-a.x)*10/length, ay = a.y+(b.y-a.y)*10/length;
    const bx = b.x-(b.x-a.x)*end/length, by = b.y-(b.y-a.y)*end/length;
    // Sibling arcs separate overlapping same-band lines without suggesting direction.
    path.setAttribute('d', edge.type === 'conceptually_adjacent' ? `M${ax} ${ay} Q${(ax+bx)/2} ${ay-length*.12} ${bx} ${by}` : `M${ax} ${ay} L${bx} ${by}`);
  });
}
function detailContent(node, inline = false) {
  const content = el('div', null, 'detail-content');
  content.append(el(inline ? 'h4':'h2',node.full_label || node.label), el('p',`${node.type} · ${node.id}`,'micro'), el('p',node.definition));
  const section = (title, value) => { content.append(el(inline ? 'h4':'h3',title), el('p',value)); };
  section('Source basis', node.basis || 'No separate source basis is supplied for this evidence vocabulary class. Its definition is declared by the atlas dataset.');
  if (node.folds?.length) section('Folded terms',node.folds.join(' · '));
  if (node.note) section('Declaration',node.note);
  if (node.unused_reason) section('Unused in this version',node.unused_reason);
  if (node.type === 'decision') section('Input-class floor',`${floor(node)}. Lowest declared evidence-status rank among supporting methods; governance methods and project links are excluded. This is an input-provenance summary, not validation, causal attribution or decision sufficiency.`);
  const linked = connections(node.id);
  [...new Set(linked.map(e => e.type))].forEach(type => {
    content.append(el(inline ? 'h4':'h3',type.replaceAll('_',' ')));
    linked.filter(e => e.type === type).forEach(edge => {
      const item = el('div',null,'connection');
      item.append(el('p',`${nodes.get(edge.source).label} ${type === 'conceptually_adjacent' ? '↔' : '→'} ${nodes.get(edge.target).label}`),
        el('p',`Support: ${edge.support}`,'micro'), evidenceTag(edge.evidence), el('p',edge.basis));
      content.append(item);
    });
  });
  if (!linked.length) section('Connections','No relationships declared.');
  return content;
}
function updateDetail(origin) {
  document.querySelectorAll('.inline-detail').forEach(item => item.remove());
  const node = nodes.get(state.selectedNodeId);
  $('detail').replaceChildren();
  if (!node) {
    $('detail').hidden = false;
    $('detail').append(el('h2','Select a node'),el('p','Inspect its definition, source basis and relationships.'),el('p','Focus or hover to trace direct connections. Enter to select. Esc to deselect.','micro'));
  } else if (narrow.matches) {
    $('detail').hidden = true;
    const anchor = origin || [...$('outline').querySelectorAll('[data-node]')].find(item => item.getAttribute('data-node') === node.id);
    if (anchor) {
      const block = el('div',null,'inline-detail'); block.append(detailContent(node,true));
      (anchor.closest('h3') || anchor).after(block);
    }
  } else {
    $('detail').hidden = false; $('detail').append(detailContent(node)); $('detail').scrollTop = 0;
  }
}
function select(id, origin) { state.selectedNodeId = id; updateDetail(origin); highlight(id,origin); announce(`${nodes.get(id).label} selected.`); }
function renderOutline() {
  $('outline').replaceChildren();
  if (!narrow.matches) return;
  const included = new Set();
  function row(node, relationshipEvidence) {
    included.add(node.id);
    const button = el('button',null,'outline-row'); button.type = 'button'; button.dataset.node = node.id;
    button.append(el('span',node.label),el('span',node.type,'micro'));
    const id = relationshipEvidence || classFor(node);
    button.append(id ? evidenceTag(id) : el('span', node.governance ? 'Governance · no evidence class' : 'Evidence not assigned','micro'));
    wireNode(button,node); return button;
  }
  ordered.filter(n => n.type === mode().anchor_type).forEach(anchor => {
    const section = el('section',null,'outline-section'), heading = el('h3');
    const button = row(anchor); button.classList.add('anchor-row'); heading.append(button); section.append(heading);
    if (anchor.type === 'decision') section.append(el('p',`Input-class floor: ${floor(anchor)}`,'label'));
    const direct = connections(anchor.id).filter(visibleEdge).map(e => other(e,anchor.id));
    const expanded = new Map(direct.map(n => [n.id,n]));
    if (anchor.type === 'evidence') direct.forEach(n => connections(n.id).filter(e => e.type === 'applies_method').forEach(e => expanded.set(e.source,nodes.get(e.source))));
    ordered.filter(n => expanded.has(n.id)).forEach(n => {
      const link = connections(anchor.id).find(e => visibleEdge(e) && other(e,anchor.id).id === n.id);
      section.append(row(n,link?.evidence));
    });
    if (!expanded.size) section.append(el('p','No connected nodes in this mode.','micro'));
    $('outline').append(section);
  });
  const remaining = ordered.filter(n => visibleNode(n) && !included.has(n.id));
  if (remaining.length) {
    const section = el('section',null,'outline-section'); section.append(el('h3','Other nodes in this mode'));
    remaining.forEach(n => section.append(row(n))); $('outline').append(section);
  }
}
function renderLegend() {
  $('legend').replaceChildren();
  if (state.mode === 'evidence') classes.forEach(evidence => {
    const button = el('button',null,'legend-entry'); button.type = 'button';
    button.setAttribute('aria-pressed',String(!state.hiddenEvidenceClasses.has(evidence.id)));
    button.setAttribute('aria-label',`${evidence.label}, ${evidenceCount(evidence.id)} relationships`);
    button.append(evidenceTag(evidence.id,true));
    button.addEventListener('click', () => {
      if (state.hiddenEvidenceClasses.has(evidence.id)) state.hiddenEvidenceClasses.delete(evidence.id); else state.hiddenEvidenceClasses.add(evidence.id);
      button.setAttribute('aria-pressed',String(!state.hiddenEvidenceClasses.has(evidence.id)));
      $('empty-filter').hidden = state.hiddenEvidenceClasses.size !== classes.length;
      highlight(null); announce(`${evidence.label} ${state.hiddenEvidenceClasses.has(evidence.id) ? 'off':'on'}. ${classes.length-state.hiddenEvidenceClasses.size} of ${classes.length} classes shown.`);
    }); $('legend').append(button);
  });
  else $('legend').append(el('p',state.mode === 'territory' ? 'Conceptual anchors, not a map. Dashed territory: not declared. Curved links: conceptual siblings.' : 'Questions, not outputs. Input-class floor: lowest declared evidence status among supporting methods; not validation or decision sufficiency.','label'));
  $('empty-filter').hidden = state.mode !== 'evidence' || state.hiddenEvidenceClasses.size !== classes.length;
}
function switchMode(id, report = true) {
  state.mode = id;
  if (state.selectedNodeId && !visibleNode(nodes.get(state.selectedNodeId))) state.selectedNodeId = null;
  $('question').textContent = mode().question;
  $('mode-count').textContent = `${ordered.filter(visibleNode).length} nodes · ${atlas.edges.filter(visibleEdge).length} relationships`;
  $('graph').setAttribute('aria-label',`${mode().label} mode. ${mode().question}`);
  [...$('modes').children].forEach(tab => { const selected = tab.dataset.mode === id; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex = selected ? 0:-1; });
  renderOutline(); layout(); renderLegend(); updateDetail(); highlight(null);
  if (report) announce(`${mode().label} mode. ${mode().question}`);
}
async function start() {
  try {
    const response = await fetch('data/atlas.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    atlas = await response.json(); nodes = new Map(atlas.nodes.map(n => [n.id,n]));
    ordered = typeOrder.flatMap(type => atlas.nodes.filter(n => n.type === type));
    classes = atlas.meta.evidence_order.map(id => nodes.get(id));
    document.querySelector('h1').textContent = atlas.meta.title;
    $('subtitle').textContent = atlas.meta.subtitle; $('notice').textContent = atlas.meta.notice;
    $('dataset-counts').textContent = `v${atlas.schema_version} · ${atlas.nodes.length} nodes · ${atlas.edges.length} edges · ` + typeOrder.map(type => `${atlas.nodes.filter(n => n.type === type).length} ${type}`).join(' · ');
    atlas.meta.modes.forEach((item,index) => {
      const tab = el('button',item.label); tab.type='button'; tab.role='tab'; tab.dataset.mode=item.id;
      tab.addEventListener('click',() => switchMode(item.id));
      tab.addEventListener('keydown',event => {
        if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
        event.preventDefault(); const next=(index+(event.key === 'ArrowRight' ? 1:2))%3;
        switchMode(atlas.meta.modes[next].id); $('modes').children[next].focus();
      }); $('modes').append(tab);
    });
    buildGraph(); switchMode(state.mode,false);
    $('reset').addEventListener('click',() => { state.selectedNodeId=null; state.hiddenEvidenceClasses.clear(); switchMode(atlas.meta.modes[0].id); });
    document.addEventListener('keydown',event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (['1','2','3'].includes(event.key)) { event.preventDefault(); switchMode(atlas.meta.modes[Number(event.key)-1].id); $('modes').children[Number(event.key)-1].focus(); }
      if (event.key === 'Escape') {
        const previous=state.selectedNodeId; state.selectedNodeId=null; updateDetail();
        const target=narrow.matches ? [...$('outline').querySelectorAll('[data-node]')].find(item => item.dataset.node === previous) : nodeElements.get(previous);
        target?.focus(); highlight(focusedNode()); announce('Selection cleared.');
      }
    });
    new ResizeObserver(() => layout()).observe($('canvas'));
    narrow.addEventListener('change',() => { renderOutline(); layout(); updateDetail(); highlight(null); });
  } catch (error) {
    $('question').textContent='The atlas could not be loaded'; $('canvas').hidden=true;
    $('error').hidden=false; $('error').replaceChildren(el('h2','Serve this directory locally'),el('p','The atlas reads data/atlas.json at runtime. Opening index.html directly with file:// will not work. Start a local static server from this directory:'),el('p','python -m http.server 8000'),el('p','Then open http://localhost:8000. If a server is already running, check that data/atlas.json is present and valid.'));
    $('reset').disabled=true;
  }
}
start();
