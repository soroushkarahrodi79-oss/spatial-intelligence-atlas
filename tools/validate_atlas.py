#!/usr/bin/env python3
"""Mechanical metadata validator for the Spatial Intelligence Atlas (schema 0.3.0).

Development-only (DESIGN_CONTRACT.md §14.2). Standard library only. The page
never loads this file.

It checks invariants I1–I13 and I15–I18 of SPEC.md §4.11 plus the runtime file
budget. It establishes that the metadata is well-formed and linked. It does
NOT establish that any claim is scientifically supported: that is the recorded
human review of SPEC.md §12.10 (and I14, checked at Gate 2).

Usage:
  python tools/validate_atlas.py            # metadata validation
  python tools/validate_atlas.py --links    # also check every outbound URL
Exit status is non-zero on any error.
"""
import hashlib
import json
import os
import re
import sys
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ERRORS, WARNINGS = [], []

CLASSES = {'documented_research', 'experiment', 'research_platform', 'instrument', 'proposal', 'archived_artifact'}
LIFECYCLE = {'active', 'frozen', 'closed', 'maintenance', 'paused'}
INPUT_KINDS = {'observed', 'acquired', 'derived', 'simulated', 'reported', 'unestablished'}
SUBST = {'source_stated', 'owner_attested', 'not_established'}
OUTCOME_TYPES = {'bounded_finding', 'abstain', 'insufficient_evidence', 'conditional', 'hold', 'mixed', 'no_go', 'functional_test'}
PUB_TYPES = {'journal_article', 'conference_paper', 'preprint', 'thesis', 'report', 'book_chapter', 'dataset', 'software', 'other'}
EDITORIAL = {'peer_reviewed', 'editorially_reviewed', 'under_review', 'not_peer_reviewed', 'unpublished'}
SCHEMES = {'doi', 'handle', 'isbn', 'issn', 'arxiv'}
SOURCE_KINDS = {'repository', 'commit', 'release', 'closeout', 'brief', 'preprint', 'dataset_record', 'publication', 'official_dataset'}
REPRO = {'rerunnable', 'inspectable', 'documented_only', 'none'}
REL_CLASSES = {'structural', 'conceptual', 'technical'}
REUSE_FORBIDDEN = re.compile(r'all rights reserved|not_stated|^none$|^unknown', re.I)
SCORE_FIELD = re.compile(r'(score|rank|maturity|rating|weight)', re.I)
BUDGET = {'js_files_max': 8, 'geometry_bytes_max': 150_000, 'figure_bytes_max_each': 300_000,
          'figures_bytes_max': 2_000_000, 'figure_side_max': 1600}


def err(code, msg):
    ERRORS.append(f'{code}: {msg}')


def warn(msg):
    WARNINGS.append(msg)


def frozen_pins():
    """Gate 2 frozen pins from SPEC.md §12.1 (source id -> pinned_ref).

    The table cell is Markdown. Its only formatting is inline code (backticks),
    which is removed; the DOI convention `DOI x` -> `doi:x` is the dataset's
    canonical form. Nothing else is rewritten: the remaining text must equal
    the dataset's pinned_ref exactly (I18)."""
    try:
        spec = open(os.path.join(ROOT, 'SPEC.md'), encoding='utf-8').read()
    except OSError:
        return {}
    m = re.search(r'### 12\.1 Sources(.*?)### 12\.2', spec, re.S)
    pins = {}
    if m:
        for sid, ref in re.findall(r'^\| `(s-[a-z0-9-]+)` \|[^|]*\|[^|]*\| ([^|]+) \|', m.group(1), re.M):
            ref = ref.replace('`', '').strip()
            ref = re.sub(r'^DOI ', 'doi:', ref)
            pins[sid] = ref
    return pins


