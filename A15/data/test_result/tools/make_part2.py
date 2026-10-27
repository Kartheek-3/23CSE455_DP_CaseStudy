import csv, os, sys, json, subprocess, shutil, re
sys.path.insert(0, os.path.dirname(__file__))
from gen_part1 import build, symbols, concrete
from evolution_spec import *
from gen_diagrams import instance_dot, render

A, W = "/home/claude/A1", "/home/claude/work"
P2 = A + "/Part2"
def sh(cmd, **k): return subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True, **k).stdout

# ---- 1. code snapshots -------------------------------------------------------
shutil.rmtree(P2, ignore_errors=True)
os.makedirs(P2 + "/changes", exist_ok=True)
shutil.copytree(W + "/snaps/change3", P2 + "/code", ignore=shutil.ignore_patterns("target", ".git"))
for n in (1, 2, 3):
    d = "%s/changes/Change%d" % (P2, n); os.makedirs(d)
    if n < 3:
        os.makedirs(d + "/code_after")
        for sub in ("src/main", "src/test"):
            shutil.copytree("%s/snaps/change%d/%s" % (W, n, sub), "%s/code_after/%s" % (d, sub))
prev = {1: "c0", 2: "change1", 3: "change2"}
commits = {}
for n in (1, 2, 3):
    d = "%s/changes/Change%d" % (P2, n)
    a, b = prev[n], "change%d" % n
    open(d + "/Change%d.patch" % n, "w", encoding="utf-8").write(sh("cd %s/app && git diff %s %s" % (W, a, b)))
    commits[n] = (sh("cd %s/app && git rev-parse --short %s" % (W, a)).strip(), sh("cd %s/app && git rev-parse --short %s" % (W, b)).strip())
    stat = sh("cd %s/app && git diff --stat %s %s" % (W, a, b))
    hdr = ("Change%d test result (sandbox harness: real main sources + Jakarta stubs + in-memory EntityManager; NOT `mvn test`)\n"
           "commit before: %s   commit after: %s\n"
           "command: bash data/test_result/harness/run_tests.sh <app-dir> <out-dir> <all test classes>\n"
           "date: 2026-10-11\n\n" % (n, commits[n][0], commits[n][1]))
    open(d + "/test_result.txt", "w", encoding="utf-8").write(hdr + open("%s/logs/change%d_tests.log" % (W, n), encoding="utf-8").read() + "\n--- git diff --stat ---\n" + stat)
json.dump(commits, open(W + "/logs/commits.json", "w"))

# ---- 2. evolution csv + counts ----------------------------------------------
PRE = {"Original code": ("data/code", "data/code/"), "After Change1": (P2 + "/changes/Change1/code_after", "Part2/changes/Change1/code_after/"),
       "After Change2": (P2 + "/changes/Change2/code_after", "Part2/changes/Change2/code_after/"), "After Change3": (P2 + "/code", "Part2/code/")}
PRE["Original code"] = (A + "/data/code", "data/code/")
versions = make_versions()
summ = {}
with open(P2 + "/pattern_evolution.csv", "w", newline="", encoding="utf-8") as f, open(P2 + "/Pattern_count.csv", "w", newline="", encoding="utf-8") as g:
    w = csv.writer(f, lineterminator="\n"); cw = csv.writer(g, lineterminator="\n")
    w.writerow(["source_version","pattern_name","pattern_type","instance_name","participant_roles","source_locations","intent_and_evidence","status_after_change","change_description"])
    cw.writerow(["source_version","summary","pattern_name","count"])
    for label, insts in versions:
        root, prefix = PRE[label]
        build(root, insts, prefix)
        for i in insts:
            w.writerow([label, i["pattern"], i["ptype"], i["name"], i["_roles"], i["_locs"], i["problem"] + " Evidence: " + i["evidence"], i["status"], i["change"]])
        cur = [i for i in insts if i["status"] not in ("removed", "replaced")]
        names = []
        for i in cur:
            if i["pattern"] not in names: names.append(i["pattern"])
        for n in names: cw.writerow([label, "per_pattern", n, sum(1 for i in cur if i["pattern"] == n)])
        cw.writerow([label, "total_pattern_types", "", len(names)])
        cw.writerow([label, "total_pattern_instances", "", len(cur)])
        cm, fld = symbols(root, cur); cc = concrete(cur)
        summ[label] = dict(types=len(names), instances=len(cur), concrete=sum(len(v) for v in cc.values()), concrete_by={k: len(v) for k, v in cc.items()},
                           unique_symbols=len(cm), field_symbols=len(fld), names=names,
                           status={i["name"]: i["status"] for i in insts})
json.dump(summ, open(W + "/logs/p2_summary.json", "w"), indent=1)
for k, v in summ.items(): print(k, v["types"], v["instances"], v["concrete"], v["unique_symbols"])

# ---- 3. diagrams -------------------------------------------------------------
X = {
 "STRAT@1": [("AccountService","AccountPolicyResolver","selects via",0),("AccountPolicyResolver","AccountPolicy","returns",0),("AccountService","AccountPolicy","calls bonusOnDeposit /\\nallowsWithdrawal",0),("SavingsAccountPolicy","AccountPolicy","implements",1),("CheckingAccountPolicy","AccountPolicy","implements",1)],
 "STRAT@3": [("AccountService","AccountPolicyResolver","selects via",0),("AccountService","Account","deposit / withdraw (policy)",0),("Account","AccountPolicy","calls bonusOnDeposit /\\nallowsWithdrawal",0),("AccountPolicyResolver","AccountPolicy","returns",0),("SavingsAccountPolicy","AccountPolicy","implements",1),("CheckingAccountPolicy","AccountPolicy","implements",1)],
 "OBS": [("AccountService","TransactionEvent","fires",0),("TransactionEvent","TransactionAuditLog","delivered to\\n@Observes",0),("TransactionEvent","HighValueAlertObserver","delivered to\\n@Observes",0),("TransactionAuditLog","(not separately declared - CDI @Observes TransactionEvent contract)","realises",1),("HighValueAlertObserver","(not separately declared - CDI @Observes TransactionEvent contract)","realises",1)],
 "DM": [("AccountService","Account","deposit / withdraw / credit",0),("Account","AccountPolicy","consults",0),("AccountService","AccountDAO","persists via",0)],
}
def draw(label_dir, key, inst, xkey):
    d = "%s/diagrams/%s" % (P2, label_dir); os.makedirs(d, exist_ok=True)
    skip = SKIP_ROLES | {"ContextOperation","ContextClient","DomainOperation","NotifyPoint","ObserverCallback","SubjectChannel","Orchestrator"}
    render(instance_dot(inst, {}, {inst["key"]: X[xkey]}, skip), "%s/%s" % (d, key))
lab = dict(versions)
draw("after_change1", "STRAT", by(lab["After Change1"], "STRAT"), "STRAT@1")
draw("after_change2", "OBS", by(lab["After Change2"], "OBS"), "OBS")
draw("after_change3", "STRAT", by(lab["After Change3"], "STRAT"), "STRAT@3")
draw("after_change3", "OBS", by(lab["After Change3"], "OBS"), "OBS")
draw("after_change3", "DM", by(lab["After Change3"], "DM"), "DM")
