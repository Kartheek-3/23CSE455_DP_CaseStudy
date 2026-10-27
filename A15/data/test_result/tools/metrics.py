import subprocess, json, re, os, csv
res = {}
def total(path, lang="java"):
    t = subprocess.run(["python3","-m","lizard","-l",lang,path],capture_output=True,text=True).stdout
    m = re.search(r"Total nloc\s+Avg.NLOC\s+AvgCCN\s+Avg.token\s+Fun Cnt\s+Warning cnt\s+Fun Rt\s+nloc Rt\s*\n[-=]+\s*\n\s*(\d+)\s+([\d.]+)\s+([\d.]+)", t)
    return (int(m.group(1)), float(m.group(3))) if m else (None, None)
for t in ["baseline","c0","change1","change2","change3"]:
    d = "/home/claude/work/snaps/%s/src/main/java" % t
    rows = list(csv.reader(subprocess.run(["python3","-m","lizard","-l","java","--csv",d],capture_output=True,text=True).stdout.splitlines()))
    worst = max(rows, key=lambda r: int(r[1]))
    n, a = total(d)
    res[t] = dict(max_ccn=int(worst[1]), funcs=len(rows), worst="%s (%s)" % (worst[7], os.path.basename(worst[6])), total_nloc=n, avg_ccn=a,
                  files=int(subprocess.run("find %s -name '*.java' | wc -l" % d, shell=True, capture_output=True, text=True).stdout))
    td = "/home/claude/work/snaps/%s/src/test/java" % t
    res[t]["test_nloc"] = total(td)[0] if os.path.isdir(td) else None
    log = "/home/claude/work/logs/%s_tests.log" % {"baseline": "baseline", "c0": "baseline"}.get(t, t)
    if t != "baseline" and os.path.exists(log):
        r = re.search(r"RESULT passed=(\d+) failed=(\d+) total=(\d+)", open(log).read()); res[t]["tests"] = "%s/%s" % (r.group(1), r.group(3))
# the supplied baseline has only the stale template tests, which cannot run here
res["baseline"]["tests"] = "not_run"
json.dump(res, open("/home/claude/work/logs/metrics.json","w"), indent=1)
for k, v in res.items(): print(k, v)
