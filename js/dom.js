// DOM helpers shared by every view. No framework; elements are built
// directly, and all dataset text is inserted as text nodes (never as HTML).

export const SVGNS = 'http://www.w3.org/2000/svg';

// h('p.body.muted', {attrs}, ...children) — tag with optional classes.
export function h(spec, attrs, ...children) {
  const [tag, ...cls] = spec.split('.');
  const el = document.createElement(tag || 'div');
  if (cls.length) el.className = cls.join(' ');
  if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) {
    children.unshift(attrs);
    attrs = null;
  }
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'on') for (const [ev, fn] of Object.entries(v)) el.addEventListener(ev, fn);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, children);
  return el;
}

export function s(tag, attrs = {}, ...children) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  append(el, children);
  return el;
}

export function append(el, children) {
  for (const c of children.flat(Infinity)) {
    if (c == null || c === false || c === '') continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

// External link (interaction 6): explicit activation only, new tab, and an
// accessible name that says so.
export function ext(href, ...children) {
  return h('a', { href, target: '_blank', rel: 'noopener noreferrer' },
    ...children, h('span.ext', { 'aria-hidden': 'true' }, ' ↗'), h('span.sr-only', ' (opens in a new tab)'));
}

export function label(text, extra = '') {
  return h(`span.label${extra}`, text);
}

export function micro(...children) {
  return h('span.micro', ...children);
}

// A 40-hex commit pin is shown as 8 characters; the rest stays in the
// accessible text. Every other pin (tag, DOI, record id) is shown in full.
export function pin(ref) {
  const m = /^([0-9a-f]{8})([0-9a-f]{32})$/.exec(ref || '');
  if (!m) return h('span.pin', ref);
  return h('span.pin', m[1], h('span.sr-only', m[2]));
}

// Numbered section heading (§6.3): mono number, uppercase label, rule.
export function section(num, name, ...content) {
  const id = `sec-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return h('section.section', { 'aria-labelledby': id },
    h('div.sec-head', h('span.num', { 'aria-hidden': 'true' }, String(num).padStart(2, '0')), h('h2', { id }, name)),
    ...content);
}

// ---- evidence input kinds (§3.4): colour + dash + glyph + text, always together

const GLYPHS = {
  observed: () => [s('circle', { cx: 6, cy: 6, r: 4.5, fill: 'currentColor' })],
  acquired: () => [s('circle', { cx: 6, cy: 6, r: 4.5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.25 }),
    s('path', { d: 'M6 1.5a4.5 4.5 0 0 0 0 9z', fill: 'currentColor' })],
  derived: () => [s('circle', { cx: 6, cy: 6, r: 5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1 }),
    s('circle', { cx: 6, cy: 6, r: 2.5, fill: 'currentColor' })],
  simulated: () => [s('path', { d: 'M6 1 11 6 6 11 1 6z', fill: 'currentColor' })],
  reported: () => [s('circle', { cx: 6, cy: 6, r: 4.5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 })],
  unestablished: () => [s('circle', { cx: 6, cy: 6, r: 4.5, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.25 }),
    s('path', { d: 'M2.8 9.2 9.2 2.8', stroke: 'currentColor', 'stroke-width': 1.25 })],
};

export function glyph(kind) {
  return s('svg', { class: `glyph k-${kind}`, viewBox: '0 0 12 12', width: 12, height: 12, 'aria-hidden': 'true', focusable: 'false' },
    ...GLYPHS[kind]());
}

// Horizontal sample of the kind's dash pattern, so the pattern is visible
// wherever the kind is named (not only on the evidence record's left rule).
export function dashSwatch(kind, dash) {
  return s('svg', { class: `swatch k-${kind}`, viewBox: '0 0 20 4', width: 20, height: 4, 'aria-hidden': 'true', focusable: 'false' },
    s('line', { x1: 0, y1: 2, x2: 20, y2: 2, stroke: 'currentColor', 'stroke-width': 2, 'stroke-dasharray': dash === 'none' ? null : dash }));
}

export function kindMark(k) {
  return h('span.kind-mark', glyph(k.id), dashSwatch(k.id, k.dash), h('span.kind-name', k.label));
}

// Vertical 2 px left rule of an evidence record, drawn with the kind's dash.
export function kindRule(k) {
  return s('svg', { class: `ev__rule k-${k.id}`, width: 2, height: '100%', 'aria-hidden': 'true', focusable: 'false' },
    s('line', { x1: 1, y1: 0, x2: 1, y2: '100%', stroke: 'currentColor', 'stroke-width': 2, 'stroke-dasharray': k.dash === 'none' ? null : k.dash }));
}

// Vocabularies that are text only (no colour, no order implied).
export const CLASS_LABEL = {
  documented_research: 'Documented research', experiment: 'Experiment', research_platform: 'Research platform',
  instrument: 'Instrument', proposal: 'Proposal', archived_artifact: 'Archived artifact',
};
export const CLASS_BAND = {
  documented_research: 'Documented research', experiment: 'Experiments', research_platform: 'Research platforms', instrument: 'Instruments',
};
export const PUB_TYPE = {
  journal_article: 'Journal article', conference_paper: 'Conference paper', preprint: 'Preprint', thesis: 'Thesis',
  report: 'Report', book_chapter: 'Book chapter', dataset: 'Dataset', software: 'Software', other: 'Other',
};
export const EDITORIAL = {
  peer_reviewed: 'Peer-reviewed', editorially_reviewed: 'Editorially reviewed', under_review: 'Under review',
  not_peer_reviewed: 'Not peer-reviewed', unpublished: 'Unpublished',
};
export const REPRO = {
  rerunnable: 'Rerunnable', inspectable: 'Inspectable', documented_only: 'Documented only', none: 'None',
};
export const SOURCE_KIND = {
  repository: 'repository', commit: 'commit', release: 'release', closeout: 'closeout', brief: 'brief',
  preprint: 'preprint', dataset_record: 'dataset record', publication: 'publication', official_dataset: 'official dataset',
};
const LICENSE_TEXT = { not_stated: 'Not stated', none: 'None', custom: 'Custom' };

export function licenseValue(v) {
  return LICENSE_TEXT[v] || v;
}
