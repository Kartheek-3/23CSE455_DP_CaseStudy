#!/usr/bin/env python3
"""Before/after source metrics for CH01 with one tool (lizard 1.24.1) and one rule.
Run from the team folder: python3 Part2/changes/Change1/metrics/measure_ch01.py
NLOC = lizard's non-blank, non-comment lines. Tests are reported separately and are
not part of production LOC. The HTML template is reported as diff line counts only,
because lizard does not parse Django templates."""
import re, lizard, pathlib, csv, sys
root = pathlib.Path(__file__).resolve().parents[4]
B = root / "data/code/baseline_83998629/canteenapp"
E = root / "data/code/evolved_CH01/canteenapp"
rows = []
def fn(info, name):
    return next((f for f in info.function_list if f.name == name), None)
for label, base in (("baseline", B), ("after_CH01", E)):
    v = lizard.analyze_file(str(base / "views.py"))
    a = fn(v, "adminassignordertodelivery")
    rows.append([label, "canteenapp/views.py", "file NLOC", v.nloc])
    rows.append([label, "canteenapp/views.py", "adminassignordertodelivery NLOC", a.nloc])
    rows.append([label, "canteenapp/views.py", "adminassignordertodelivery CCN", a.cyclomatic_complexity])
    n = fn(v, "_notify_delivery_assignment")
    if n:
        rows.append([label, "canteenapp/views.py", "_notify_delivery_assignment NLOC/CCN", f"{n.nloc}/{n.cyclomatic_complexity}"])
    da = base / "delivery_assignment.py"
    if da.exists():
        d = lizard.analyze_file(str(da))
        rows.append([label, "canteenapp/delivery_assignment.py", "file NLOC", d.nloc])
        rows.append([label, "canteenapp/delivery_assignment.py", "max function CCN",
                     max(f.cyclomatic_complexity for f in d.function_list)])
        for f in d.function_list:
            rows.append([label, "canteenapp/delivery_assignment.py", f"{f.name} (line {f.start_line}) CCN", f.cyclomatic_complexity])
    t = base / "test_delivery_assignment.py"
    if t.exists():
        rows.append([label, "canteenapp/test_delivery_assignment.py (tests)", "file NLOC", lizard.analyze_file(str(t)).nloc])
diff = (root / "Part2/changes/Change1/CH01.diff").read_text(encoding="utf-8").split("\n")
cur = None; stats = {}
for line in diff:
    m = re.match(r"\+\+\+ b/(.*)", line)
    if m: cur = m.group(1); stats[cur] = [0, 0]; continue
    if line.startswith("--- "): continue
    if cur and line.startswith("+"): stats[cur][0] += 1
    elif cur and line.startswith("-"): stats[cur][1] += 1
for f, (add, rem) in stats.items():
    rows.append(["diff", f, "lines added / removed", f"{add} / {rem}"])
w = csv.writer(sys.stdout); w.writerow(["snapshot", "file", "metric", "value"]); w.writerows(rows)
