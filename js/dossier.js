// Dossier: the citable unit (SPEC §7, DESIGN_CONTRACT §2.7 and §7). Section
// order is fixed per class; empty optional sections are omitted and the
// remaining numbers stay consecutive. Every claim carries inline "[n]"
// citations numbered in first-cited reading order.

import { h, ext, pin, label, section, kindMark, kindRule, CLASS_LABEL, PUB_TYPE, EDITORIAL, REPRO, SOURCE_KIND, licenseValue } from './dom.js';
import { citations, coordLine } from './data.js';
import { plateThumb, attributionLine, ccUri } from './plates.js';
import { relationsOf } from './graph.js';

function citeLinks(nums) {
  if (!nums.length) return null;
  return h('span.cite', ' ', nums.map((n, i) => [i ? ' ' : '', h('a', { href: `#src-${n}`, 'aria-label': `Source ${n}` }, `[${n}]`)]));
}

export function verdict(text) {
  return h('span.verdict', text);
}

// ---- shared records (also used by the Outputs and Evidence views)

export function outputRecord(db, o, cite) {
  const src = db.S.get(o.source_id);
  const idf = o.identifier;
  const idCell = idf.availability === 'pid'
    ? [ext(o.url || `https://doi.org/${idf.value}`, `${idf.scheme.toUpperCase()} ${idf.value}`), idf.scope ? h('span.ink-3', ` · ${idf.scope} ${idf.scheme.toUpperCase()}`) : null]
    : ['No persistent identifier', o.url ? [' · ', ext(o.url, 'release page')] : null];
  return h('article.out',
    h('p.body-s.out__cite', o.citation),
    h('dl.kv',
      h('dt', 'Type'), h('dd', PUB_TYPE[o.publication_type]),
      h('dt', 'Review'), h('dd', EDITORIAL[o.editorial_status]),
      h('dt', 'ID'), h('dd', idCell),
      o.license ? [h('dt', 'Licence'), h('dd', o.license)] : null,
      h('dt', 'Verified'), h('dd', cite ? ['by ', src.label, citeLinks(cite([o.source_id]))] : ['via ', ext(src.url, src.label), h('span.micro', ' @ ', pin(src.pinned_ref))])),
    o.note ? h('p.body-s.ink-2.out__note', o.note) : null);
}

export function evidenceRecord(db, e, cite, { kindLine = true, hl = 'h3' } = {}) {
  const k = db.kinds.get(e.input_kind);
  const sub = db.subst.get(e.substantiation);
  const p = e.provenance;
  const prov = p
    ? [p.publisher, p.dataset_ref, p.license, p.retrieved_at && `retrieval ${p.retrieved_at}`, p.checksum && `checksum ${p.checksum}`].filter(Boolean).join(' · ')
    : 'Not given by the source.';
  return h('article.ev', { 'data-kind': k.id },
    kindRule(k),
    kindLine ? h('p.ev__kind', kindMark(k), h('span.sep', { 'aria-hidden': 'true' }, '·'), h('span.sub', sub.label)) : null,
    h(`${hl}.ev__label`, e.label),
    h('p.body.ev__statement', e.statement, cite ? citeLinks(cite(e.source_ids)) : null),
    h('p.body-s.ev__lim', h('b', 'Limitation'), ' ', e.limitation),
    h('p.body-s.ev__prov', h('b', 'Provenance'), ' ', h('span.ink-2', prov)),
    h('details', h('summary', 'Verbatim basis'), h('blockquote.body-s', e.basis)));
}

function figureBlock(db, r, f, cite) {
  return h('figure.fig',
    h('span.label.fig__label', `Figure ${r.code}·${f.number}`),
    h('div.fig__mat', h('img', { src: f.file, width: f.width, height: f.height, alt: f.alt, loading: 'lazy', decoding: 'async' })),
    h('figcaption',
      h('p.body-s.fig__caption', f.caption),
      h('p.micro.fig__credit', f.credit),
      h('p.micro.fig__credit', 'Source', citeLinks(cite([f.source_id])), ' @ ', pin(f.pinned_ref), ' · Licence ', f.license, ccUri(f.license), ' · © ', f.rights_holder, ' · ',
        h('a.fullsize', { href: f.file }, 'Open full size'))));
}

