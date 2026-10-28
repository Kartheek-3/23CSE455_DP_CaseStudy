"""Extract one metrics.csv row from one raw lizard section of Part2/changes/metrics.log.

Usage: python lizard_metrics.py <metrics.log> <section-heading> <version> <folder> <tests_passed> <tests_total>
Prints: version,folder,source_files,nloc,functions,max_ccn,avg_ccn,tests_passed,tests_total
All numbers are read from lizard's own printed output (nothing is typed by hand):
  source_files = rows of lizard's per-file table
  nloc / functions / avg_ccn = lizard's 'Total nloc', 'Fun Cnt', 'AvgCCN' summary line
  max_ccn = highest CCN in lizard's per-function table
"""
import re
import sys

FUNC_ROW = re.compile(r"^\s*(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+\S+@\d+-\d+@\S+")
FILE_ROW = re.compile(r"^\s*\d+\s+[\d.]+\s+[\d.]+\s+[\d.]+\s+\d+\s+\S+$")


def section(lines, heading):
    out, inside = [], False
    for line in lines:
        if line.startswith("===== ") and line.rstrip().endswith(" ====="):
            inside = line.strip() == f"===== {heading} ====="
            continue
        if inside:
            out.append(line)
    return out


def main():
    log, heading, version, folder, passed, total = sys.argv[1:7]
    lines = section(open(log, encoding="utf-8").read().splitlines(), heading)
    if not lines:
        sys.exit(f"section '{heading}' not found")
    file_table_start = next(i for i, l in enumerate(lines) if l.split()[:2] == ["NLOC", "Avg.NLOC"])
    ccns = [int(m.group(2)) for l in lines[:file_table_start] if (m := FUNC_ROW.match(l))]
    files = 0
    for l in lines[file_table_start + 2:]:
        if FILE_ROW.match(l):
            files += 1
        elif l.startswith("="):
            break
    total_idx = next(i for i, l in enumerate(lines) if l.startswith("Total nloc"))
    nloc, _avg_nloc, avg_ccn, _avg_tok, fun_cnt = lines[total_idx + 2].split()[:5]
    print(f"{version},{folder},{files},{nloc},{fun_cnt},{max(ccns)},{avg_ccn},{passed},{total}")


if __name__ == "__main__":
    main()
