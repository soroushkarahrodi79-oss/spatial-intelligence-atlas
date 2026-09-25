/* Spatial Intelligence Atlas — v0.3 experience prototype (experimental, not a release).
   Reads the unmodified deployed dataset at ../../data/atlas.json.
   IA: docs/v0.3/SPEC_PROPOSAL.md — Motion: docs/v0.3/MOTION_CONTRACT.md */
'use strict';

const $ = id => document.getElementById(id);
const ns = 'http://www.w3.org/2000/svg';
const el = (tag, text, className) => {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  if (className) e.className = className;
  return e;
};
const svg = (tag, attrs = {}) => {
  const e = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  return e;
};
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const announce = text => { $('live').textContent = text; };

const verdictLabel = { abstain: 'ABSTAIN', insufficient_evidence: 'INSUFFICIENT EVIDENCE', no_go: 'NO-GO', functional_test: 'FUNCTIONAL TEST' };
const substantiationLabel = { source_stated: 'SOURCE-STATED', owner_attested: 'OWNER-ATTESTED', not_established: 'NOT ESTABLISHED' };
const statusLabel = { active: 'Active', frozen: 'Frozen', closed: 'Closed', maintenance: 'Maintenance' };

let atlas, kinds, sourcesById, entities;
let currentIndex = -1;
const pageTitle = document.title;

/* ---- evidence glyphs — same path data as the deployed v0.2.1 glyphs (DESIGN_CONTRACT.md §3.3) ---- */
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
function glyphIcon(kind) {
  const mark = svg('svg', { viewBox: '-10 -10 20 20', width: 18, height: 18, 'aria-hidden': 'true' });
  mark.append(glyph(kind));
  return mark;
}

/* ---- relationship helpers (same relationships already in data/atlas.json — no new schema) ---- */
function relOf(entityId, type) { return atlas.relationships.filter(r => r.source === entityId && r.type === type); }
function territoryOf(entityId) {
  const rel = relOf(entityId, 'situated_in')[0];
  return rel ? atlas.territories.find(t => t.id === rel.target) : null;
}
function evidenceOf(entityId) {
  return relOf(entityId, 'documents').map(r => atlas.evidence_records.find(e => e.id === r.target));
}
function outcomeOf(entityId) {
  const rel = relOf(entityId, 'reports')[0];
  return rel ? atlas.outcomes.find(o => o.id === rel.target) : null;
}
function sourceLabel(id) { return sourcesById.get(id); }

function resultText(outcome) {
  const verdict = verdictLabel[outcome.outcome_type];
  return outcome.statement.includes(verdict) ? outcome.statement : `${verdict}: ${outcome.statement}`;
}

/* ---- overview ----
   Deliberately no aria-label override here: a custom aria-label replaces
   an element's ENTIRE accessible name, which would discard the role,
   territory and verdict text this row already renders visually — the
   exact "screen-reader equivalent to the visualisation" requirement
   (DESIGN_CONTRACT.md §8) this prototype is supposed to meet, not defeat.
   The button's accessible name is simply its rendered text content, in
   the same order a sighted reader scans it.

   No evidence-input-kind summary is rendered here (a prior draft showed
   unlabelled colour/shape glyphs with only an sr-only text equivalent —
   visually undecodable, so sighted and non-visual readers received
   different information, which is the opposite of the goal). The
   Overview's job is the 10/30-second orientation question — which entity,
   where, what was the result — not evidence-kind detail; that detail is
   fully labelled (kind name, substantiation, glyph, dash) inside the Case
   reader, where it belongs. See SPEC_PROPOSAL.md §3.1. */
function overviewRow(entity) {
  const button = el('button', null, `overview-row${entity.kind === 'instrument' ? ' overview-row--instrument' : ''}`);
  button.type = 'button';
  const kindLabel = entity.kind === 'case' ? 'CORE CASE' : 'SUPPORTING INSTRUMENT';
  button.append(el('span', kindLabel, 'label overview-kind'));
  button.append(el('span', entity.label, 'overview-label'));
  button.append(el('span', entity.role, 'body overview-role'));

  const meta = el('div', null, 'overview-meta');
  const territory = territoryOf(entity.id);
  meta.append(el('span', territory ? territory.label : 'No case-specific territory assigned.', 'micro'));
  const outcome = outcomeOf(entity.id);
  if (outcome) meta.append(el('span', verdictLabel[outcome.outcome_type], 'overview-verdict'));

  button.append(meta);
  button.addEventListener('click', () => openCase(entity.id));
  return button;
}

function renderOverview() {
  const list = $('overview-list');
  list.replaceChildren();
  entities.forEach(entity => list.append(overviewRow(entity)));
}

/* ---- case reader ---- */
function sectionBlock(container, heading, bodyText) {
  const section = el('div');
  section.append(el('h3', heading, 'label'));
  const body = el('div', null, 'section-body');
  body.append(el('p', bodyText));
  section.append(body);
  container.append(section);
}