function territoryBlock(db, r, cite) {
  if (!(r.territory_ids || []).length) return h('p.body-s', r.territory_note || 'No case-specific territory.');
  return r.territory_ids.map((tid) => {
    const t = db.T.get(tid);
    const plate = db.plateOf(tid);
    return h('div.terr',
      plate ? h('div.terr__plate', plateThumb(db, plate, 'thumb-wide')) : null,
      h('p.terr__name', plate ? h('a', { href: `#/atlas/${tid}` }, `Plate ${plate.n} · ${t.label}`) : t.label),
      h('p.body-s', t.basis, citeLinks(cite(t.source_ids))),
      plate ? h('p.micro', attributionLine(plate.geometry), ' · not for measurement') : null,
      t.territory_note ? h('p.body-s.ink-2', t.territory_note) : null);
  });
}

function licences(r, cite) {
  return h('dl.kv', ['code', 'data', 'text'].map((part) => {
    const l = r.license[part];
    return [h('dt', part === 'code' ? 'Code' : part === 'data' ? 'Data' : 'Text'),
      h('dd', licenseValue(l.value), l.note ? h('span.ink-2', ` — ${l.note}`) : null, citeLinks(cite([l.source_id])))];
  }));
}

function reproducibility(r, cite) {
  const rp = r.reproducibility;
  return h('dl.kv', h('dt', 'Level'), h('dd', REPRO[rp.level], rp.note ? h('span.ink-2', ` — ${rp.note}`) : null,
    rp.instructions_source_id ? [' Instructions', citeLinks(cite([rp.instructions_source_id]))] : null));
}

function methodology(m, cite) {
  const items = Array.isArray(m.summary) ? m.summary : [m.summary];
  return [h('ol.steps.body', items.map((t) => h('li', t))), h('p.body-s.ink-2.method-src', 'Paraphrased from the source; not an evaluation of the method.', citeLinks(cite(m.source_ids)))];
}

// Documented relations of this item (SPEC.md §13.6): each links to the
// relation in the Knowledge Graph, where its sources, versions and limits are
// shown. Absence is stated, never filled in.
function relationsBlock(db, r) {
  const R = relationsOf(db, r.id);
  const graph = (q) => `#/graph?view=focus&focus=${encodeURIComponent(r.id)}${q}`;
  return [
    R.rels.length
      ? h('ul.relations', R.rels.map((e) => h('li',
        h('span.label.class-line', R.cls(e)),
        h('a', { href: graph(`&edge=${encodeURIComponent(e.id)}`) }, R.label(e)))))
      : h('p.body-s', 'No documented relation in the reviewed sources. This does not prove that none exists.'),
    R.non.length ? [h('h3.sub-head.label', 'Documented non-relations'), h('ul.limits.body-s', R.non.map((x) => h('li', x.statement, h('span.ink-2', ` ${x.interpretation}`))))] : null,
    h('p.body-s.ink-2', 'A relation records documented provenance, not agreement or validation. Its sources, versions and limits, and its verification state (AI-assisted source check; human verification pending), are shown in the Knowledge Graph.'),
    h('p.ui', h('a.textlink', { href: graph(`&node=${encodeURIComponent(r.id)}`) }, 'Open this item in the Knowledge Graph')),
  ];
}

// ---- the dossier

