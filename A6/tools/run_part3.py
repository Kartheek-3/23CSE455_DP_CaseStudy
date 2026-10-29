"""Compiles, tests and times every Part 3 snippet, and measures LOC / cyclomatic complexity.

Usage (from the A6 folder):
    python tools/run_part3.py --lizard <path-to-lizard> --build <scratch-dir>

Timing rule: compile first (not timed); then 1 warm-up and 5 measured runs of the complete
test process; the median wall-clock time is reported. Java/Python/JavaScript run on the host
(Windows 11); C++ is compiled and run inside the gcc:13 Docker container on the same machine and
timed inside the container, so container start-up is excluded but process start-up is included,
as for the other languages.
"""
import argparse
import json
import re
import statistics
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PART3 = ROOT / "Part3"

PATTERNS = {
    "strategy_ride_fare": ("Strategy", "Ride Fare Pricing",
                           {"java": ("RideFare.java", "RideFareTest"), "python": ("ride_fare.py", "test_ride_fare.py"),
                            "javascript": ("ride_fare.js", "test_ride_fare.js"), "cpp": ("ride_fare.hpp", "test_ride_fare.cpp")}),
    "state_trip_lifecycle": ("State", "Trip Lifecycle and Cancellation",
                             {"java": ("TripLifecycle.java", "TripLifecycleTest"), "python": ("trip_lifecycle.py", "test_trip_lifecycle.py"),
                              "javascript": ("trip_lifecycle.js", "test_trip_lifecycle.js"), "cpp": ("trip_lifecycle.hpp", "test_trip_lifecycle.cpp")}),
    "observer_ride_notification": ("Observer", "Ride Event Notification",
                                   {"java": ("RideNotification.java", "RideNotificationTest"), "python": ("ride_notification.py", "test_ride_notification.py"),
                                    "javascript": ("ride_notification.js", "test_ride_notification.js"), "cpp": ("ride_notification.hpp", "test_ride_notification.cpp")}),
}
LANG_NAME = {"java": "Java", "python": "Python", "javascript": "JavaScript", "cpp": "C++"}
GCC_IMAGE = "gcc:13"


def sh(cmd, cwd=None):
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True)


def time_host(cmd, cwd):
    outputs, times = [], []
    for i in range(6):  # run 0 = warm-up
        t0 = time.perf_counter()
        r = sh(cmd, cwd)
        dt = (time.perf_counter() - t0) * 1000
        if i > 0:
            times.append(dt)
        outputs.append(r)
    return outputs[-1], times


def lizard_metrics(lizard, path):
    r = sh([lizard, "--csv", str(path)])
    rows = [line.split(",") for line in r.stdout.strip().splitlines() if line]
    max_cc = max((int(row[1]) for row in rows), default=1)
    # file NLOC (non-blank, non-comment lines) from the summary mode
    s = sh([lizard, str(path)]).stdout
    m = re.search(r"^\s*(\d+)\s+\d+\.\d+\s+\d+\.\d+\s+\d+\.\d+\s+\d+\s+\S*" + re.escape(path.name) + r"\s*$", s, re.M)
    nloc = int(m.group(1)) if m else None
    return nloc, max_cc, len(rows)


