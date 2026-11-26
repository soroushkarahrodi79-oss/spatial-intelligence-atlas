#!/usr/bin/env python3
"""Mechanical checks for the v0.4 relationship-graph proposal (prototype).

Standard library only. Run from the repository root:

    python prototype/v0.4-knowledge-graph/validate_graph.py

A pass means the graph metadata is well formed and every relationship is
linked to a pinned, public source of the declared kind. It never means that
a source supports the relationship: that is the human verification the
proposal lists as acceptance criterion K2.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
SHA = re.compile(r"^[0-9a-f]{40}$")
FORBIDDEN_FIELDS = {"score", "confidence", "weight", "strength", "rank", "rating"}

errors: list[str] = []


def err(code: str, msg: str) -> None:
    errors.append(f"{code}: {msg}")


def walk_keys(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            yield k, f"{path}.{k}"
            yield from walk_keys(v, f"{path}.{k}")
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            yield from walk_keys(v, f"{path}[{i}]")


def repo_of(url: str) -> str | None:
    m = re.match(r"https://github\.com/[^/]+/([^/]+)/", url or "")
    return m.group(1) if m else None


def main() -> int:
    atlas = json.loads((ROOT / "data" / "atlas.json").read_text(encoding="utf-8"))
    g = json.loads((HERE / "graph.json").read_text(encoding="utf-8"))

    a_research = {r["id"]: r for r in atlas["research"]}
    a_terr = {t["id"]: t for t in atlas["territories"]}
    a_out = {o["id"]: o for o in atlas["outputs"]}
    sources = {s["id"]: s for s in atlas["sources"]}
    g_sources = {s["id"]: s for s in g["sources"]}

    # G0: the released dataset is untouched in the ways this proposal relies on.
    if atlas.get("schema_version") != "0.3.0":
        err("G0", f"atlas.json schema is {atlas.get('schema_version')}, expected 0.3.0")
    if atlas.get("relationships"):
        err("G0", "atlas.json carries relationships; v0.3 I7 requires none")

    # G1: unique ids, no collision with atlas source ids.
    for coll in ("sources", "nodes", "relationships", "non_relationships", "predicates", "classes"):
        ids = [x["id"] for x in g[coll]]
        dup = {i for i in ids if ids.count(i) > 1}
        if dup:
            err("G1", f"duplicate ids in {coll}: {sorted(dup)}")
    for sid in g_sources:
        if sid in sources:
            err("G1", f"graph source {sid} collides with an atlas source id")
    sources.update(g_sources)

    # G2: every graph source is pinned, public and anchored.
    for s in g["sources"]:
        sid = s["id"]
        if s.get("access") != "public":
            err("G2", f"{sid} is not public")
        if not SHA.match(s.get("pinned_ref", "")):
            err("G2", f"{sid} pinned_ref is not a full commit SHA")
        if s.get("pinned_ref", "x") not in s.get("url", ""):
            err("G2", f"{sid} url does not contain its pinned_ref")
        if not s.get("locator") or not s.get("path"):
            err("G2", f"{sid} lacks path or locator")
        if repo_of(s.get("url", "")) != s.get("repository"):
            err("G2", f"{sid} repository field does not match its url")

    # G3: nodes resolve; atlas nodes exist; candidates carry status and public sources.
    nodes = {}
    kinds = {k["id"] for k in g["node_kinds"]}
    for n in g["nodes"]:
        nid, kind = n["id"], n["kind"]
        if kind not in kinds:
            err("G3", f"{nid} has unknown kind {kind}")
        if n.get("atlas"):
            table = {"research": a_research, "territory": a_terr, "output": a_out}.get(kind)
            if table is None or nid not in table:
                err("G3", f"{nid} is marked atlas but does not exist in atlas.json")
        elif kind == "research":
            for f in ("class", "title", "summary", "state_label", "license_code", "source_ids", "admission"):
                if not n.get(f):
                    err("G3", f"candidate {nid} lacks {f}")
            if n.get("admission") not in ("candidate", "deferred"):
                err("G3", f"{nid} admission must be candidate or deferred")
        for sid in n.get("source_ids", []):
            if sid not in sources:
                err("G3", f"{nid} cites unknown source {sid}")
        nodes[nid] = n

    def repo_for_node(nid: str) -> str | None:
        n = nodes[nid]
        sids = a_research[nid]["source_ids"] if n.get("atlas") and nid in a_research else n.get("source_ids", [])
        for sid in sids:
            s = sources.get(sid, {})
            r = s.get("repository") or repo_of(s.get("url", ""))
            if r:
                return r
        return None

    # G4: relationships obey the predicate contract.
    preds = {p["id"]: p for p in g["predicates"]}
    classes = {c["id"]: c for c in g["classes"]}
    seen = set()
    for e in g["relationships"]:
        rid, p = e["id"], preds.get(e["predicate"])
        if p is None:
            err("G4", f"{rid} unknown predicate {e['predicate']}")
            continue
        if e["class"] != p["class"]:
            err("G4", f"{rid} class {e['class']} differs from predicate class {p['class']}")
        if e["class"] not in classes:
            err("G4", f"{rid} unknown class")
        for end, allowed in (("source", p["domain"]), ("target", p["range"])):
            if e[end] not in nodes:
                err("G4", f"{rid} {end} {e[end]} is not a node")
            elif nodes[e[end]]["kind"] not in allowed:
                err("G4", f"{rid} {end} kind {nodes[e[end]]['kind']} not in {allowed}")
        key = (e["source"], e["predicate"], e["target"])
        if key in seen:
            err("G4", f"{rid} duplicates {key}")
        seen.add(key)
        if not e.get("explanation"):
            err("G4", f"{rid} lacks a plain-language explanation")

        # G5: evidence.
        ev = e.get("evidence") or []
        if not ev:
            err("G5", f"{rid} has no evidence")
        for x in ev:
            s = sources.get(x["source"])
            if s is None:
                err("G5", f"{rid} cites unknown source {x['source']}")
            elif s.get("access") != "public":
                err("G5", f"{rid} cites non-public source {x['source']}")
        if e["predicate"] == "uses_dataset" and not e.get("extract"):
            err("G5", f"{rid} uses_dataset without an extract note")
        if e["class"] == "technical" and e.get("public"):
            dep_repo = repo_for_node(e["source"])
            cited = {sources[x["source"]].get("repository") or repo_of(sources[x["source"]].get("url", "")) for x in ev if x["source"] in sources}
            if dep_repo not in cited:
                err("G5", f"{rid} technical relation not documented by the dependent item's own repository ({dep_repo})")

        # G6: publication rules.
        cls = classes.get(e["class"], {})
        if e.get("public") and not cls.get("public"):
            err("G6", f"{rid} is public but class {e['class']} is development-only")
        if not e.get("public"):
            if e.get("status") not in ("candidate", "deferred", "rejected"):
                err("G6", f"{rid} non-public without status candidate/deferred/rejected")
            if not e.get("inventory_decision"):
                err("G6", f"{rid} non-public without inventory_decision")
        else:
            for end in ("source", "target"):
                if nodes.get(e[end], {}).get("admission") == "deferred":
                    err("G6", f"{rid} public relation touches deferred node {e[end]}")
        if e["class"] == "hypothetical" and cls.get("default_on"):
            err("G6", "hypothetical class must be off by default")

    # G7: non-relationships resolve and cite a public source.
    for x in g["non_relationships"]:
        for nid in [x["subject"], *x["objects"]]:
            if nid not in nodes:
                err("G7", f"{x['id']} references unknown node {nid}")
        if sources.get(x["source"], {}).get("access") != "public":
            err("G7", f"{x['id']} source missing or not public")

    # G8: no ordinal score anywhere (carries v0.3 I10 forward).
    for k, path in walk_keys(g):
        if k.lower() in FORBIDDEN_FIELDS:
            err("G8", f"forbidden scoring field {path}")

    # G9: verification is never claimed as human.
    v = g.get("verification_default", {})
    if v.get("human_verification") != "pending" or v.get("method") != "ai_assisted_source_check":
        err("G9", "verification_default must state an AI-assisted check with human verification pending")

    n_pub = sum(1 for e in g["relationships"] if e.get("public"))
    n_dev = len(g["relationships"]) - n_pub
    if errors:
        print(f"FAIL — {len(errors)} error(s)")
        for e in errors:
            print("  " + e)
        return 1
    print(f"PASS — {len(g['nodes'])} nodes, {n_pub} public and {n_dev} inventory relationships, "
          f"{len(g['non_relationships'])} non-relationships, {len(g['sources'])} pinned sources (G0–G9).")
    print("Mechanical validation only; it does not establish that any source supports a relationship.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
