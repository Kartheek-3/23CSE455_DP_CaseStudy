#!/usr/bin/env python3
"""Small reproducible LOC/CC counter used consistently across the case study."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

EXTENSIONS = {".php", ".java", ".py", ".js", ".mjs", ".cpp", ".hpp", ".h"}
DECISIONS = re.compile(r"\b(if|for|while|case|catch|except|elif)\b|&&|\|\||\?")


def source_lines(path: Path) -> list[str]:
    lines: list[str] = []
    in_block = False
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if in_block:
            if "*/" in line:
                line = line.split("*/", 1)[1].strip()
                in_block = False
            else:
                continue
        if line.startswith("/*"):
            if "*/" not in line[2:]:
                in_block = True
            continue
        if not line or line.startswith(("//", "#", "*")):
            continue
        lines.append(line)
    return lines


def metric(path: Path) -> dict[str, object]:
    lines = source_lines(path)
    decisions = sum(len(DECISIONS.findall(line)) for line in lines)
    return {"path": str(path), "source_loc": len(lines), "file_cc_upper_bound": 1 + decisions}


def main() -> None:
    root = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
    records = [metric(path) for path in sorted(root.rglob("*")) if path.is_file() and path.suffix in EXTENSIONS]
    print(json.dumps({"root": str(root), "rule": "nonblank noncomment physical LOC; CC upper bound = 1 + decision tokens per file", "files": records}, indent=2))


if __name__ == "__main__":
    main()
