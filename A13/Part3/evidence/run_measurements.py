#!/usr/bin/env python3
"""Builds, tests, times and measures the Part 3 snippets.

Usage (from the team folder):  python3 Part3/evidence/run_measurements.py [pattern ...]
Needs: lizard (pip install lizard==1.24.1), a JDK, python3, node, g++.

For every pattern/language it
  1. runs the documented compile + test commands in the language folder and saves the log,
  2. runs one warm-up and five timed runs of the test process (compile excluded) and saves every run,
  3. measures production NLOC and per-function cyclomatic complexity with lizard,
  4. rewrites that pattern's four rows in data/cross_language.csv.
"""
import csv, datetime, glob, os, platform, re, shutil, statistics, subprocess, sys, time

TEAM = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CODE = os.path.join(TEAM, "Part3/code")
EVID = os.path.join(TEAM, "Part3/evidence")
OUT_CSV = os.path.join(TEAM, "data/cross_language.csv")
LANGS = [("java", "Java"), ("python", "Python"), ("javascript", "JavaScript"), ("cpp", "C++")]
META = {  # directory suffix -> (pattern_name, instance_name, fixture); names follow audit-input/patterns.csv
    "strategy": ("Strategy", "Logging Output Strategy"),
    "factory": ("Factory", "Logging Backend Factory"),
    "adapter": ("Adapter", "Telemetry Backend Adapter Layer"),
    "template_method": ("Template Method", "Misskey Chart Processing Framework"),
    "proxy": ("Proxy", "AnalyticsProxy"),
    "observer": ("Observer", "PreferencesManager Observer"),
    "two_level_cache": ("Two-Level Cache", "RedisSingleCache L1/L2 Cache"),
    "cache_aside": ("Cache-Aside / Lazy Loading", "Federated Instance Cache-Aside"),
    "publish_subscribe": ("Publish-Subscribe", "Global Redis Event Publication and Streaming Subscription"),
    "job_queue": ("Asynchronous Message Queue / Job Queue", "Federation Delivery Asynchronous Job Queue"),
    "front_controller": ("Front Controller", "Misskey API Front Controller"),
    "router": ("Router", "Nirax Frontend Router"),
    "service_layer": ("Service Layer", "Misskey Core Application Service Layer"),
    "plugin_architecture": ("Plugin Architecture / Microkernel", "Misskey Frontend Plugin Architecture"),
    "repository": ("Repository", "Misskey Persistence Repository Layer"),
}
ORDER = list(META)
HEADER = ["pattern_name", "instance_name", "language", "snippet_path", "source_loc", "max_function_cc",
          "runtime_compiler", "test_command", "test_result", "median_process_ms", "language_notes"]


def sh(cmd, cwd=None, shell=False):
    t = time.perf_counter()
    r = subprocess.run(cmd, cwd=cwd, shell=shell, capture_output=True, text=True)
    return r, (time.perf_counter() - t) * 1000


def versions():
    j = sh(["java", "-version"])[0].stderr.splitlines()[0]
    jv = re.search(r'"([^"]+)"', j).group(1)
    jc = sh(["javac", "-version"])[0].stdout.strip().split()[-1]
    gpp = sh(["g++", "--version"])[0].stdout.splitlines()[0]
    gv = re.search(r"\) (\S+ \d+)", gpp)
    return {
        "java": "OpenJDK %s (javac %s)" % (jv, jc),
        "python": sh(["python3", "--version"])[0].stdout.strip().replace("Python", "CPython"),
        "javascript": "Node.js " + sh(["node", "--version"])[0].stdout.strip(),
        "cpp": "g++ %s, -std=c++17" % (gv.group(1) if gv else gpp),
    }


def commands(lang, d, fixture):
    prod = [f for f in sorted(os.listdir(d)) if f != "README.md" and f != "build" and
            not re.search(r"(Test\.java|^test_.*\.py|\.test\.js|\.test\.cpp)$", f)][0]
    test = [f for f in sorted(os.listdir(d)) if f not in ("README.md", "build", prod)][0]
    fx = "../../../test-cases/%s.txt" % fixture
    if lang == "java":
        return prod, ["javac -d build *.java"], "java -cp build %s %s" % (test[:-5], fx)
    if lang == "python":
        return prod, [], "python3 -B %s %s" % (test, fx)
    if lang == "javascript":
        return prod, [], "node %s %s" % (test, fx)
    return prod, ["mkdir -p build", "g++ -std=c++17 -Wall -Wextra -o build/test %s" % test], "build/test %s" % fx


def measure_source(path, lang):
    import lizard, tempfile
    if lang == "javascript":
        # lizard 1.24.1 treats methods named get/set/delete as accessor keywords and drops the rest of the class.
        # Measure a temporary copy where those method names get a trailing underscore (LOC and CC are unaffected).
        text = re.sub(r"^(\s+)(get|set|delete)\(", r"\1\2_(", open(path, encoding="utf-8").read(), flags=re.M)
        with tempfile.TemporaryDirectory() as tmp:
            copy = os.path.join(tmp, os.path.basename(path))
            open(copy, "w", encoding="utf-8").write(text)
            info = lizard.analyze_file(copy)
    else:
        info = lizard.analyze_file(path)
    funcs = [(f.long_name, f.nloc, f.cyclomatic_complexity) for f in info.function_list]
    return info.nloc, funcs


