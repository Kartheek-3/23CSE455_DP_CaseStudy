"""Checks that each line number cited by an AI answer really contains the claimed code.
Usage: python3 check_lines.py <claims.txt>   (run from B16/)
claims.txt lines:  <path relative to data/code>|<line>|<text that must appear on that line>
"""
import sys
from pathlib import Path
root = Path("data/code")
ok = bad = 0
for raw in Path(sys.argv[1]).read_text().splitlines():
    if not raw.strip() or raw.startswith("#"):
        continue
    path, line, text = raw.split("|", 2)
    lines = (root / path).read_text().splitlines()
    actual = lines[int(line) - 1] if int(line) <= len(lines) else ""
    if text in actual:
        ok += 1
    else:
        bad += 1
        near = [i + 1 for i, l in enumerate(lines) if text in l]
        print(f"MISMATCH {path}:{line} expected '{text}' | actual: '{actual.strip()[:70]}' | found at {near[:5]}")
print(f"{ok} correct, {bad} wrong")
