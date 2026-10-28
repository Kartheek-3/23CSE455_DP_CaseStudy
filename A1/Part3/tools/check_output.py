#!/usr/bin/env python3
"""Black-box test runner shared by the four Part 3 demonstrations.

Reads a program's standard output from stdin and checks it against
Part3/test-cases/cases.json and expected_output.txt.
Usage: <program> | python3 check_output.py <language>
Exit status 0 only when every case passes.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).resolve().parent
CASES_DIR = HERE.parent / "test-cases"


def main():
    language = sys.argv[1] if len(sys.argv) > 1 else "unknown"
    spec = json.loads((CASES_DIR / "cases.json").read_text(encoding="utf-8"))
    actual = sys.stdin.read().replace("\r\n", "\n")
    lines = actual.split("\n")
    totals = {}
    failed = 0
    for case in spec["cases"]:
        got = lines[case["line"] - 1] if len(lines) >= case["line"] else "<missing>"
        ok = got == case["expected"]
        passed, total = totals.get(case["pattern"], (0, 0))
        totals[case["pattern"]] = (passed + ok, total + 1)
        failed += not ok
        print(f"{'PASS' if ok else 'FAIL'} {case['id']} [{language}] line {case['line']}: {got!r}")
    whole = spec["whole_output_case"]
    expected = (CASES_DIR / whole["expected_file"]).read_text(encoding="utf-8")
    ok = actual.rstrip("\n") == expected.rstrip("\n")
    failed += not ok
    print(f"{'PASS' if ok else 'FAIL'} {whole['id']} [{language}] complete output")
    for pattern, (passed, total) in totals.items():
        print(f"SUMMARY {language} {pattern}: {passed}/{total} passed")
    print(f"SUMMARY {language} full-output: {int(ok)}/1 passed")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