def notes_of(readme):
    m = re.search(r"^\*\*Language notes:\*\*\s*(.+)$", open(readme, encoding="utf-8").read(), re.M)
    return m.group(1).strip() if m else ""


def main():
    pats = sys.argv[1:] or ORDER
    ver = versions()
    env = ["Measured: %s" % datetime.datetime.now().isoformat(timespec="seconds"),
           "Machine: %s, %s, %s" % (platform.platform(), platform.machine(),
                                   next((l.split(":")[1].strip() for l in open("/proc/cpuinfo") if l.startswith("model name")), "?")),
           "Cores: %d" % os.cpu_count()] + ["%s: %s" % (k, v) for k, v in ver.items()]
    import importlib.metadata as md
    env.append("lizard: " + md.version("lizard"))
    env.append("Source: Misskey 53ac6808ae4921305e761c545863ee6593edd1f4")
    open(os.path.join(EVID, "environment.txt"), "w").write("\n".join(env) + "\n")
    rows_new, raw_new, loc_new = {}, [], []
    for p in pats:
        pname, iname = META[p]
        for lang, lname in LANGS:
            d = os.path.join(CODE, "pattern_" + p, lang)
            prod, build, run = commands(lang, d, p)
            log = ["# %s / %s" % (p, lang), "# working folder: Part3/code/pattern_%s/%s" % (p, lang),
                   "# runtime: " + ver[lang]]
            shutil.rmtree(os.path.join(d, "build"), ignore_errors=True)
            ok = True
            for c in build:
                r, _ = sh(c, cwd=d, shell=True)
                log += ["$ " + c, r.stdout.rstrip(), r.stderr.rstrip()]
                ok = ok and r.returncode == 0
            result = "not_run (build failed)"
            if ok:
                r, _ = sh(run, cwd=d, shell=True)
                log += ["$ " + run, r.stdout.rstrip(), r.stderr.rstrip(), "# exit code %d" % r.returncode]
                m = re.search(r"passed (\d+)/(\d+)", r.stdout)
                result = ("%s/%s passed" % m.groups()) if m else "not_run (no result line)"
                if r.returncode != 0:
                    result = result.replace("passed", "passed, FAILED cases present")
                sh(run, cwd=d, shell=True)  # warm-up run, not recorded as a measurement
                times = []
                for i in range(5):
                    r2, ms = sh(run, cwd=d, shell=True)
                    times.append(ms)
                    raw_new.append([p, lang, "measured", i + 1, "%.3f" % ms, r2.returncode])
                median = "%.1f" % statistics.median(times)
                log.append("# timing: 1 warm-up + 5 runs, ms: " + ", ".join("%.1f" % t for t in times) + " -> median " + median)
            else:
                median = ""
            shutil.rmtree(os.path.join(d, "build"), ignore_errors=True)
            open(os.path.join(EVID, "test-logs", "%s_%s.log" % (p, lang)), "w").write("\n".join(log) + "\n")
            nloc, funcs = measure_source(os.path.join(d, prod), lang)
            for name, n, cc in funcs:
                loc_new.append([p, lang, prod, name, n, cc])
            test_command = " && ".join(build + [run]) + "   (working folder: Part3/code/pattern_%s/%s)" % (p, lang)
            rows_new[(p, lang)] = [pname, iname, lname, "Part3/code/pattern_%s/%s/%s" % (p, lang, prod), nloc,
                                   max(cc for _, _, cc in funcs), ver[lang], test_command, result, median,
                                   notes_of(os.path.join(d, "README.md"))]
            print(p, lang, nloc, max(cc for _, _, cc in funcs), result, median)
    # merge into the canonical CSV (rows of other patterns are kept)
    old = list(csv.reader(open(OUT_CSV, encoding="utf-8")))[1:]
    names = {META[p][0]: p for p in META}
    keep = {}
    for r in old:
        keep[(names.get(r[0]), r[2])] = r
    for (p, lang), r in rows_new.items():
        keep[(p, {"java": "Java", "python": "Python", "javascript": "JavaScript", "cpp": "C++"}[lang])] = r
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(HEADER)
        for p in ORDER:
            for _, lname in LANGS:
                if (p, lname) in keep:
                    w.writerow(keep[(p, lname)])
    # merge raw timing and LOC/CC evidence files
    for fname, header, new, keyidx in [("timing/raw_timing.csv", ["pattern", "language", "kind", "run", "elapsed_ms", "exit_code"], raw_new, 2),
                                       ("loc-cc/lizard_functions.csv", ["pattern", "language", "file", "function", "nloc", "ccn"], loc_new, 0)]:
        path = os.path.join(EVID, fname)
        old = list(csv.reader(open(path)))[1:] if os.path.exists(path) else []
        done = {r[0] for r in new}
        rows = [r for r in old if r[0] not in done] + new
        rows.sort(key=lambda r: ORDER.index(r[0]))
        with open(path, "w", newline="") as f:
            csv.writer(f).writerows([header] + rows)


main()
