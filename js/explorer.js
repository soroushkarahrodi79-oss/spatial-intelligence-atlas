// Evidence Explorer (SPEC §5, interaction 4; DESIGN_CONTRACT §2.10, §6.9).
// Facets filter but never reorder: rows always keep dataset order. Facet
// state lives in the route query, so a filtered view is linkable.

import { h, label, kindMark, glyph, dashSwatch } from './dom.js';
import { evidenceRecord } from './dossier.js';

const FACETS = [
  { key: 'kind', legend: 'Input kind' },
  { key: 'subst', legend: 'Substantiation' },
  { key: 'item', legend: 'Item' },
  { key: 'territory', legend: 'Territory' },
];

function options(db) {
  const items = db.order.filter((r) => db.evidence.some((e) => e.research_id === r.id));
  const tids = new Set(items.flatMap((r) => r.territory_ids || []));
  return {
    kind: db.meta.input_kinds.map((k) => ({ v: k.id, text: k.label.charAt(0) + k.label.slice(1).toLowerCase(), k })),
    subst: db.meta.substantiation.map((x) => ({ v: x.id, text: x.label.charAt(0) + x.label.slice(1).toLowerCase() })),
    item: items.map((r) => ({ v: r.id, text: r.short_title })),
    territory: db.territories.filter((t) => tids.has(t.id)).map((t) => ({ v: t.id, text: t.label })),
  };
}

function matches(db, e, sel) {
  const r = db.R.get(e.research_id);
  const test = {
    kind: () => sel.kind.includes(e.input_kind),
    subst: () => sel.subst.includes(e.substantiation),
    item: () => sel.item.includes(e.research_id),
    territory: () => (r.territory_ids || []).some((t) => sel.territory.includes(t)),
  };
  // Any checked value within a group matches; groups combine with AND.
  return FACETS.every(({ key }) => !sel[key].length || test[key]());
}

export function explorerView(db, query, { head, notice, announce }) {
  const opts = options(db);
  const valid = (key, v) => opts[key].some((o) => o.v === v);
  const sel = Object.fromEntries(FACETS.map(({ key }) => [key, query.getAll(key).filter((v) => valid(key, v))]));
  const total = db.evidence.length;

  const tbody = h('tbody');
  const count = h('p.ui.count');
  const empty = h('div.empty', { hidden: true }, h('p.body', 'No evidence records match these filters.'),
    h('button.btn', { type: 'button', on: { click: () => clear() } }, 'Clear filters'));
  const summary = h('summary');
  const boxes = [];

  function activeCount() { return FACETS.reduce((n, { key }) => n + sel[key].length, 0); }

  function render(announceCount) {
    const rows = db.evidence.filter((e) => matches(db, e, sel)); // dataset order, never re-sorted
    tbody.replaceChildren(...rows.map((e) => row(e)));
    const text = `Showing ${rows.length} of ${total} records`;
    count.textContent = text;
    empty.hidden = rows.length > 0;
    summary.textContent = `Filters${activeCount() ? ` (${activeCount()} active)` : ''}`;
    clearBtn.hidden = !activeCount();
    if (announceCount) announce(text);
  }

  function writeRoute() {
    const q = new URLSearchParams();
    for (const { key } of FACETS) for (const v of sel[key]) q.append(key, v);
    const qs = q.toString();
    history.replaceState(history.state, '', `#/evidence${qs ? `?${qs}` : ''}`);
  }

  function clear() {
    for (const { key } of FACETS) sel[key] = [];
    for (const b of boxes) b.checked = false;
    writeRoute();
    render(true);
  }

  function row(e) {
    const r = db.R.get(e.research_id);
    const k = db.kinds.get(e.input_kind);
    return h('tr',
      h('td.ev-cell', evidenceRecord(db, e, null, { kindLine: false, hl: 'h2' })),
      h('td', { 'data-label': 'Item' }, h('a', { href: `#/research/${r.id}` }, r.short_title)),
      h('td', { 'data-label': 'Kind / substantiation' }, h('span.kind-cell', kindMark(k)), h('span.label.class-line.sub-line', db.subst.get(e.substantiation).label)));
  }

  const clearBtn = h('button.btn', { type: 'button', on: { click: () => clear() } }, 'Clear filters');

  const groups = FACETS.map(({ key, legend }) => h('fieldset',
    h('legend', legend),
    opts[key].map((o) => {
      const box = h('input', { type: 'checkbox', name: key, value: o.v, checked: sel[key].includes(o.v),
        on: { change: (ev) => {
          const list = sel[key];
          if (ev.target.checked) { if (!list.includes(o.v)) list.push(o.v); } else sel[key] = list.filter((v) => v !== o.v);
          // keep the selection in option order, so the URL is stable
          sel[key] = opts[key].map((x) => x.v).filter((v) => sel[key].includes(v));
          writeRoute();
          render(true);
        } } });
      boxes.push(box);
      return h('label', box, o.k ? [glyph(o.k.id), dashSwatch(o.k.id, o.k.dash)] : null, h('span', o.text));
    })));

  const wide = window.matchMedia('(min-width: 1024px)').matches;
  const filters = h('details.filters-details', { open: wide || null }, summary,
    h('div.filters', h('p.body-s.ink-2.facet-note', 'Within a group, any checked value matches; groups combine. Order never changes.'), groups));

  const table = h('table.table.ev-table',
    h('caption.sr-only', 'Evidence records in dataset order'),
    h('thead', h('tr', h('th', { scope: 'col' }, 'Record'), h('th', { scope: 'col' }, 'Item'), h('th', { scope: 'col' }, 'Kind / substantiation'))),
    tbody);

  render(false);
  return [
    head('Evidence', 'What is documented, and of what kind?', 'Every documented evidence record, in dataset order. Filtering never reorders. Input kind and substantiation are separate axes; neither is a score.'),
    notice(),
    h('div.explorer',
      h('div.explorer__filters', filters),
      h('div.explorer__table', h('div.count-line', count, clearBtn), empty, table)),
  ];
}