def main():
    a = json.load(open(os.path.join(ROOT, 'data', 'atlas.json'), encoding='utf-8'))
    if a.get('schema_version') != '0.3.0':
        err('SCHEMA', 'schema_version must be 0.3.0')

    names = ('research', 'territories', 'geometries', 'evidence', 'findings', 'outcomes', 'outputs', 'figures', 'sources', 'relationships')
    cols = {k: a.get(k, []) for k in names}
    seen = set()
    for col, items in cols.items():
        for it in items:
            if it['id'] in seen:
                err('I1', f"duplicate id {it['id']}")
            seen.add(it['id'])
    by = {col: {it['id']: it for it in items} for col, items in cols.items()}
    S = by['sources']

    def ref(id_, col, ctx):
        if id_ not in by[col]:
            err('I1', f'{ctx}: {id_!r} does not resolve to {col}')
            return False
        return True

    def claim(sids, ctx):
        """I4 + I11: the claim cites at least one source of its own, one of them public."""
        sids = [s for s in sids if s]
        for s in sids:
            ref(s, 'sources', ctx)
        good = [s for s in sids if s in S]
        if not good:
            err('I4', f'{ctx}: no source')
        elif not any(S[s].get('access') == 'public' for s in good):
            err('I11', f'{ctx}: no access: public source among {sids}')

    for s in cols['sources']:
        if s.get('kind') not in SOURCE_KINDS:
            err('SCHEMA', f"{s['id']}: kind {s.get('kind')!r}")
        if s.get('access') not in ('public', 'restricted'):
            err('SCHEMA', f"{s['id']}: access must be public|restricted")
        if not (s.get('pinned_ref') or '').strip():
            err('I5', f"{s['id']}: empty pinned_ref")
        if re.search(r'/(blob|tree)/(main|master|HEAD)/', s.get('url', '')):
            err('I5', f"{s['id']}: URL points at a branch head")
        if not s.get('url', '').startswith('https://'):
            err('I6', f"{s['id']}: URL must be https")

    for r in cols['research']:
        rid, cls = r['id'], r.get('class')
        if cls not in CLASSES:
            err('SCHEMA', f'{rid}: class {cls!r}')
        if r.get('lifecycle_status') not in LIFECYCLE:
            err('SCHEMA', f'{rid}: lifecycle_status')
        for t in r.get('territory_ids', []):
            ref(t, 'territories', rid)
        if not r.get('territory_ids') and not r.get('territory_note'):
            err('SCHEMA', f'{rid}: empty territory_ids requires territory_note')
        rep = r.get('reproducibility') or {}
        if rep.get('level') not in REPRO:
            err('SCHEMA', f'{rid}: reproducibility.level')
        if rep.get('instructions_source_id'):
            ref(rep['instructions_source_id'], 'sources', f'{rid}.reproducibility')
        for part in ('code', 'data', 'text'):
            lv = (r.get('license') or {}).get(part)
            if not lv or not lv.get('value'):
                err('SCHEMA', f'{rid}: license.{part} missing')
            elif lv.get('source_id'):
                ref(lv['source_id'], 'sources', f'{rid}.license.{part}')
        claim(r.get('source_ids', []), f'{rid} (identity, summary, question)')
        ev = [e for e in cols['evidence'] if e['research_id'] == rid]
        oc = [o for o in cols['outcomes'] if o['research_id'] == rid]
        if cls in ('documented_research', 'experiment'):
            if not r.get('research_question'):
                err('I2', f'{rid}: research_question required')
            m = r.get('methodology') or {}
            if not m.get('summary') or not m.get('source_ids'):
                err('I15', f'{rid}: methodology.summary and methodology.source_ids required')
            else:
                claim(m['source_ids'], f'{rid}.methodology')
            if not ev:
                err('I2', f'{rid}: at least one evidence record required')
            if len(oc) != 1:
                err('I2', f'{rid}: exactly one outcome required (found {len(oc)})')
        else:
            if cls in ('instrument', 'research_platform') and r.get('research_question') is not None:
                err('I3', f'{rid}: research_question must be null for {cls}')
            if cls == 'research_platform':
                if oc:
                    err('I3', f'{rid}: a platform has no outcome')
                for h in r.get('hosts', []):
                    ref(h, 'research', f'{rid}.hosts')
            if r.get('methodology'):
                claim(r['methodology'].get('source_ids', []), f'{rid}.methodology')
        for oid in r.get('output_ids', []):
            ref(oid, 'outputs', rid)
        for fid in r.get('figure_ids', []):
            ref(fid, 'figures', rid)

    for col in ('evidence', 'findings', 'outcomes', 'outputs', 'figures'):
        for it in cols[col]:
            ctx = f"{col}:{it['id']}"
            if ref(it.get('research_id'), 'research', ctx):
                claim(it.get('source_ids') or [it.get('source_id')], ctx)
    for col, key in (('outputs', 'output_ids'), ('figures', 'figure_ids')):
        for it in cols[col]:
            owners = [r['id'] for r in cols['research'] if it['id'] in r.get(key, [])]
            if owners != [it['research_id']]:
                err('I8', f"{col}:{it['id']}: listed by {owners}, parent is {it['research_id']}")

    for e in cols['evidence']:
        if e.get('input_kind') not in INPUT_KINDS:
            err('SCHEMA', f"{e['id']}: input_kind")
        if e.get('substantiation') not in SUBST:
            err('SCHEMA', f"{e['id']}: substantiation")
        for f in ('statement', 'basis', 'limitation'):
            if not e.get(f):
                err('SCHEMA', f"{e['id']}: {f} required")
    for o in cols['outcomes']:
        if o.get('outcome_type') not in OUTCOME_TYPES:
            err('SCHEMA', f"{o['id']}: outcome_type")
        for f in ('verdict_label', 'statement', 'claim_ceiling'):
            if not o.get(f):
                err('SCHEMA', f"{o['id']}: {f} required")

    for o in cols['outputs']:
        if o.get('publication_type') not in PUB_TYPES:
            err('SCHEMA', f"{o['id']}: publication_type")
        if o.get('editorial_status') not in EDITORIAL:
            err('SCHEMA', f"{o['id']}: editorial_status")
        idf = o.get('identifier') or {}
        av = idf.get('availability')
        if av not in ('pid', 'no_pid'):
            err('I16', f"{o['id']}: identifier.availability must be stated")
        elif av == 'pid' and (idf.get('scheme') not in SCHEMES or not idf.get('value')):
            err('I16', f"{o['id']}: pid requires scheme and value")
        elif av == 'no_pid' and (idf.get('scheme') is not None or idf.get('value') is not None):
            err('I16', f"{o['id']}: no_pid requires scheme and value to be null")
        if not o.get('source_id'):
            err('I16', f"{o['id']}: source_id required")

    total_fig = 0
    for f in cols['figures']:
        for k in ('caption', 'alt', 'source_id', 'pinned_ref', 'license', 'credit'):
            if not f.get(k):
                err('I17', f"{f['id']}: {k} required")
        if REUSE_FORBIDDEN.search(f.get('license', '')):
            err('I17', f"{f['id']}: licence does not permit reuse")
        p = os.path.join(ROOT, f['file'])
        if not os.path.isfile(p):
            err('I17', f"{f['id']}: file missing {f['file']}")
            continue
        size = os.path.getsize(p)
        total_fig += size
        if size > BUDGET['figure_bytes_max_each']:
            err('BUDGET', f"{f['id']}: {size} bytes")
        if max(f.get('width', 0), f.get('height', 0)) > BUDGET['figure_side_max']:
            err('BUDGET', f"{f['id']}: longest side > {BUDGET['figure_side_max']} px")
    if total_fig > BUDGET['figures_bytes_max']:
        err('BUDGET', f'figures total {total_fig} bytes')

    total_geo = 0
    for t in cols['territories']:
        claim(t.get('source_ids', []), f"territory:{t['id']}")
        if t.get('geometry_id'):
            ref(t['geometry_id'], 'geometries', t['id'])
        elif not t.get('territory_note'):
            err('SCHEMA', f"{t['id']}: text-only territory requires territory_note")
    for gm in cols['geometries']:
        ctx = f"geometry:{gm['id']}"
        if not gm.get('license') or not gm.get('attribution'):
            err('I12', f'{ctx}: license and attribution required')
        ref(gm.get('source_id'), 'sources', ctx)
        p = os.path.join(ROOT, gm['file'])
        if not os.path.isfile(p):
            err('I12', f"{ctx}: file missing {gm['file']}")
            continue
        data = open(p, 'rb').read()
        total_geo += len(data)
        if hashlib.sha256(data).hexdigest() != gm.get('sha256'):
            err('I12', f'{ctx}: sha256 does not match the committed file')
        d = gm.get('display') or {}
        for k in ('crs', 'bbox', 'centroid_wgs84', 'ticks'):
            if k not in d:
                err('I12', f'{ctx}: display.{k} missing')
    if total_geo > BUDGET['geometry_bytes_max']:
        err('BUDGET', f'geometry total {total_geo} bytes')
    geo_dir = os.path.join(ROOT, 'data', 'geometry')
    if os.path.isdir(geo_dir):
        declared = {os.path.basename(g['file']) for g in cols['geometries']}
        for fn in os.listdir(geo_dir):
            if fn not in declared:
                err('I12', f'data/geometry/{fn} is not a declared geometry object')

    for rel in cols['relationships']:
        c = rel.get('class')
        if c not in REL_CLASSES:
            err('I13', f"{rel['id']}: class required")
        if c in ('conceptual', 'technical'):
            err('I7', f"{rel['id']}: no {c} relationship is allowed in v0.3.0")
            if not rel.get('source_ids'):
                err('I13', f"{rel['id']}: source_ids required")

    def walk(o, path):
        if isinstance(o, dict):
            for k, v in o.items():
                if SCORE_FIELD.search(k):
                    err('I10', f'score-like field {path}.{k}')
                walk(v, f'{path}.{k}')
        elif isinstance(o, list):
            for i, v in enumerate(o):
                walk(v, f'{path}[{i}]')
    walk({k: v for k, v in a.items() if k != 'meta'}, '$')

    pins = frozen_pins()
    if not pins:
        warn('SPEC.md §12.1 frozen pins not found; I18 not checked')
    for s in cols['sources']:
        fz, cur = pins.get(s['id']), s.get('pinned_ref', '')
        if fz is None:
            warn(f"{s['id']}: no frozen pin in SPEC.md §12.1 (I18 not applicable)")
            continue
        if cur != fz and not s.get('pin_change'):
            err('I18', f"{s['id']}: pinned_ref {cur!r} differs from frozen {fz!r} without pin_change")

    for base in ('index.html', 'styles.css'):
        if not os.path.isfile(os.path.join(ROOT, base)):
            err('BUDGET', f'{base} missing')
    js_dir = os.path.join(ROOT, 'js')
    js = sorted(f for f in os.listdir(js_dir) if f.endswith('.js')) if os.path.isdir(js_dir) else []
    if len(js) > BUDGET['js_files_max']:
        err('BUDGET', f'{len(js)} JS modules > {BUDGET["js_files_max"]}')
    ip = os.path.join(ROOT, 'index.html')
    html = open(ip, encoding='utf-8').read() if os.path.isfile(ip) else ''
    if re.search(r'<(script|link|img)[^>]+(src|href)="https?://', html):
        err('BUDGET', 'index.html references a third-party resource')
    if 'tools/' in html:
        err('BUDGET', 'index.html references development tooling')
    for f in js:
        txt = open(os.path.join(js_dir, f), encoding='utf-8').read()
        if re.search(r"(import\s*\(?|fetch\s*\()\s*['\"`]https?://", txt) or re.search(r"from\s+['\"]https?://", txt):
            err('BUDGET', f'js/{f}: third-party import or fetch')
        if re.search(r'localStorage|sessionStorage|document\.cookie', txt):
            err('BUDGET', f'js/{f}: persistence is forbidden')

    if '--links' in sys.argv:
        check_links(cols)

    for w in WARNINGS:
        print('warning:', w)
    if ERRORS:
        print(f'FAIL — {len(ERRORS)} error(s):')
        for e in ERRORS:
            print('  ' + e)
        return 1
    print(f"OK — schema 0.3.0; {len(cols['research'])} items, {len(cols['evidence'])} evidence, {len(cols['findings'])} findings, "
          f"{len(cols['outcomes'])} outcomes, {len(cols['outputs'])} outputs, {len(cols['figures'])} figures, {len(cols['sources'])} sources. "
          'I1–I13 and I15–I18 pass: metadata only. Scientific support is the SPEC.md §12.10 human review.')
    return 0


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def check_links(cols):
    """Development link check: reports, never edits data. DOI links are checked
    at doi.org (a redirect is expected) because Zenodo refuses scripted requests."""
    urls = sorted({s['url'] for s in cols['sources']} | {o['url'] for o in cols['outputs'] if o.get('url')})
    print(f'link check: {len(urls)} URL(s)')
    for u in urls:
        doi = 'doi.org/' in u
        opener = urllib.request.build_opener(_NoRedirect) if doi else urllib.request.build_opener()
        req = urllib.request.Request(u, headers={'User-Agent': 'atlas-link-check/0.3'})
        try:
            code = opener.open(req, timeout=60).status
        except urllib.error.HTTPError as e:
            code = e.code
        except Exception as e:  # noqa: BLE001 — report any network failure
            code = f'ERR {type(e).__name__}'
        ok = code == 200 or (doi and code in (301, 302, 303))
        print(f"  {'ok ' if ok else 'BAD'} {code} {u}")
        if not ok:
            err('LINK', f'{u} -> {code}')


if __name__ == '__main__':
    sys.exit(main())