/* Evidence records are a real <ol> of <li>s (SPEC_PROPOSAL.md §10) — not a
   div soup — so a screen reader announces list semantics (list, position,
   size) the way it would for any other list of records. The basis
   disclosure uses native <details>/<summary>: the browser removes its
   content from the accessibility tree and tab order while closed, and
   restores both when open, which a custom button+ARIA toggle has to
   reimplement by hand and can get wrong. The open/close text swap is pure
   CSS (details[open] ...), so no click handler is needed for it at all. */
function evidenceRecordBlock(record) {
  const kind = kinds.get(record.input_kind);
  const item = el('li', null, 'evidence-record');
  const head = el('div', null, 'evidence-head');
  head.append(glyphIcon(kind), el('span', kind.label, 'label'), el('span', record.label, 'evidence-label body'));
  item.append(head);
  item.append(el('p', `Substantiation: ${substantiationLabel[record.substantiation]}`, 'evidence-substantiation micro'));
  const limitation = el('p', null, 'evidence-limitation body');
  limitation.append(el('span', 'Limitation: ', 'label-inline'));
  limitation.append(document.createTextNode(record.limitation));
  item.append(limitation);

  const details = el('details', null, 'basis-disclosure');
  const summary = el('summary', null, 'disclosure');
  summary.append(el('span', 'Full basis', 'disclosure-closed-text'), el('span', 'Hide full basis', 'disclosure-open-text'));
  const quote = el('p', record.basis, 'basis-quote body');
  details.append(summary, quote);
  item.append(details);
  return item;
}

function verificationEntry(sourceId) {
  const source = sourceLabel(sourceId);
  const li = el('li');
  const a = el('a', source.label, 'source-link');
  a.href = source.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
  a.setAttribute('aria-label', `${source.label}, opens in a new tab`);
  li.append(a);
  li.append(el('p', `${source.kind} · pinned ${source.pinned_ref.slice(0, 8)} · accessed ${source.accessed_at}`, 'source-meta micro'));
  li.querySelector('.source-meta').setAttribute('title', source.pinned_ref);
  return li;
}

/* Section order is question -> territory -> result -> claim ceiling ->
   evidence, matching SPEC_PROPOSAL.md §3.1/§3.3: the audience's 30-second
   need (SPEC.md §2) is the headline result and its boundary, not the
   supporting detail, so the result and its claim ceiling now come before
   the itemised evidence records rather than after them.

   Verification-rail source order follows the same reading order exactly
   (SPEC_PROPOSAL.md §9): identity/question sources, then territory, then
   result+ceiling, then each evidence record in listed order — first
   citation wins, a Set preserves that insertion order, and nothing is
   re-sorted afterward. */
function renderCase(entity) {
  const isCase = entity.kind === 'case';
  $('case-kind').textContent = isCase ? 'CORE CASE' : 'SUPPORTING INSTRUMENT';
  $('case-heading').textContent = entity.label;
  const sourceIds = new Set();
  (entity.source_ids || []).forEach(id => sourceIds.add(id));

  const questionSection = $('case-question'); questionSection.replaceChildren();
  sectionBlock(questionSection, isCase ? 'Research question' : 'Role', isCase ? entity.research_question : entity.role);
  const statusLine = `${statusLabel[entity.research_status]} · reviewed ${entity.reviewed_at}`;
  questionSection.append(el('p', statusLine, 'micro'));

  const territorySection = $('case-territory'); territorySection.replaceChildren();
  const territory = territoryOf(entity.id);
  if (isCase) {
    sectionBlock(territorySection, 'Territory', territory ? territory.label : 'No territory declared.');
    territorySection.hidden = false;
    (territory ? territory.source_ids || [] : []).forEach(id => sourceIds.add(id));
  } else {
    territorySection.hidden = true;
  }

  const resultSection = $('case-result'); resultSection.replaceChildren();
  const ceilingSection = $('case-ceiling'); ceilingSection.replaceChildren();
  const outcome = outcomeOf(entity.id);
  if (outcome) {
    sectionBlock(resultSection, isCase ? 'Documented result' : 'Documented functional result', resultText(outcome));
    sectionBlock(ceilingSection, isCase ? 'Claim ceiling' : 'Limitations', outcome.claim_ceiling);
    (outcome.source_ids || []).forEach(id => sourceIds.add(id));
  }

  const evidenceList = $('evidence-list'); evidenceList.replaceChildren();
  const records = evidenceOf(entity.id);
  if (records.length) {
    records.forEach(r => {
      evidenceList.append(evidenceRecordBlock(r));
      (r.source_ids || []).forEach(id => sourceIds.add(id));
    });
  } else {
    evidenceList.append(el('li', 'No evidence records declared.', 'body'));
  }

  const verificationList = $('verification-list'); verificationList.replaceChildren();
  [...sourceIds].forEach(id => verificationList.append(verificationEntry(id)));

  currentIndex = entities.findIndex(e => e.id === entity.id);
  $('case-position').textContent = `${currentIndex + 1} of ${entities.length}`;
  $('prev-case').disabled = currentIndex <= 0;
  $('next-case').disabled = currentIndex >= entities.length - 1;

  document.title = `${entity.label} — ${pageTitle}`;
}

