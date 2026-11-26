// Overview, Research index, Outputs, Timeline, About and the global states
// (SPEC §5, DESIGN_CONTRACT §2.5–§2.11, §6.12).

import { h, ext, label, section, kindMark, CLASS_LABEL, CLASS_BAND, PUB_TYPE, EDITORIAL } from './dom.js';
import { coordLine, outputSummary, timelineEvents } from './data.js';
import { plateThumb } from './plates.js';
import { verdict, outputRecord } from './dossier.js';

const OUTCOME_DEF = {
  bounded_finding: 'A result stated within explicit bounds. Not stronger than any other type.',
  abstain: 'The source declines to decide because the evidence does not separate the options.',
  insufficient_evidence: 'The source finds the evidence insufficient for the decision asked.',
  conditional: 'The source’s verdict holds only under stated conditions (for example MODIFY).',
  hold: 'The source suspends a comparison or decision until stated inputs exist.',
  mixed: 'The source reports results that point in different directions.',
  no_go: 'The source concludes against proceeding.',
  functional_test: 'A documented test of whether an instrument works as intended; not a research result.',
};

function territoryText(db, r) {
  if (!(r.territory_ids || []).length) return r.territory_note || 'No case-specific territory';
  return r.territory_ids.map((t) => db.T.get(t).label).join(' · ');
}

function itemRow(db, r) {
  const { outcome } = db.of(r.id);
  const plate = (r.territory_ids || []).map((t) => db.plateOf(t)).find(Boolean);
  const coord = coordLine(db, r);
  return h(`li.item${plate ? '' : '.item--noplate'}`,
    plate ? plateThumb(db, plate) : null,
    h('div.item__body',
      h('h3.item__title', h('a', { href: `#/research/${r.id}` }, r.short_title)),
      h('p.label.class-line', CLASS_LABEL[r.class]),
      h('p.ui.ink-2.item__terr', territoryText(db, r)),
      coord ? h('p.micro', coord) : null,
      h('p.body-s.item__summary', r.summary)),
    h('div.item__aside', outcome ? verdict(outcome.verdict_label) : h('span.ui.ink-3', 'No verdict (platform)')));
}

export function overviewView(db, { notice }) {
  const m = db.meta;
  const [docs, ...rest] = db.bands;
  return {
    title: 'Overview',
    nodes: [
      h('div.hero',
        h('div.hero__text',
          label('Spatial Intelligence Atlas · Research Explorer'),
          h('h1.display', { tabindex: '-1' }, 'Evidence-first geospatial research, documented separately.'),
          h('p.body.lede', `${db.research.length} research items, each shown with what was asked, where it is situated, how it was done, what evidence is documented, what result was reached — including abstention and insufficient evidence — and where to verify it. A Knowledge Graph shows only the relations between them that a pinned source documents.`)),
        h('div.hero__plates',
          h('ul.plate-strip', { 'aria-label': 'Plates' }, db.plates.map((p) => h('li', plateThumb(db, p, 'strip-thumb'),
            h('span.micro', `Plate ${p.n} · ${p.territory.label.replace(/^Madrid — /, '')}`)))),
          h('p.micro.strip-credit', 'Plate geometry: ', [...new Set(db.plates.map((p) => p.geometry.attribution))].join(' · '), ' · licences on each plate · not for measurement'))),
      h('div.intro-cols',
        h('section', h('h2', 'What this is'), h('p.body-s', 'A static explorer of a fixed, hand-authored, source-pinned dataset. It renders documented results; it performs no analysis, prediction or ranking.')),
        h('section', h('h2', 'How to read a dossier'), h('p.body-s', 'Question, territory, result and claim ceiling come first; then method, findings, figures, evidence and limitations. Every claim cites a numbered, pinned public source.')),
        h('section', h('h2', 'What it does not claim'), h('p.body-s', 'Real input does not establish validation, causality or decision sufficiency. Order is dataset order, not merit. Human verification of the frozen content is still pending.'))),
      h('div.ov-notice', notice()),
      h('section.items', { 'aria-labelledby': 'band-docs' },
        h('h2.band-label.label', { id: 'band-docs' }, CLASS_BAND[docs.cls]),
        h('ul', docs.items.map((r) => itemRow(db, r)))),
      h('div.bands', rest.map((b) => h('section.band', { 'aria-labelledby': `band-${b.cls}` },
        h('h2.band-label.label', { id: `band-${b.cls}` }, CLASS_BAND[b.cls]),
        h('ul', b.items.map((r) => h('li.band-item',
          h('h3.item__title', h('a', { href: `#/research/${r.id}` }, r.short_title)),
          h('p.label.class-line', CLASS_LABEL[r.class]),
          h('p.ui.ink-2', territoryText(db, r)),
          h('p.body-s.item__summary', r.summary),
          db.of(r.id).outcome ? h('p.band-verdict', verdict(db.of(r.id).outcome.verdict_label)) : null)))))),
    ],
  };
}