def versions():
    v = {}
    v["java"] = (sh(["java", "-version"]).stderr.splitlines() or ["?"])[0]
    v["javac"] = sh(["javac", "-version"]).stdout.strip() or sh(["javac", "-version"]).stderr.strip()
    v["python"] = sh([sys.executable, "--version"]).stdout.strip()
    v["node"] = sh(["node", "--version"]).stdout.strip()
    v["g++"] = sh(["docker", "run", "--rm", GCC_IMAGE, "g++", "--version"]).stdout.splitlines()[0]
    v["docker"] = sh(["docker", "--version"]).stdout.strip()
    return v


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lizard", required=True)
    ap.add_argument("--build", required=True)
    args = ap.parse_args()
    build = Path(args.build)
    build.mkdir(parents=True, exist_ok=True)

    ver = versions()
    runtime = {"java": ver["java"].replace('"', ""), "python": ver["python"], "javascript": "Node.js " + ver["node"],
               "cpp": ver["g++"] + " -std=c++20 -O2 (Docker " + GCC_IMAGE + ")"}
    results, raw = [], []
    for folder, (pattern, instance, langs) in PATTERNS.items():
        for lang, (prod, test) in langs.items():
            d = PART3 / folder / lang
            rel = d.relative_to(ROOT).as_posix()
            if lang == "java":
                out = build / folder
                c = sh(["javac", "-d", str(out), prod, test + ".java"], cwd=d)
                assert c.returncode == 0, c.stderr
                last, times = time_host(["java", "-cp", str(out), test], d)
                cmd = f"cd {rel} && javac -d <build> {prod} {test}.java && java -cp <build> {test}"
            elif lang == "python":
                last, times = time_host([sys.executable, test], d)
                cmd = f"cd {rel} && python {test}"
            elif lang == "javascript":
                last, times = time_host(["node", test], d)
                cmd = f"cd {rel} && node {test}"
            else:
                script = (f"g++ -std=c++20 -O2 -Wall -Wextra /src/{test} -o /tmp/t && "
                          "for i in 0 1 2 3 4 5; do s=$(date +%s%N); /tmp/t > /tmp/out.txt; rc=$?; e=$(date +%s%N); "
                          "echo TIME $i $(( (e-s)/1000 )) $rc; done; cat /tmp/out.txt")
                r = sh(["docker", "run", "--rm", "-v", f"{d.as_posix()}:/src:ro", GCC_IMAGE, "bash", "-c", script])
                assert "TIME 5" in r.stdout, r.stdout + r.stderr
                times = [int(m.group(2)) / 1000 for m in re.finditer(r"^TIME (\d) (\d+) (\d+)$", r.stdout, re.M)
                         if m.group(1) != "0"]
                last = subprocess.CompletedProcess([], 0, r.stdout.split("TIME 5")[1].split("\n", 1)[1], r.stderr)
                cmd = f"cd {rel} && g++ -std=c++20 -O2 -Wall -Wextra {test} -o test_bin && ./test_bin"
            m = re.search(r"RESULT (\d+)/(\d+) passed", last.stdout)
            test_result = f"{m.group(1)}/{m.group(2)} passed" if m else "failed"
            nloc, max_cc, nfunc = lizard_metrics(args.lizard, d / prod)
            median = round(statistics.median(times), 1)
            results.append(dict(pattern_name=pattern, instance_name=instance, language=LANG_NAME[lang],
                                snippet_path=f"{rel}/{prod}", source_loc=nloc, max_function_cc=max_cc,
                                runtime_compiler=runtime[lang], test_command=cmd, test_result=test_result,
                                median_process_ms=median, functions=nfunc,
                                runs_ms=[round(t, 1) for t in times]))
            raw.append(f"=== {pattern} / {LANG_NAME[lang]} ({rel})\ncommand: {cmd}\n"
                       f"measured runs (ms, warm-up excluded): {[round(t, 1) for t in times]}\nmedian: {median} ms\n"
                       f"lizard: NLOC={nloc} functions={nfunc} max CCN={max_cc}\n--- test output (last run) ---\n"
                       f"{last.stdout.strip()}\n")
            print(f"{pattern:9s} {LANG_NAME[lang]:10s} {test_result:12s} loc={nloc} cc={max_cc} median={median}ms")

    ev = PART3 / "evidence"
    ev.mkdir(exist_ok=True)
    stamp = time.strftime("%Y-%m-%dT%H:%M:%S%z")
    (ev / "cross_language_runs.txt").write_text(f"# Part 3 runs, {stamp}\n# timing rule: see tools/run_part3.py docstring\n\n"
                                               + "\n".join(raw), encoding="utf-8")
    (ev / "cross_language_metrics.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    (ev / "environment_versions.txt").write_text("\n".join(f"{k}: {v}" for k, v in ver.items())
                                                 + f"\nlizard: {sh([args.lizard, '--version']).stdout.strip()}\n"
                                                 + "host OS: Windows 11 Home 10.0.26300\n", encoding="utf-8")


if __name__ == "__main__":
    main()