/* ---- screen transitions — see docs/v0.3/MOTION_CONTRACT.md #1/#2/#4 ----
   Uses a tracked timeout rather than `transitionend`: if a screen is
   re-triggered (e.g. Escape pressed immediately after opening, faster than
   the 320ms opening transition) a `transitionend` listener from the
   in-flight transition can fire late and re-hide the element that was just
   shown. Cancelling any pending cleanup for both elements up front makes
   rapid re-triggering safe regardless of timing. */
const TRANSITION_MS = 320;
const pendingHide = new WeakMap();

function crossFade(hideEl, showEl, after) {
  [hideEl, showEl].forEach(element => {
    const pending = pendingHide.get(element);
    if (pending) { clearTimeout(pending); pendingHide.delete(element); }
    element.classList.remove('entering', 'leaving');
  });

  showEl.hidden = false;
  if (reducedMotion()) {
    hideEl.hidden = true;
    after && after();
    return;
  }
  showEl.classList.add('entering');
  hideEl.classList.add('leaving');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    showEl.classList.remove('entering');
  }));
  const timer = setTimeout(() => {
    hideEl.hidden = true;
    hideEl.classList.remove('leaving');
    pendingHide.delete(hideEl);
  }, TRANSITION_MS);
  pendingHide.set(hideEl, timer);
  after && after();
}

function openCase(id) {
  const entity = entities.find(e => e.id === id);
  renderCase(entity);
  crossFade($('overview'), $('case'));
  $('back').focus();
  announce(`${entity.label} selected. ${entity.kind === 'case' ? 'Core case' : 'Supporting instrument'}.`);
}

function closeCase() {
  crossFade($('case'), $('overview'));
  const row = [...$('overview-list').children].find(r => r.textContent.includes($('case-heading').textContent));
  (row || $('overview-list').firstElementChild)?.focus();
  document.title = pageTitle;
  announce('Returned to overview.');
}

function stepCase(delta) {
  const next = entities[currentIndex + delta];
  if (!next) return;
  renderCase(next);
  if (!reducedMotion()) {
    $('case').style.transition = 'opacity 240ms var(--ease)';
    $('case').style.opacity = '0';
    requestAnimationFrame(() => requestAnimationFrame(() => { $('case').style.opacity = '1'; }));
  }
  announce(`${next.label} selected.`);
}

/* ---- boot ---- */
async function start() {
  try {
    const response = await fetch('../../data/atlas.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    atlas = await response.json();
    kinds = new Map(atlas.meta.input_kinds.map(k => [k.id, k]));
    sourcesById = new Map(atlas.sources.map(s => [s.id, s]));
    entities = atlas.entities; // dataset order: 3 cases, then FieldOS — no re-sorting (SPEC_PROPOSAL.md §5)

    document.querySelector('h1').textContent = atlas.meta.title;
    $('subtitle').textContent = atlas.meta.subtitle;
    $('notice').textContent = atlas.meta.notice;
    /* "dataset schema", not "v0.2.1" or a release tag — data/atlas.json's
       schema_version (0.2.0) has not changed since v0.2.0 shipped, and
       still reads 0.2.0 in the deployed v0.2.1 release too (v0.2.1 was
       accessibility polish, not a schema change). Rendering this bare as
       "v0.2.0" reads as a release-version claim and visually contradicts
       both the "v0.3 prototype" banner above and the actual v0.2.1
       deployed release. Naming it explicitly as the dataset schema removes
       that ambiguity without altering the dataset. */
    $('dataset-counts').textContent = `Dataset schema v${atlas.schema_version} · reviewed ${atlas.meta.reviewed_at} · ${atlas.entities.length} entities · ${atlas.evidence_records.length} evidence records · ${atlas.outcomes.length} outcomes`;

    renderOverview();

    $('back').addEventListener('click', closeCase);
    $('prev-case').addEventListener('click', () => stepCase(-1));
    $('next-case').addEventListener('click', () => stepCase(1));
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      const openDetails = document.querySelector('#case details[open]');
      if (openDetails) {
        openDetails.open = false;
        openDetails.querySelector('summary')?.focus();
      } else if (!$('case').hidden) {
        closeCase();
      }
    });
  } catch (error) {
    $('overview').hidden = true;
    $('error').hidden = false;
    $('error').replaceChildren(
      el('h2', 'Serve this directory locally'),
      el('p', 'This prototype reads ../../data/atlas.json at runtime and must be served from the repository root — file:// blocks fetch.'),
      el('p', 'python -m http.server 8000'),
      el('p', 'Then open http://localhost:8000/prototype/v0.3-experience/')
    );
  }
}
start();