export function researchView(db, { head, notice }) {
  return [
    head('Research', 'Which items exist?', `${db.research.length} items, grouped by class and listed in dataset order. Not ranked.`),
    notice(),
    db.bands.map((b) => h('section.index-band', { 'aria-labelledby': `ix-${b.cls}` },
      h('h2.band-label.label', { id: `ix-${b.cls}` }, CLASS_BAND[b.cls]),
      h('table.table.index-table',
        h('thead', h('tr', ['Title', 'Class', 'Territory', 'Result', 'Outputs'].map((t) => h('th', { scope: 'col' }, t)))),
        h('tbody', b.items.map((r) => {
          const { outcome, outputs } = db.of(r.id);
          return h('tr',
            h('td', h('a', { href: `#/research/${r.id}` }, r.short_title)),
            h('td', { 'data-label': 'Class' }, h('span.label.class-line', CLASS_LABEL[r.class])),
            h('td', { 'data-label': 'Territory' }, territoryText(db, r)),
            h('td', { 'data-label': 'Result' }, outcome ? verdict(outcome.verdict_label) : 'No verdict (platform)'),
            h('td', { 'data-label': 'Outputs' }, outputs.length ? h('ul', outputs.map((o) => h('li', outputSummary(o, PUB_TYPE)))) : 'None documented'));
        }))))),
  ];
}

export function outputsView(db, { head }) {
  const owners = db.order.filter((r) => (r.output_ids || []).length);
  return [
    head('Publications & Datasets', 'What can be cited?', 'Every output belongs to exactly one item. Publication type, editorial status and identifier availability are three separate facts; citability is not the same as persistent identification.'),
    owners.map((r) => h('section.out-group', { 'aria-labelledby': `og-${r.id}` },
      h('h2.out-group__title.heading', { id: `og-${r.id}` }, h('a', { href: `#/research/${r.id}` }, r.title)),
      h('p.label.class-line', CLASS_LABEL[r.class]),
      db.of(r.id).outputs.map((o) => outputRecord(db, o, null)))),
  ];
}

export function timelineView(db, { head }) {
  return [
    head('Timeline', 'When was each result documented?', 'Dated events taken from the sources — result dates and output dates — newest first. A date is not a measure of importance, and nothing here connects one item to another.'),
    h('ol.timeline', timelineEvents(db).map((e) => h('li',
      h('time.micro', { datetime: e.date }, e.date),
      h('div.tl-event',
        h('p.label.class-line', e.kind),
        e.verdict ? h('p', verdict(e.text)) : h('p.body-s', e.text),
        h('p.ui', h('a', { href: `#/research/${e.r.id}` }, e.r.short_title)))))),
  ];
}

