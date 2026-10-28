import csv, os, sys, json, subprocess
sys.path.insert(0, os.path.dirname(__file__))
from gen_part1 import build, symbols, concrete
from patterns_spec import *
from gen_diagrams import instance_diagrams, render

A = "/home/claude/A1"
root = A + "/data/code"
inst = build(root, V0, "data/code/")
os.makedirs(A + "/Part1", exist_ok=True)

with open(A + "/Part1/patterns.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, quoting=csv.QUOTE_MINIMAL, lineterminator="\n")
    w.writerow(["source_version","pattern_name","pattern_type","instance_name","participant_roles","source_locations","intent_and_evidence"])
    for i in inst:
        w.writerow(["Original code", i["pattern"], i["ptype"], i["name"], i["_roles"], i["_locs"], i["problem"] + " Evidence: " + i["evidence"]])

names = []
for i in inst:
    if i["pattern"] not in names: names.append(i["pattern"])
cnt = {n: sum(1 for i in inst if i["pattern"] == n) for n in names}
with open(A + "/Part1/Pattern_count.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, lineterminator="\n")
    w.writerow(["source_version","summary","pattern_name","count"])
    for n in names: w.writerow(["Original code","per_pattern",n,cnt[n]])
    w.writerow(["Original code","total_pattern_types","",len(names)])
    w.writerow(["Original code","total_pattern_instances","",len(inst)])

cm, fld = symbols(root, inst); cc = concrete(inst)
summary = dict(types=len(names), instances=len(inst), concrete=sum(len(v) for v in cc.values()), concrete_by=cc,
               unique_symbols=len(cm), field_symbols=len(fld), rejected=len(REJECTED_V0), uncertain=len(UNCERTAIN_V0))
json.dump(summary, open("/home/claude/work/logs/p1_summary.json", "w"), indent=1)
print(json.dumps(summary))
instance_diagrams(inst, A + "/Part1/pattern_architecture/instances")
