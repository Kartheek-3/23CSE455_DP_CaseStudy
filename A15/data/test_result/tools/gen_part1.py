import csv, os, sys, re
sys.path.insert(0, os.path.dirname(__file__))
from javaloc import resolve, kind_of
from patterns_spec import *

def build(root, instances, prefix):
    rows, stats = [], {}
    for inst in instances:
        roles, locs = [], []
        for role, sym, rel in inst["roles"]:
            roles.append("%s=%s" % (role, sym))
            if rel is None: continue
            r = resolve(root, M + rel, sym)
            assert r, (sym, rel)
            locs.append("%s=%s:%d-%d" % (sym, prefix + M + rel, r[0], r[1]))
        inst["_roles"], inst["_locs"] = "; ".join(roles), "; ".join(locs)
    return instances

def symbols(root, instances):
    """unique (class|interface|method) symbols, field symbols counted separately"""
    cm, fld = set(), set()
    for inst in instances:
        for role, sym, rel in inst["roles"]:
            if rel is None: continue
            k = kind_of(root, M + rel, sym)
            (fld if k == "field" else cm).add(sym)
    return cm, fld

def concrete(instances):
    """concrete participant classes = distinct classes realising the instance's variant role"""
    out = {}
    for inst in instances:
        out[inst["key"]] = sorted({s.split(".")[0] for r, s, f in inst["roles"] if r == inst["vrole"]})
    return out

if __name__ == "__main__":
    root = sys.argv[1]
    inst = build(root, V0, "data/code/")
    cm, fld = symbols(root, inst)
    print(len(inst), "instances;", len(cm), "unique class/interface/method symbols;", len(fld), "field symbols")
    for i in inst:
        print(i["name"], "|", i["_roles"][:80])
