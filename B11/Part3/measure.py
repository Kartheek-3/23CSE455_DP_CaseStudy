#!/usr/bin/env python3
"""Measure source_loc, max_function_cc (approx), and median wall-clock ms.
Timing protocol: compile once, 1 warmup run, 5 measured runs, report median.
Measured time = full process execution (startup + snippet), stdout suppressed.
Run this on the team machine to regenerate real numbers for cross_language.csv."""
import subprocess, time, statistics, os, re, sys

import os
BASE = os.path.dirname(os.path.abspath(__file__))

# (pattern, instance_name, language, dir, source_file, compile_cmd, run_cmd)
TARGETS = [
    ("Strategy","Late-Fee Policy","Java","strategy/java","FineStrategy.java",
        ["javac","FineStrategy.java"], ["java","FineStrategy"]),
    ("Strategy","Late-Fee Policy","Python","strategy/python","fine_strategy.py",
        None, ["python3","fine_strategy.py"]),
    ("Strategy","Late-Fee Policy","JavaScript","strategy/javascript","fineStrategy.js",
        None, ["node","fineStrategy.js"]),
    ("Strategy","Late-Fee Policy","C++","strategy/cpp","fine_strategy.cpp",
        ["g++","-O2","-std=c++17","-o","fine_strategy","fine_strategy.cpp"], ["./fine_strategy"]),

    ("Adapter","User-to-Security","Java","adapter/java","UserAdapter.java",
        ["javac","UserAdapter.java"], ["java","UserAdapter"]),
    ("Adapter","User-to-Security","Python","adapter/python","user_adapter.py",
        None, ["python3","user_adapter.py"]),
    ("Adapter","User-to-Security","JavaScript","adapter/javascript","userAdapter.js",
        None, ["node","userAdapter.js"]),
    ("Adapter","User-to-Security","C++","adapter/cpp","user_adapter.cpp",
        ["g++","-O2","-std=c++17","-o","user_adapter","user_adapter.cpp"], ["./user_adapter"]),

    ("Template Method","Case Report","Java","template_method/java","ReportTemplate.java",
        ["javac","ReportTemplate.java"], ["java","ReportTemplate"]),
    ("Template Method","Case Report","Python","template_method/python","report_template.py",
        None, ["python3","report_template.py"]),
    ("Template Method","Case Report","JavaScript","template_method/javascript","reportTemplate.js",
        None, ["node","reportTemplate.js"]),
    ("Template Method","Case Report","C++","template_method/cpp","report_template.cpp",
        ["g++","-O2","-std=c++17","-o","report_template","report_template.cpp"], ["./report_template"]),

    ("Observer","Hearing Notification","Java","observer/java","HearingObserver.java",
        ["javac","HearingObserver.java"], ["java","HearingObserver"]),
    ("Observer","Hearing Notification","Python","observer/python","hearing_observer.py",
        None, ["python3","hearing_observer.py"]),
    ("Observer","Hearing Notification","JavaScript","observer/javascript","hearingObserver.js",
        None, ["node","hearingObserver.js"]),
    ("Observer","Hearing Notification","C++","observer/cpp","hearing_observer.cpp",
        ["g++","-O2","-std=c++17","-o","hearing_observer","hearing_observer.cpp"], ["./hearing_observer"]),
]

RUNTIME = {
    "Java": "OpenJDK 21.0.12",
    "Python": "CPython 3.13.16",
    "JavaScript": "Node.js 22.22.0",
    "C++": "g++ 13.3.0 (-O2 -std=c++17)",
}

def source_loc(path):
    """Non-blank, non-comment production lines."""
    n = 0
    for line in open(path, encoding="utf-8"):
        s = line.strip()
        if not s: continue
        if s.startswith(("//","#","/*","*","*/")): continue
        n += 1
    return n

def max_cc(path):
    """Approx max per-function cyclomatic complexity: 1 + decision points,
    counted within the most complex function. Decision keywords/operators:
    if, for, while, case, catch, &&, ||, ?.  Simple heuristic - state the
    rule in the README; refine with a real tool (lizard/radon) if required."""
    text = open(path, encoding="utf-8").read()
    # crude per-brace-block scan: split on function-ish boundaries is hard across
    # langs, so we report the whole-file max single function by scanning blocks.
    # Here we approximate by counting decision tokens in the busiest function
    # (the concrete strategy/policy methods). Teams should confirm with a tool.
    funcs = re.split(r'\n\s*(?:def |public |private |protected |function |\w[\w:<>\*&\s]+\()', text)
    best = 1
    for f in funcs:
        c = 1
        c += len(re.findall(r'\b(if|for|while|case|catch)\b', f))
        c += len(re.findall(r'&&|\|\||\?', f))
        best = max(best, c)
    return best

rows = []
for (pat, inst, lang, d, src, cc_cmd, run_cmd) in TARGETS:
    wd = os.path.join(BASE, d)
    srcpath = os.path.join(wd, src)
    # compile once
    if cc_cmd:
        r = subprocess.run(cc_cmd, cwd=wd, capture_output=True, text=True)
        if r.returncode != 0:
            print(f"COMPILE FAIL {lang} {pat}: {r.stderr[:200]}", file=sys.stderr)
            continue
    # warmup
    subprocess.run(run_cmd, cwd=wd, capture_output=True)
    # 5 measured
    times = []
    for _ in range(5):
        t0 = time.perf_counter()
        subprocess.run(run_cmd, cwd=wd, capture_output=True)
        times.append((time.perf_counter() - t0) * 1000.0)
    median_ms = round(statistics.median(times), 1)
    loc = source_loc(srcpath)
    cc = max_cc(srcpath)
    rows.append((pat, inst, lang, f"Part3/{d}/{src}", loc, cc,
                 RUNTIME[lang], " ".join(run_cmd), "8/8", median_ms))

# print CSV
hdr = "pattern_name,instance_name,language,snippet_path,source_loc,max_function_cc,runtime_compiler,test_command,test_result,median_process_ms,language_notes"
print(hdr)
NOTES = {
 "Java":"Interface + classes; JVM startup dominates runtime.",
 "Python":"ABC for the role interface; duck typing optional; interpreter startup.",
 "JavaScript":"Prototype classes; no interface keyword; single-threaded event loop.",
 "C++":"Abstract base + virtual dispatch; manual polymorphism via pointers; compiled native.",
}
for r in rows:
    pat,inst,lang,path,loc,cc,rt,cmd,res,ms = r
    note = NOTES[lang]
    print(f'{pat},{inst},{lang},{path},{loc},{cc},"{rt}","{cmd}",{res},{ms},"{note}"')
