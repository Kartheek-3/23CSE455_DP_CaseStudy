#!/usr/bin/env python3
"""Static and dynamic measurement of the four Part 3 demonstrations.

Run from the Part3 folder:  python3 tools/measure.py
Writes raw and summary results to Part3/evidence/.

Static rules
  * source_loc: non-blank lines that are not comment-only lines (the demos
    contain no comments). Lines are attributed to Observer, Strategy or shared
    scaffolding by the markers in PARTITION below.
  * max_function_cc: maximum per-function cyclomatic complexity (CCN) reported
    by lizard (https://github.com/terryyin/lizard) for functions whose start
    line falls in that pattern's line set.
Dynamic rules
  * Compile first (Java, C++) into a temporary directory outside the submission.
  * One warm-up run, then five measured runs of the complete process on the
    same machine; the median of the five is reported.
  * Elapsed time is wall-clock time around subprocess.run(): it includes
    process start-up, runtime/VM initialisation, execution of BOTH pattern
    sections (the programs are combined demonstrations) and capture of
    standard output. It excludes compilation.
  * Every measured run's output is compared with test-cases/expected_output.txt.
"""
import csv
import json
import os
import pathlib
import re
import shutil
import statistics
import subprocess
import tempfile
import time

import lizard

PART3 = pathlib.Path(__file__).resolve().parent.parent
DEMO = PART3 / "order_events_and_delivery_selection"
EVIDENCE = PART3 / "evidence"
EXPECTED = (PART3 / "test-cases" / "expected_output.txt").read_text(encoding="utf-8")
ENV = {k: v for k, v in os.environ.items() if k != "JAVA_TOOL_OPTIONS"}

LANGS = {
    "Java": {"file": DEMO / "java" / "DesignPatterns.java",
             "compile": lambda b, f: ["javac", "-d", str(b), str(f)],
             "run": lambda b, f: ["java", "-cp", str(b), "DesignPatterns"],
             "driver": r"public class DesignPatterns"},
    "Python": {"file": DEMO / "python" / "design_patterns.py",
               "compile": None,
               "run": lambda b, f: ["python3", str(f)],
               "driver": r'^print\("Observer:"\)'},
    "JavaScript": {"file": DEMO / "javascript" / "design-patterns.js",
                   "compile": None,
                   "run": lambda b, f: ["node", str(f)],
                   "driver": r'^console\.log\("Observer:"\)'},
    "C++": {"file": DEMO / "cpp" / "design_patterns.cpp",
            "compile": lambda b, f: ["g++", str(f), "-o", str(b / "design_patterns")],
            "run": lambda b, f: [str(b / "design_patterns")],
            "driver": r"^int main\(\)"},
}


def is_code(line, lang):
    s = line.strip()
    if not s:
        return False
    if lang == "Python" and s.startswith("#"):
        return False
    if lang != "Python" and (s.startswith("//") or s.startswith("/*") or s.startswith("*")):
        return False
    return True


def partition(lines, lang, driver_pattern):
    """Return {line_no: 'Observer'|'Strategy'|'shared'} for code lines."""
    def first(pattern):
        for i, l in enumerate(lines, 1):
            if re.search(pattern, l):
                return i
        raise ValueError(pattern)
    obs_start = first(r"(class|interface) Observer\b")
    strat_start = first(r"class DeliveryPartner\b")
    driver = first(driver_pattern)
    obs_main = first(r'"Observer:"')
    strat_main = first(r'Strategy:"')
    last_assign = max(i for i, l in enumerate(lines, 1) if re.search(r"assign(Order|_order)\(partners\)", l) and i > strat_main)
    roles = {}
    for i, l in enumerate(lines, 1):
        if not is_code(l, lang):
            continue
        if obs_start <= i < strat_start:
            roles[i] = "Observer"
        elif strat_start <= i < driver:
            roles[i] = "Strategy"
        elif obs_main <= i < strat_main:
            roles[i] = "Observer"
        elif strat_main <= i <= last_assign:
            roles[i] = "Strategy"
        else:
            roles[i] = "shared"
    return roles