export function dossierView(db, rid, { notice }) {
  const r = db.R.get(rid);
  if (!r) return null;
  const { evidence, findings, outcome, outputs, figures } = db.of(rid);
  const c = citations(db);
  const cite = c.cite;
  const cls = r.class;
  const pos = db.order.indexOf(r);
  const prev = db.order[pos - 1], next = db.order[pos + 1];
  const coord = coordLine(db, r);
  const secs = [];
  const add = (name, ...content) => secs.push([name, content]);

  const outputsBlock = () => outputs.length ? outputs.map((o) => outputRecord(db, o, cite))
    : h('p.body-s', cls === 'instrument' ? 'No release or persistent identifier is documented.' : 'No output of its own is documented: no publication, dataset or persistent identifier.');
  const evidenceBlock = () => h('div.evidence-list', evidence.map((e) => evidenceRecord(db, e, cite)));

  if (cls === 'documented_research' || cls === 'experiment') {
    add('Question', h('p.question', r.research_question, citeLinks(cite(r.source_ids))), r.research_question_note ? h('p.body-s.note', r.research_question_note) : null);
    add('Territory', territoryBlock(db, r, cite));
    add('Result', verdict(outcome.verdict_label), h('p.body.result', outcome.statement, citeLinks(cite(outcome.source_ids))),
      h('p.micro.result-meta', `Outcome type: ${db.outcomeTypes.get(outcome.outcome_type).label} · documented ${outcome.decided_at} · reviewed ${outcome.reviewed_at}`));
    add('Claim ceiling', h('div.ceiling.body', outcome.claim_ceiling, citeLinks(cite(outcome.source_ids))));
    add('Methodology', methodology(r.methodology, cite));
    if (findings.length) add('Findings', findings.map((f) => h('div.finding', h('p.body', f.statement, citeLinks(cite(f.source_ids))),
      f.uncertainty ? h('p.body-s.uncertainty', h('b', 'Uncertainty'), ' — ', f.uncertainty) : null)));
    if (figures.length) add('Figures', figures.map((f) => figureBlock(db, r, f, cite)));
    add('Evidence', evidenceBlock());
    if (outcome.limitations?.length) add('Limitations', h('ul.limits.body', outcome.limitations.map((l) => h('li', l))), h('p.body-s.ink-2', 'As stated for the result', citeLinks(cite(outcome.source_ids))));
    add('Outputs', outputsBlock());
    add('Documented relations', relationsBlock(db, r));
    add('Reproducibility and licences', reproducibility(r, cite), licences(r, cite));
  } else if (cls === 'instrument') {
    add('Role', h('p.body', r.summary, citeLinks(cite(r.source_ids))));
    add('Documented functional result', verdict(outcome.verdict_label), h('p.body.result', outcome.statement, citeLinks(cite(outcome.source_ids))),
      h('p.micro.result-meta', `Outcome type: ${db.outcomeTypes.get(outcome.outcome_type).label} · documented ${outcome.decided_at}`),
      h('h3.sub-head.label', 'Claim ceiling'), h('div.ceiling.body', outcome.claim_ceiling, citeLinks(cite(outcome.source_ids))));
    if (r.methodology) add('Methodology', methodology(r.methodology, cite));
    add('Evidence', evidenceBlock());
    if (outcome.limitations?.length) add('Limitations', h('ul.limits.body', outcome.limitations.map((l) => h('li', l))));
    add('Outputs', outputsBlock());
    add('Documented relations', relationsBlock(db, r));
    add('Reproducibility and licences', reproducibility(r, cite), licences(r, cite));
  } else {
    add('Role', h('p.body', r.summary, citeLinks(cite(r.source_ids))));
    add('Territory', territoryBlock(db, r, cite));
    add('What the platform documents', h('p.body', r.documents, citeLinks(cite(r.source_ids))));
    add('Claim and interpretation limits', h('div.ceiling.body', r.claim_limits, citeLinks(cite(r.source_ids))));
    const hosted = [...new Set([...(r.hosts || []), ...relationsOf(db, r.id).rels.filter((e) => e.predicate === 'hosts' && e.source === r.id).map((e) => e.target)])];
    if (hosted.length) add('Items in this Atlas that the platform hosts', h('ul.hosted', hosted.map((id) => h('li', h('a.textlink', { href: `#/research/${id}` }, db.R.get(id).title)))),
      r.hosts_note ? h('p.body-s.ink-2', r.hosts_note) : null, h('p.body-s.ink-2', 'Hosting is co-location of files, not integration: it does not mean that the platform reads or displays the hosted item.'));
    add('Documented relations', relationsBlock(db, r));
    add('Licences', licences(r, cite));
  }

  const reading = secs.map(([name, content], i) => section(i + 1, name, ...content));
  const n0 = secs.length;
  const sources = c.list();
  const dossierUrl = `${location.href.split('#')[0]}#/research/${r.id}`;
  const rail = h('aside.rail', { 'aria-label': 'Verification and citation' },
    section(n0 + 1, 'Verification',
      h('ol.sources', sources.map((src, i) => h('li.src', { id: `src-${i + 1}`, tabindex: '-1' },
        h('span.src__n', String(i + 1)),
        h('span.src__label', ext(src.url, src.label)),
        h('span.src__meta.micro', `${SOURCE_KIND[src.kind]} · `, pin(src.pinned_ref), ` · accessed ${src.accessed_at} · ${src.access}`)))),
      r.verification_note ? h('p.body-s.ink-2.verif-note', r.verification_note) : null,
      h('p.body-s.ink-2.verif-note', 'Mechanical validation checks only that each claim cites a declared public source. Human verification of scientific support (SPEC.md §12.10) is pending; nothing here is presented as human-verified.')),
    section(n0 + 2, 'How to cite', h('p.cite-block', `${db.meta.citation}. Dossier: ${r.title}. ${dossierUrl}`)));

  const head = h('header.dossier-head',
    h('nav.breadcrumb', { 'aria-label': 'Breadcrumb' }, h('a', { href: '#/research' }, 'Research'), ' / ', h('span', { 'aria-current': 'page' }, r.short_title)),
    h('p.class-meta', label(CLASS_LABEL[cls], '.class-line'), h('span.label.class-line', ` · ${r.lifecycle_status}`),
      h('span.micro', ` · ${r.version.label} · reviewed ${r.reviewed_at}`)),
    h('h1.title', { tabindex: '-1' }, r.title),
    coord ? h('p.micro.coord', coord) : cls === 'instrument' ? h('p.body-s.coord', 'No case-specific territory.') : null,
    outcome ? verdict(outcome.verdict_label) : h('p.body-s.ink-2.no-verdict', 'Research platform: it has no verdict and no outcome of its own.'),
    h('div.dossier-tools',
      h('span.micro.pos', `${pos + 1} of ${db.order.length}`),
      prev ? h('a.btn', { href: `#/research/${prev.id}`, 'aria-label': `Previous: ${prev.short_title}, ${pos} of ${db.order.length}` }, '‹ Previous') : null,
      next ? h('a.btn', { href: `#/research/${next.id}`, 'aria-label': `Next: ${next.short_title}, ${pos + 2} of ${db.order.length}` }, 'Next ›') : null,
      h('button.btn', { type: 'button', on: { click: () => window.print() } }, 'Print dossier')));

  return {
    title: r.title,
    nodes: [
      h('p.print-head.micro', db.meta.citation, ' · Printed ', h('span.print-date')),
      head,
      h('div.dossier',
        h('div.reading', reading, h('p.body-s.notice.notice--line', db.meta.notice)),
        rail),
      h('nav.pager', { 'aria-label': 'Previous and next dossier' },
        prev ? h('a.btn', { href: `#/research/${prev.id}` }, `‹ ${pos} of ${db.order.length} · ${prev.short_title}`) : h('span'),
        next ? h('a.btn', { href: `#/research/${next.id}` }, `${next.short_title} · ${pos + 2} of ${db.order.length} ›`) : h('span')),
    ],
  };
}