export function aboutView(db, { head }) {
  const m = db.meta;
  const vocab = (rows) => h('ul.vocab', rows.map(([term, def]) => h('li', h('span.vocab__term', term), h('span.body-s', def))));
  return [
    head('About', 'How should the Atlas be read and cited?', m.verification),
    h('div.about.reading',
      section(1, 'What the Atlas is', h('p.body.prose', 'A static, client-side research explorer for a deliberately selected set of geospatial and tourism research items. It renders one fixed, hand-authored, source-pinned dataset. It performs no live analysis, prediction, ranking, repository integration or scientific validation. Items are included by class and because every public claim rests on a public source of its own.')),
      section(2, 'How to read a dossier', h('p.body.prose', 'A dossier opens with the question, the territory, the documented result and its claim ceiling, so the result and what may not be claimed from it come before itemised evidence. Methodology, findings (with uncertainty where the source states it), figures, evidence, limitations, outputs, reproducibility and licences follow. The verification list numbers every cited source in the order it is first cited; each "[n]" in the text points to it.')),
      section(3, 'Vocabularies',
        h('h3.sub-head.label', 'Evidence input kind — the nature of a record'),
        vocab(m.input_kinds.map((k) => [kindMark(k), k.definition])),
        h('h3.sub-head.label', 'Substantiation — how well the documentation supports it'),
        vocab(m.substantiation.map((x) => [x.label, x.definition])),
        h('h3.sub-head.label', 'Outcome type — categorical, not ordinal'),
        vocab(m.outcome_types.map((x) => [x.label, OUTCOME_DEF[x.id]])),
        h('p.body-s.ink-2', 'The category never replaces the source’s verbatim verdict label, which is what every result shows.'),
        h('h3.sub-head.label', 'Class — a category, not a rank'),
        vocab([['Documented research', 'A bounded study with a question, method, evidence and one documented outcome.'],
          ['Experiment', 'A bounded exploratory test or pilot with a question, method, evidence and one documented outcome.'],
          ['Research platform', 'A system that hosts or documents research; it has no question and no outcome of its own.'],
          ['Instrument', 'A supporting tool with a documented functional result.']]),
        h('h3.sub-head.label', 'Outputs — three independent facts'),
        vocab([['Publication type', `What the output is: ${Object.values(PUB_TYPE).join(', ').toLowerCase()}.`],
          ['Editorial status', `How it was reviewed: ${Object.values(EDITORIAL).join(', ').toLowerCase()}.`],
          ['Identifier', 'Whether it has a persistent identifier (for example a DOI). "No persistent identifier" is stated in full; a reference without one is valid when a declared source verifies it.']])),
      section(4, 'Non-integration and documented relations', h('p.body.prose', m.notice, ' The items are separate by default. From v0.4, the Knowledge Graph shows a relation only where a pinned public source documents it, with its direction, meaning, limits and verification state. Hosting is co-location of files, not integration; a shared dataset family does not make observations comparable; and a connection says nothing about scientific agreement or validity. Hypothetical and analyst-defined associations are excluded. Layout, order and the timeline never imply flow between items.')),
      section(5, 'How to cite', h('p.cite-block', m.citation), h('p.body-s.ink-2', 'A dossier citation appends the dossier title and its address. The plain citation remains valid if a DOI is added at a later gate.')),
      section(6, 'Licences', h('p.body.prose', m.license), h('p.body-s.ink-2', 'Third-party material keeps its own licence, shown next to it: figure credit lines, plate caption blocks (CC BY 4.0, OAPN reuse terms) and each item’s code, data and text licences in its dossier.')),
      section(7, 'Governance and gates', h('ul.limits.body',
        h('li', 'Gate 0 — audit and direction: approved (PR #15).'),
        h('li', 'Gate 1 — specification and design: approved (PR #17).'),
        h('li', 'Gate 2 — scientific content freeze: merged (PR #18). Per-claim human verification of scientific support (SPEC.md §12.10) is pending.'),
        h('li', 'Gate 3 — implementation: merged (PR #19).'),
        h('li', 'Gate 4 — verification and release: merged (PR #20); v0.3.0 dated 2026-11-26. Licence approved (MIT for code, CC BY 4.0 for original data and text, third-party material excluded). No DOI has been minted; it is deferred.'),
        h('li', 'v0.4 — Knowledge Graph: proposal and prototype (PR #22, not merged); maintainer decisions E1–E5 recorded 2026-11-26; specification, content freeze (SPEC.md §13) and implementation in one gated pull request. Human verification of the four new items and of every relation (K2) is pending, as is v0.3 acceptance criterion A2.')),
        h('p.body-s.ink-2', 'The HATI route geometry is not drawn: its publication awaits the maintainer approval A-Q1 (SPEC.md §12.10). ',
          ext(m.repository, 'Repository'))),
      section(8, 'Version history', h('ol.timeline', m.versions.map((v) => h('li', h('span.micro', v.tag), h('p.body-s', v.date ? `${v.date} — ` : 'Unreleased — ', v.note)))))),
  ];
}

export function notFoundView() {
  return {
    title: 'Not found',
    nodes: [h('div.view-head', h('h1.title', { tabindex: '-1' }, 'No view or dossier exists at this address'),
      h('p.body.lede', h('a', { href: '#/' }, 'Go to the Overview')))],
  };
}

export function errorView(err) {
  return {
    title: 'Data error',
    nodes: [h('div.view-head', h('h1.title', { tabindex: '-1' }, 'The Atlas data could not be loaded'),
      h('p.body.lede', 'The page reads data/atlas.json and data/geometry/*.json from the same folder. Serve the repository folder with a local static server and reload:'),
      h('pre.micro.cmd', 'python -m http.server 8000'),
      h('p.body-s.ink-2', `Detail: ${err.message}`))],
  };
}