def static_metrics():
    rows = []
    for lang, cfg in LANGS.items():
        path = cfg["file"]
        lines = path.read_text(encoding="utf-8").split("\n")
        roles = partition(lines, lang, cfg["driver"])
        info = lizard.analyze_file(str(path))
        for fn in info.function_list:
            role = roles.get(fn.start_line, "shared")
            rows.append({"language": lang, "file": str(path.relative_to(PART3.parent)),
                         "function": fn.long_name, "start_line": fn.start_line,
                         "end_line": fn.end_line, "ccn": fn.cyclomatic_complexity,
                         "nloc": fn.nloc, "attributed_to": role})
        cfg["roles"] = roles
        cfg["lizard_file_nloc"] = info.nloc
    with open(EVIDENCE / "lizard_functions.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    summary = []
    for lang, cfg in LANGS.items():
        roles = cfg["roles"]
        for pattern in ("Observer", "Strategy", "shared"):
            loc = sum(1 for r in roles.values() if r == pattern)
            ccs = [r["ccn"] for r in rows if r["language"] == lang and r["attributed_to"] == pattern]
            summary.append({"language": lang, "scope": pattern, "source_loc": loc,
                            "max_function_cc": max(ccs) if ccs else "",
                            "functions_counted": len(ccs)})
        summary.append({"language": lang, "scope": "whole_file", "source_loc": len(roles),
                        "max_function_cc": max(r["ccn"] for r in rows if r["language"] == lang),
                        "functions_counted": sum(1 for r in rows if r["language"] == lang)})
        summary.append({"language": lang, "scope": "lizard_file_nloc", "source_loc": cfg["lizard_file_nloc"],
                        "max_function_cc": "", "functions_counted": ""})
    with open(EVIDENCE / "static_metrics.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(summary[0].keys()))
        w.writeheader()
        w.writerows(summary)
    with open(EVIDENCE / "line_partition.json", "w", encoding="utf-8") as fh:
        json.dump({lang: {str(k): v for k, v in cfg["roles"].items()} for lang, cfg in LANGS.items()}, fh, indent=1)


def timing():
    raw, summary = [], []
    for lang, cfg in LANGS.items():
        build = pathlib.Path(tempfile.mkdtemp(prefix="a1_part3_"))
        try:
            if cfg["compile"]:
                c = subprocess.run(cfg["compile"](build, cfg["file"]), capture_output=True, text=True, env=ENV)
                if c.returncode != 0:
                    raise SystemExit(f"{lang} compile failed: {c.stderr}")
            cmd = cfg["run"](build, cfg["file"])
            times = []
            for run in range(6):
                t0 = time.perf_counter_ns()
                p = subprocess.run(cmd, capture_output=True, text=True, env=ENV)
                elapsed = (time.perf_counter_ns() - t0) / 1e6
                ok = p.returncode == 0 and p.stdout.rstrip("\n") == EXPECTED.rstrip("\n")
                kind = "warmup" if run == 0 else "measured"
                raw.append({"language": lang, "run": run, "kind": kind,
                            "elapsed_ms": f"{elapsed:.3f}", "exit_code": p.returncode,
                            "output_matches_expected": ok})
                if kind == "measured":
                    times.append(elapsed)
            summary.append({"language": lang, "measured_runs": len(times),
                            "median_process_ms": f"{statistics.median(times):.1f}",
                            "min_ms": f"{min(times):.1f}", "max_ms": f"{max(times):.1f}",
                            "scope": "combined Observer+Strategy demonstration process"})
        finally:
            shutil.rmtree(build, ignore_errors=True)
    with open(EVIDENCE / "timing_raw.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(raw[0].keys()))
        w.writeheader()
        w.writerows(raw)
    with open(EVIDENCE / "timing_summary.csv", "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=list(summary[0].keys()))
        w.writeheader()
        w.writerows(summary)


def versions():
    cmds = {"java": ["java", "-version"], "javac": ["javac", "-version"],
            "python3": ["python3", "--version"], "node": ["node", "--version"],
            "g++": ["g++", "--version"], "lizard": ["python3", "-m", "lizard", "--version"],
            "uname": ["uname", "-srm"]}
    with open(EVIDENCE / "toolchain_versions.txt", "w", encoding="utf-8") as fh:
        for name, cmd in cmds.items():
            p = subprocess.run(cmd, capture_output=True, text=True, env=ENV)
            out = (p.stdout + p.stderr).strip().splitlines()
            fh.write(f"{name}: {out[0] if out else ''}\n")


if __name__ == "__main__":
    EVIDENCE.mkdir(exist_ok=True)
    versions()
    static_metrics()
    timing()
    print((EVIDENCE / "static_metrics.csv").read_text())
    print((EVIDENCE / "timing_summary.csv").read_text())
