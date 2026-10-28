"""Recompute Part 3 production-code LOC and maximum function CCN.

Run from any directory with Python 3, cloc, and lizard installed. The script
updates A4/data/cross_language.csv and writes fresh raw tool output under
A4/Part3/evidence/recomputed_metrics/. It does not run or modify test runners.
"""

from __future__ import annotations

import csv
import subprocess
from pathlib import Path


HERE = Path(__file__).resolve().parent
TEAM_ROOT = HERE.parents[1]
CSV_PATH = TEAM_ROOT / "data" / "cross_language.csv"
OUT_DIR = HERE / "recomputed_metrics"
LANGUAGE_NOTES = {
    "Java": "Nominal interfaces, classes, and generics with JVM runtime object dispatch.",
    "Python": "ABC-based contracts with dynamic dispatch, built-in mappings, and first-class functions.",
    "JavaScript": "ES class syntax over prototype-based objects, dynamic values, modules, and runtime dispatch.",
    "C++": "Abstract base classes and virtual dispatch; templates, RAII, and shared ownership in these snippets.",
}
LOCAL_CHECKS = {
    "Java": "passed in this review on OpenJDK 17.0.10; saved measurements report OpenJDK 23.0.2",
    "Python": "passed in this review on Python 3.12.2; saved measurements report Python 3.11.9",
    "JavaScript": "passed in this review on Node.js 22.15.0; saved measurements report Node.js 22.16.0",
    "C++": "not run in this review: test runners require Windows headers; saved logs report MinGW GCC 6.3.0",
}


def run(command: list[str]) -> str:
    result = subprocess.run(
        command,
        cwd=TEAM_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout


def measure_loc(paths: list[str]) -> tuple[int, str]:
    output = run(["cloc", "--csv", "--quiet", *paths])
    total = None
    for row in csv.reader(output.splitlines()):
        if len(row) >= 5 and row[1] == "SUM":
            total = int(row[4])
    if total is None:
        raise RuntimeError(f"cloc did not report a SUM row for {paths!r}")
    return total, output


def measure_cc(paths: list[str]) -> tuple[int, str]:
    output = run(["lizard", "--csv", *paths])
    values: list[int] = []
    for row in csv.reader(output.splitlines()):
        if len(row) >= 2:
            try:
                values.append(int(row[1]))
            except ValueError:
                continue
    if not values:
        raise RuntimeError(f"lizard did not report function rows for {paths!r}")
    return max(values), output


def production_paths(row: dict[str, str]) -> list[str]:
    paths = [part.strip() for part in row["snippet_path"].split(";") if part.strip()]
    if row["language"] == "C++":
        primary = TEAM_ROOT / paths[0]
        header = primary.with_suffix(".hpp")
        relative_header = header.relative_to(TEAM_ROOT).as_posix()
        if not header.is_file():
            raise FileNotFoundError(header)
        if relative_header not in paths:
            paths.append(relative_header)
    for relative in paths:
        if not (TEAM_ROOT / relative).is_file():
            raise FileNotFoundError(TEAM_ROOT / relative)
    return paths


def main() -> None:
    if not CSV_PATH.is_file():
        raise FileNotFoundError(f"Expected canonical dataset at {CSV_PATH}")

    with CSV_PATH.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)
    if len(rows) != 24:
        raise ValueError(f"Expected 24 language rows, found {len(rows)}")

    for required in ("snippet_path", "source_loc", "max_function_cc", "language"):
        if required not in fieldnames:
            raise ValueError(f"Missing required CSV column: {required}")
    for field in ("timing_scope", "local_reproduction"):
        if field not in fieldnames:
            fieldnames.append(field)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    loc_log: list[str] = ["Source LOC recomputation", "Tool: cloc 2.10", ""]
    ccn_log: list[str] = ["Maximum function CCN recomputation", "Tool: lizard 1.24.1", ""]

    for row in rows:
        paths = production_paths(row)
        loc, loc_output = measure_loc(paths)
        ccn, ccn_output = measure_cc(paths)
        row["snippet_path"] = ";".join(paths)
        row["source_loc"] = str(loc)
        row["max_function_cc"] = str(ccn)
        row["timing_scope"] = (
            "Timer inside the test runner; excludes process, VM, and interpreter startup"
        )
        row["language_notes"] = LANGUAGE_NOTES[row["language"]]
        row["local_reproduction"] = LOCAL_CHECKS[row["language"]]
        loc_log.append(f"{row['pattern_name']} / {row['language']} / {row['snippet_path']}: {loc} code lines")
        loc_log.append(loc_output.rstrip())
        ccn_log.append(f"{row['pattern_name']} / {row['language']} / {row['snippet_path']}: max CCN {ccn}")
        ccn_log.append(ccn_output.rstrip())

    with CSV_PATH.open("w", encoding="utf-8", newline="") as stream:
        writer = csv.DictWriter(stream, fieldnames=fieldnames, lineterminator="\n")
        writer.writeheader()
        writer.writerows(rows)

    (OUT_DIR / "cloc_output.txt").write_text("\n\n".join(loc_log) + "\n", encoding="utf-8")
    (OUT_DIR / "lizard_output.csv.txt").write_text("\n\n".join(ccn_log) + "\n", encoding="utf-8")
    print(f"Updated {CSV_PATH} with {len(rows)} rows")
    print(f"Raw tool output: {OUT_DIR}")


if __name__ == "__main__":
    main()
