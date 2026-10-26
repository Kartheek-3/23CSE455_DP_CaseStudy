"""Builds data/patterns.csv from Part1/evidence/part1_records.py.

Every participant's line range is found in data/code (declaration line -> matching closing brace),
so no line number is typed by hand. Run from B16/:  python3 data/build_part1_csv.py
"""
import csv
import re
import sys

sys.dont_write_bytecode = True  # no __pycache__ in the submission folder
from pathlib import Path

B16 = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(B16 / "Part1" / "evidence"))
from part1_records import INSTANCES  # noqa: E402

CODE = B16 / "data" / "code"
VERSION = "Original code"  # JUnit 6.1.3, commit f59f60d (see README)


def block_end(lines, start):
    depth, seen = 0, False
    for i in range(start, len(lines)):
        code = re.sub(r'"(\\.|[^"\\])*"', '""', lines[i]).split("//")[0]
        if not seen and ";" in code and "{" not in code:
            return i
        depth += code.count("{") - code.count("}")
        seen = seen or "{" in code
        if seen and depth <= 0:
            return i
    return start


def locate(symbol, path, token):
    lines = (CODE / path).read_text(encoding="utf-8").splitlines()
    is_method = "#" in symbol
    token = token or symbol.split("#")[-1].split(".")[-1]
    if is_method:
        pat = re.compile(r"(\w|>|\])\s+" + re.escape(token) + r"\s*\(")
        cands = [i for i, l in enumerate(lines) if pat.search(l) and not l.strip().startswith(("*", "//", "return"))]
    else:
        pat = re.compile(r"\b(class|interface|enum|record)\s+" + re.escape(token) + r"\b")
        cands = [i for i, l in enumerate(lines) if pat.search(l)]
    if not cands:
        raise SystemExit(f"NOT FOUND: {symbol} in {path}")
    decl = cands[0]
    return decl + 1, block_end(lines, decl) + 1


def main():
    rows = []
    for inst in INSTANCES:
        roles, locs = [], []
        for role, symbol, path, token in inst["parts"]:
            roles.append(f"{role}={symbol}")
            if path is None:
                locs.append(f"{symbol} (JDK)")
            else:
                start, end = locate(symbol, path, token)
                locs.append(f"data/code/{path}:{start}-{end}")
        rows.append([VERSION, inst["pattern"], inst["type"], f'{inst["id"]} {inst["name"]}', "; ".join(roles),
                     "; ".join(locs), inst["intent"]])
    with (B16 / "data" / "patterns.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["source_version", "pattern_name", "pattern_type", "instance_name", "participant_roles",
                    "source_locations", "intent_and_evidence"])
        w.writerows(rows)

    per = {}
    for inst in INSTANCES:
        per[inst["pattern"]] = per.get(inst["pattern"], 0) + 1
    # counts for every version (including this one) are written by data/build_part2_csv.py

    print(f"{len(INSTANCES)} instances, {len(per)} pattern types, "
          f"{sum(i['concrete'] for i in INSTANCES)} concrete participant classes")
    for name in sorted(per):
        print(f"  {name}: {per[name]}")


if __name__ == "__main__":
    main()
