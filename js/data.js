// Loads the single same-origin dataset and the declared geometry files, and
// indexes them. Order is always dataset order (SPEC I9): nothing here ranks
// or scores items, evidence or outcomes.

const DATA_URL = 'data/atlas.json';

export async function loadAtlas() {
  const res = await fetch(DATA_URL, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`${DATA_URL}: HTTP ${res.status}`);
  const atlas = await res.json();
  const geo = await Promise.all(atlas.geometries.map(async (g) => {
    const r = await fetch(g.file, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`${g.file}: HTTP ${r.status}`);
    return [g.id, await r.json()];
  }));
  return index(atlas, new Map(geo));
}

function byId(list) {
  return new Map(list.map((x) => [x.id, x]));
}

function children(list, rid) {
  return list.filter((x) => x.research_id === rid);
}

// Class bands in the order of SPEC §5 (documented research → platforms →
// instruments); within a band, dataset order.
const BANDS = ['documented_research', 'experiment', 'research_platform', 'instrument'];

function index(a, features) {
  const db = {
    meta: a.meta,
    schema: a.schema_version,
    research: a.research,
    territories: a.territories,
    geometries: a.geometries,
    evidence: a.evidence,
    outputs: a.outputs,
    figures: a.figures,
    sources: a.sources,
    features,
    R: byId(a.research),
    T: byId(a.territories),
    G: byId(a.geometries),
    S: byId(a.sources),
    O: byId(a.outputs),
    F: byId(a.figures),
    kinds: byId(a.meta.input_kinds),
    subst: byId(a.meta.substantiation),
    outcomeTypes: byId(a.meta.outcome_types),
  };
  db.bands = BANDS.map((c) => ({ cls: c, items: a.research.filter((r) => r.class === c) })).filter((b) => b.items.length);
  db.order = db.bands.flatMap((b) => b.items); // research-index order, used by previous/next
  db.of = (rid) => ({
    evidence: children(a.evidence, rid),
    findings: children(a.findings, rid),
    outcome: children(a.outcomes, rid)[0] || null,
    outputs: (db.R.get(rid).output_ids || []).map((id) => db.O.get(id)),
    figures: (db.R.get(rid).figure_ids || []).map((id) => db.F.get(id)),
  });
  // Plates: territories with a declared geometry, in dataset order.
  db.plates = a.territories.filter((t) => t.geometry_id).map((t, i) => ({ n: i + 1, territory: t, geometry: db.G.get(t.geometry_id) }));
  db.plateOf = (tid) => db.plates.find((p) => p.territory.id === tid) || null;
  db.itemsIn = (tid) => db.order.filter((r) => (r.territory_ids || []).includes(tid));
  return db;
}

// Coordinate line (DESIGN_CONTRACT §8.4): from offline display metadata only.
export function coordLine(db, r) {
  const tids = r.territory_ids || [];
  const first = tids.map((t) => db.plateOf(t)).find(Boolean);
  if (!first) return null;
  const [lat, lon] = first.geometry.display.centroid_wgs84;
  const more = tids.length > 1 ? ` +${tids.length - 1}` : '';
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'} · ${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'} · ${first.geometry.display.crs}${more}`;
}

// Output summary for the research index ("Preprint · DOI", "No persistent identifier").
export function outputSummary(o, PUB_TYPE) {
  const id = o.identifier.availability === 'pid' ? o.identifier.scheme.toUpperCase() : 'No persistent identifier';
  return `${PUB_TYPE[o.publication_type]} · ${id}`;
}

// Timeline events (SPEC §5): outcome dates and output dates from the dataset.
// The view is defined as "newest first", so events are ordered by their date;
// events that share a date keep dataset order (DESIGN_CONTRACT §6.11).
export function timelineEvents(db) {
  const ev = [];
  for (const r of db.research) {
    const { outcome, outputs } = db.of(r.id);
    if (outcome && outcome.decided_at) {
      ev.push({ date: outcome.decided_at, kind: 'Result documented', text: outcome.verdict_label, r, verdict: true });
    }
    for (const o of outputs) if (o.date) ev.push({ date: o.date, kind: `${outputKindLabel(o)} published`, text: o.citation, r });
  }
  return ev.map((e, i) => ({ ...e, i })).sort((x, y) => (x.date === y.date ? x.i - y.i : x.date < y.date ? 1 : -1));
}

function outputKindLabel(o) {
  return { preprint: 'Preprint', dataset: 'Dataset', software: 'Software release' }[o.publication_type] || 'Output';
}

// Citation registry for one dossier: sources numbered in first-cited reading
// order (SPEC §7.13, DESIGN_CONTRACT §6.7).
export function citations(db) {
  const order = [];
  const num = new Map();
  return {
    cite(ids) {
      return [...new Set((ids || []).filter(Boolean))].map((id) => {
        if (!num.has(id)) { num.set(id, order.length + 1); order.push(db.S.get(id)); }
        return num.get(id);
      });
    },
    list: () => order,
  };
}
