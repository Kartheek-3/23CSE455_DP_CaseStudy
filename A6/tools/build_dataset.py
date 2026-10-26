"""Builds data/*.csv from tools/pattern_data.py and the measured Part 3 results.

Run from the A6 folder:  python tools/build_dataset.py
"""
import csv
import json
import re
from collections import Counter
from pathlib import Path

import pattern_data as P

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"

BASE_COLS = ["source_version", "pattern_name", "pattern_type", "instance_name", "participant_roles",
             "source_locations", "intent_and_evidence"]
EVO_COLS = BASE_COLS + ["status_after_change", "change_description"]


def write(name, cols, rows):
    with open(DATA / name, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=cols, quoting=csv.QUOTE_MINIMAL)
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in cols})
    print(f"{name}: {len(rows)} rows")


def strip_moved_lines(locations):
    """Baseline locations re-pointed at Part2/code; line ranges dropped for files the changes touched."""
    out = []
    for loc in locations.split("; "):
        loc = loc.replace(P.B, P.E)
        path = loc.split(":")[0]
        rel = path.replace(P.E, "")
        out.append(path if rel in P.CHANGED_FILES else loc)
    return "; ".join(out)


def main():
    DATA.mkdir(exist_ok=True)
    baseline = [dict(r, source_version="Original code") for r in P.BASELINE]
    write("patterns.csv", BASE_COLS, baseline)

    evo = [dict(r, status_after_change="baseline", change_description="Public baseline c8766f4; no change.") for r in baseline]
    current = {r["instance_name"]: dict(r) for r in baseline}
    snapshots = {"Original code": list(current.values())}
    for snap in P.SNAPSHOTS:
        for prev in list(current.values()):
            key = (prev["instance_name"], snap)
            row = dict(prev, source_version=snap)
            if key in P.CHANGES:
                ch = P.CHANGES[key]
                row.update(status_after_change=ch["status"], change_description=ch["change"],
                           source_locations=ch["source_locations"])
            else:
                row.update(status_after_change="preserved", change_description="No participant change in this change.",
                           source_locations=strip_moved_lines(prev["source_locations"])
                           if prev["source_locations"].startswith(P.B) else prev["source_locations"])
            evo.append(row)
            current[row["instance_name"]] = row
        for s, new in P.NEW_INSTANCES:
            if s != snap:
                continue
            row = {k: v for k, v in new.items() if k not in ("status", "change")}
            row.update(source_version=snap, status_after_change=new["status"], change_description=new["change"])
            evo.append(row)
            current[row["instance_name"]] = row
        snapshots[snap] = [r for r in current.values() if r.get("status_after_change") != "removed"]
    write("patterns_evolution.csv", EVO_COLS, evo)

    counts = []
    for snap, rows in snapshots.items():
        per = Counter(r["pattern_name"] for r in rows)
        for name in sorted(per):
            counts.append(dict(source_version=snap, summary="per_pattern", pattern_name=name, count=per[name]))
        counts.append(dict(source_version=snap, summary="total_pattern_types", pattern_name="", count=len(per)))
        counts.append(dict(source_version=snap, summary="total_pattern_instances", pattern_name="", count=len(rows)))
    write("pattern_counts.csv", ["source_version", "summary", "pattern_name", "count"], counts)

    metrics = json.loads((ROOT / "Part3" / "evidence" / "cross_language_metrics.json").read_text(encoding="utf-8"))
    notes = json.loads((ROOT / "tools" / "language_notes.json").read_text(encoding="utf-8"))
    cross = [dict(m, language_notes=notes[m["pattern_name"]][m["language"]]) for m in metrics]
    write("cross_language.csv", ["pattern_name", "instance_name", "language", "snippet_path", "source_loc", "max_function_cc",
                                 "runtime_compiler", "test_command", "test_result", "median_process_ms", "language_notes"], cross)

    llm = json.loads((ROOT / "tools" / "llm_records.json").read_text(encoding="utf-8"))
    present = [r for r in llm if (ROOT / r["output_file"]).exists()]
    write("llm.csv", ["part", "model_and_date", "prompt_file", "input_file", "output_file", "evaluation", "verification_file"], present)
    missing = [r["output_file"] for r in llm if r not in present]
    if missing:
        print("LLM outputs not yet supplied (rows omitted):", ", ".join(missing))


if __name__ == "__main__":
    main()
