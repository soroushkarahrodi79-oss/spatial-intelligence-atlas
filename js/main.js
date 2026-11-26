// Entry point: loads the dataset, routes hash URLs to views, and applies the
// route-change rules of DESIGN_CONTRACT §5.4. The only state is the route.

import { h, ext } from './dom.js';
import { loadAtlas } from './data.js';
import { overviewView, researchView, outputsView, timelineView, aboutView, notFoundView, errorView } from './views.js';
import { dossierView } from './dossier.js';
import { atlasView, plateView } from './plates.js';
import { explorerView } from './explorer.js';
import { graphView } from './graph.js';

const main = document.getElementById('main');
const live = document.getElementById('live');
const SITE = 'Spatial Intelligence Atlas';
let db = null;
let firstRender = true;
let byLink = false;            // set when a route change comes from a click, not back/forward
const scrollMemory = new Map(); // in-memory only (no persistence)
let entry = 0;

function announce(text) {
  live.textContent = '';
  setTimeout(() => { live.textContent = text; }, 60); // re-set so repeated text is announced
}

function viewHead(title, question, lede) {
  return h('div.view-head',
    h('span.label', question),
    h('h1.title', { tabindex: '-1' }, title),
    lede ? h('p.body.lede', lede) : null);
}

function notice() {
  return h('p.body-s.notice', db.meta.notice);
}

const ctx = () => ({ head: viewHead, notice, announce });

function wrap(title, nodes) {
  return { title, nodes };
}

function resolve(hash) {
  const raw = hash.replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean);
  const q = new URLSearchParams(qs);
  const [a, b] = parts;
  if (!a) return { section: null, view: overviewView(db, ctx()) };
  if (a === 'research' && !b) return { section: 'research', view: wrap('Research', researchView(db, ctx())) };
  if (a === 'research' && b && parts.length === 2) return { section: 'research', view: dossierView(db, b, ctx()) };
  if (a === 'atlas' && !b) return { section: 'atlas', view: wrap('Atlas', atlasView(db, ctx())) };
  if (a === 'atlas' && b && parts.length === 2) return { section: 'atlas', view: plateView(db, b, ctx()) };
  if (a === 'evidence' && !b) return { section: 'evidence', view: wrap('Evidence', explorerView(db, q, ctx())) };
  if (a === 'graph' && !b) return { section: 'graph', view: graphView(db, q, ctx()) };
  if (a === 'outputs' && !b) return { section: 'outputs', view: wrap('Publications & Datasets', outputsView(db, ctx())) };
  if (a === 'timeline' && !b) return { section: 'timeline', view: wrap('Timeline', timelineView(db, ctx())) };
  if (a === 'about' && !b) return { section: 'about', view: wrap('About', aboutView(db, ctx())) };
  return { section: null, view: null };
}

function setNav(section) {
  for (const a of document.querySelectorAll('.primary-nav a')) {
    if (a.dataset.section === section) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  }
}

function render() {
  const { section, view } = resolve(location.hash);
  const v = view || notFoundView();
  setNav(view ? section : null);
  // The Knowledge Graph applies a new query to its mounted view in place, so
  // pan, zoom and keyboard focus survive in-graph links.
  if (v.inPlace && main.contains(v.nodes[0])) {
    document.title = `${v.title} — ${SITE}`;
    return;
  }
  main.replaceChildren(...[v.nodes].flat(Infinity).filter(Boolean));
  document.title = v.title === 'Overview' ? `${SITE} — Research Explorer` : `${v.title} — ${SITE}`;

  // Each history entry gets a key so back/forward can restore its scroll.
  if (!history.state || history.state.k == null) history.replaceState({ k: ++entry }, '');
  const key = history.state.k;
  if (firstRender) {
    firstRender = false;
    return;
  }
  const h1 = main.querySelector('h1');
  if (h1) h1.focus({ preventScroll: true });
  if (byLink) window.scrollTo(0, 0);
  else window.scrollTo(0, scrollMemory.get(key) || 0);
  byLink = false;
  announce(v.title);
}

function footer() {
  const m = db.meta;
  document.getElementById('footer').replaceChildren(
    h('p.micro', `v${m.release} (${m.release_status}) · schema ${db.schema} · reviewed ${m.reviewed_at}`),
    h('p.ui', h('a', { href: '#/about' }, 'How to cite'), ' · ', h('a', { href: '#/about' }, 'Licences'), ' · ', ext(m.repository, 'Repository')),
    h('p.body-s.ink-2', m.license),
    h('p.body-s', m.notice),
    h('p.body-s', m.provenance_statement),
    h('p.body-s.ink-2', 'Human verification of the frozen scientific content (SPEC.md §12.10 and §13.8) and of every relation (K2) is pending.'));
}

// In-page anchors (skip link, "[n]" citations) must not change the route:
// they move focus and scroll to their target instead.
document.addEventListener('click', (ev) => {
  const a = ev.target.closest('a[href^="#"]');
  if (!a || ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  const href = a.getAttribute('href');
  if (href.startsWith('#/')) {
    if (href !== location.hash) { scrollMemory.set(history.state?.k, window.scrollY); byLink = true; }
    return;
  }
  const target = document.getElementById(href.slice(1));
  if (!target) return;
  ev.preventDefault();
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: 'start' });
});

window.addEventListener('hashchange', () => { if (db) render(); });
window.addEventListener('scroll', () => { if (history.state?.k != null) scrollMemory.set(history.state.k, window.scrollY); }, { passive: true });
window.addEventListener('beforeprint', () => {
  for (const el of document.querySelectorAll('.print-date')) el.textContent = new Date().toISOString().slice(0, 10);
  for (const d of document.querySelectorAll('details')) { if (!d.open) { d.open = true; d.dataset.printOpened = '1'; } }
});
window.addEventListener('afterprint', () => {
  for (const d of document.querySelectorAll('details[data-print-opened]')) { d.open = false; delete d.dataset.printOpened; }
});
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const slow = setTimeout(() => { main.replaceChildren(h('p.state-line', 'Loading the Atlas data…')); }, 400);
loadAtlas().then((data) => {
  clearTimeout(slow);
  db = data;
  footer();
  render();
}).catch((err) => {
  clearTimeout(slow);
  const v = errorView(err);
  main.replaceChildren(...v.nodes);
  document.title = `${v.title} — ${SITE}`;
});
