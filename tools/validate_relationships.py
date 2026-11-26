#!/usr/bin/env python3
"""Mechanical validator for data/relationships.json (schema 0.4.0).

Development-only, standard library only; the page never loads this file.
It is imported by tools/validate_atlas.py (which runs it on every pull
request) and by tests/test_relationships.py (negative tests).

It checks invariants R1–R14 of SPEC.md §13.4. A pass means the relationship
metadata is well formed, linked to pinned public sources and consistent
with data/atlas.json. It does NOT establish that any source supports a
relationship: that is the human verification of SPEC.md §13.8 (K2).
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHA = re.compile(r'^[0-9a-f]{40}$')
PUBLIC_CLASSES = {'technical', 'structural', 'methodological', 'territorial'}
TECHNICAL = {'depends_on', 'consumes_output_of'}
SCORE_FIELD = re.compile(r'(score|rank|maturity|rating|weight|confidence|strength|importance|centrality)', re.I)
DERIVED_FIELDS = {'research.hosts', 'research.territory_ids', 'outputs.research_id'}
VERIFICATION = {'ai_assisted_source_check', 'human_verified'}


def repo_of(url):
    m = re.match(r'https://github\.com/[^/]+/([^/]+)/', url or '')
    return m.group(1) if m else None


def validate(atlas, rel, root=ROOT):
    """Return a list of 'Rn: message' strings; empty when valid."""
    errs = []

    def err(code, msg):
        errs.append(f'{code}: {msg}')

    # R1 — schema, ids, collisions with atlas ids.
    if rel.get('schema_version') != '0.4.0':
        err('R1', 'relationships.json schema_version must be 0.4.0')
    atlas_ids = {x['id'] for col in ('research', 'territories', 'geometries', 'evidence', 'findings', 'outcomes', 'outputs', 'figures', 'sources')
                 for x in atlas.get(col, [])}
    seen = set()
    for col in ('methods', 'datasets', 'sources', 'relationships', 'non_relationships', 'predicates', 'classes'):
        for x in rel.get(col, []):
            if x['id'] in seen:
                err('R1', f"duplicate id {x['id']}")
            if x['id'] in atlas_ids:
                err('R1', f"id {x['id']} collides with an atlas.json id")
            seen.add(x['id'])

    research = {r['id']: r for r in atlas['research']}
    kinds = {}
    for r in atlas['research']:
        kinds[r['id']] = 'research'
    for t in atlas['territories']:
        kinds[t['id']] = 'territory'
    for o in atlas['outputs']:
        kinds[o['id']] = 'output'
    for m in rel.get('methods', []):
        kinds[m['id']] = 'method'
    for d in rel.get('datasets', []):
        kinds[d['id']] = 'dataset'

    sources = {s['id']: s for s in atlas['sources']}
    urls = {}
    for s in atlas['sources'] + rel.get('sources', []):
        u = s.get('url')
        if u in urls and urls[u] != s['id']:
            err('R4', f"sources {urls[u]} and {s['id']} share one URL")
        urls[u] = s['id']
    for s in rel.get('sources', []):
        sources[s['id']] = s
        if s.get('access') != 'public':
            err('R4', f"{s['id']}: relationship sources must be public")
        if not SHA.match(s.get('pinned_ref', '')) or s['pinned_ref'] not in s.get('url', ''):
            err('R4', f"{s['id']}: pinned_ref must be a full commit SHA contained in the url")

    preds = {p['id']: p for p in rel.get('predicates', [])}
    classes = {c['id'] for c in rel.get('classes', [])}
    if classes - PUBLIC_CLASSES:
        err('R3', f'classes outside the production set: {sorted(classes - PUBLIC_CLASSES)} (decision E5)')
    for p in preds.values():
        if p.get('class') not in PUBLIC_CLASSES:
            err('R3', f"predicate {p['id']}: class {p.get('class')!r} is not a production class (E5)")
        for f in ('definition', 'direction', 'required_evidence', 'limits'):
            if not p.get(f):
                err('R3', f"predicate {p['id']}: {f} required")

    def node_repo(nid):
        for sid in research.get(nid, {}).get('source_ids', []):
            r = repo_of(sources.get(sid, {}).get('url'))
            if r:
                return r
        return None

    triples = set()
    for e in rel.get('relationships', []):
        rid = e.get('id', '?')
        p = preds.get(e.get('predicate'))
        # R2 — endpoints resolve, kinds fit, no self-loop.
        if p is None:
            err('R2', f"{rid}: unknown predicate {e.get('predicate')!r}")
            continue
        for end, allowed in (('source', p['domain']), ('target', p['range'])):
            k = kinds.get(e.get(end))
            if k is None:
                err('R2', f"{rid}: {end} {e.get(end)!r} is not an admitted node")
            elif k not in allowed:
                err('R2', f"{rid}: {end} kind {k} not allowed for {p['id']}")
        if e.get('source') == e.get('target'):
            err('R9', f'{rid}: self-loop')
        t = (e.get('source'), e.get('predicate'), e.get('target'))
        if t in triples:
            err('R9', f'{rid}: duplicate relationship {t}')
        triples.add(t)
        # R3 — class matches predicate; production classes only.
        if e.get('class') != p['class']:
            err('R3', f"{rid}: class {e.get('class')!r} differs from predicate class {p['class']!r}")
        if e.get('class') not in PUBLIC_CLASSES:
            err('R3', f"{rid}: class {e.get('class')!r} is excluded from production (E5)")
        if not e.get('explanation'):
            err('R3', f'{rid}: plain-language explanation required')
        if not isinstance(e.get('limits'), list):
            err('R3', f'{rid}: limits must be a list')
        # R4 — evidence: resolvable, public, pinned, located.
        ev = e.get('evidence') or []
        if not ev:
            err('R4', f'{rid}: at least one evidence entry required')
        for x in ev:
            s = sources.get(x.get('source_id'))
            if s is None:
                err('R4', f"{rid}: unknown source {x.get('source_id')!r}")
                continue
            if s.get('access') != 'public':
                err('R4', f"{rid}: source {s['id']} is not public")
            if not (s.get('pinned_ref') or '').strip():
                err('R4', f"{rid}: source {s['id']} has no pin")
            if not x.get('summary'):
                err('R4', f'{rid}: evidence summary required')
            ln = x.get('lines')
            if ln is not None and not (isinstance(ln, list) and len(ln) == 2 and 0 < ln[0] <= ln[1]):
                err('R4', f'{rid}: lines must be null or [first, last]')
            if ln is None and not e.get('derived_from') and e.get('class') == 'technical':
                err('R4', f'{rid}: technical evidence needs a line locator')
        # R5 — technical relations documented in the dependent item's own repository.
        if e.get('predicate') in TECHNICAL:
            own = node_repo(e.get('source'))
            cited = {repo_of(sources[x['source_id']].get('url')) for x in ev if x.get('source_id') in sources}
            if own not in cited:
                err('R5', f"{rid}: not documented by the dependent item's own repository ({own})")
        # R6 — dataset relations name their extract.
        if e.get('predicate') == 'uses_dataset' and not (e.get('extract') or '').strip():
            err('R6', f'{rid}: uses_dataset requires an extract')
        # R7 — versions (decision E3): technical relations show both ends; a version
        # other than the dossier's must be explained, never silently substituted.
        vs = e.get('versions') or []
        if e.get('predicate') in TECHNICAL:
            if {v.get('node') for v in vs} != {e.get('source'), e.get('target')}:
                err('R7', f'{rid}: technical relations must state the version of both ends')
        for v in vs:
            r = research.get(v.get('node'))
            if r is None or v.get('node') not in (e.get('source'), e.get('target')):
                err('R7', f"{rid}: version for {v.get('node')!r} is not an endpoint item")
                continue
            if not v.get('ref') or not v.get('role'):
                err('R7', f'{rid}: version needs ref and role')
            if v.get('ref') != r['version']['ref'] and not (v.get('note') or '').strip():
                err('R7', f"{rid}: {v['node']} version {str(v.get('ref'))[:7]} differs from the dossier version without a note")
        # R12 — verification state.
        vstate = (e.get('verification') or {}).get('state', 'ai_assisted_source_check')
        if vstate not in VERIFICATION:
            err('R12', f'{rid}: verification state {vstate!r}')
        if vstate == 'human_verified' and not ((e.get('verification') or {}).get('verified_by') and (e.get('verification') or {}).get('verified_at')):
            err('R12', f'{rid}: human_verified requires verified_by and verified_at')
        df = e.get('derived_from')
        if df and df.get('field') not in DERIVED_FIELDS:
            err('R8', f"{rid}: unknown derived_from field {df.get('field')!r}")

    # R8 — derived relations mirror the atlas fields exactly, both ways.
    expected = set()
    for r in atlas['research']:
        for h in r.get('hosts', []):
            expected.add((r['id'], 'hosts', h, 'research.hosts'))
        for t in r.get('territory_ids', []):
            expected.add((r['id'], 'situated_in', t, 'research.territory_ids'))
    for o in atlas['outputs']:
        expected.add((o['research_id'], 'has_output', o['id'], 'outputs.research_id'))
    got = {(e['source'], e['predicate'], e['target'], e['derived_from']['field'])
           for e in rel.get('relationships', []) if e.get('derived_from')}
    for miss in sorted(expected - got):
        err('R8', f'atlas field {miss[3]} {miss[0]}→{miss[2]} has no derived relationship')
    for extra in sorted(got - expected):
        err('R8', f'derived relationship {extra[0]} {extra[1]} {extra[2]} has no atlas field')
    for e in rel.get('relationships', []):
        if e.get('predicate') in ('situated_in', 'has_output') and not e.get('derived_from'):
            err('R8', f"{e['id']}: {e['predicate']} must be derived from atlas.json")

    # R10 — documented non-relationships.
    for x in rel.get('non_relationships', []):
        for nid in [x.get('subject'), *x.get('objects', [])]:
            if kinds.get(nid) != 'research':
                err('R10', f"{x['id']}: {nid!r} is not an admitted item")
        s = sources.get((x.get('evidence') or {}).get('source_id'))
        if s is None or s.get('access') != 'public':
            err('R10', f"{x['id']}: needs a public source")
        if not (x.get('interpretation') or '').strip():
            err('R10', f"{x['id']}: interpretation limit required")
        if any(t[0] == x.get('subject') and t[2] in x.get('objects', []) and t[1] in TECHNICAL for t in triples):
            err('R10', f"{x['id']}: contradicts a technical relationship")

    # R11 — no score, rank, weight or confidence anywhere.
    def walk(o, path):
        if isinstance(o, dict):
            for k, v in o.items():
                if SCORE_FIELD.search(k):
                    err('R11', f'score-like field {path}.{k}')
                walk(v, f'{path}.{k}')
        elif isinstance(o, list):
            for i, v in enumerate(o):
                walk(v, f'{path}[{i}]')
    walk(rel, '$')

    # R12 — the file-level verification statement never claims human verification.
    v = rel.get('verification') or {}
    if v.get('method') != 'ai_assisted_source_check' or v.get('human_verification') != 'pending':
        if not all((e.get('verification') or {}).get('state') == 'human_verified' for e in rel.get('relationships', [])):
            err('R12', 'file-level verification must state an AI-assisted check with human verification pending')

    # R13 — the notice states the interpretation limits shown on every graph view.
    notice = (rel.get('notice') or '').lower()
    for phrase in ('hosting is not integration', 'absence of a documented relation'):
        if phrase not in notice:
            err('R13', f'notice must state: {phrase!r}')

    # R14 — the isolated prototype is never part of the deployed tree (decision E4).
    if os.path.isdir(os.path.join(root, 'prototype')):
        err('R14', 'prototype/ must not exist in the deployed tree (decision E4)')
    return errs


def main():
    atlas = json.load(open(os.path.join(ROOT, 'data', 'atlas.json'), encoding='utf-8'))
    rel = json.load(open(os.path.join(ROOT, 'data', 'relationships.json'), encoding='utf-8'))
    errs = validate(atlas, rel)
    if errs:
        print(f'FAIL — {len(errs)} error(s):')
        for e in errs:
            print('  ' + e)
        return 1
    print(f"OK — relationships 0.4.0; {len(rel['relationships'])} relationships, {len(rel['non_relationships'])} non-relationships, "
          f"{len(rel['methods'])} methods, {len(rel['datasets'])} datasets. R1–R14 pass: metadata only; human verification (K2) is pending.")
    return 0


if __name__ == '__main__':
    sys.exit(main())
