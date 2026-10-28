#!/usr/bin/env python3
"""Render Part3_Report.md as a readable PDF using macOS CUPS text conversion."""

from pathlib import Path
import re
import subprocess
import tempfile
import textwrap


HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / "Part3_Report.md"
OUTPUT = HERE.parent / "Part3_Report.pdf"


def plain_text(markdown: str) -> str:
    lines = []
    for raw in markdown.splitlines():
        line = raw.strip()
        if not line:
            lines.append("")
            continue
        if line.startswith("|---") or line.startswith("| ---"):
            continue
        if line.startswith("|") and line.endswith("|"):
            cells = [re.sub(r"\*\*|`", "", cell.strip()) for cell in line.strip("|").split("|")]
            line = " | ".join(cells)
        line = re.sub(r"\[([^]]+)\]\([^)]+\)", r"\1", line)
        line = re.sub(r"\*\*|__|`|[*#]", "", line)
        lines.extend(textwrap.wrap(line, width=94, break_long_words=True, break_on_hyphens=False) or [""])
    return "\n".join(lines) + "\n"


def main() -> None:
    if not SOURCE.is_file():
        raise SystemExit(f"Missing report source: {SOURCE}")
    content = plain_text(SOURCE.read_text(encoding="utf-8"))
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".txt") as temp:
        temp.write(content)
        temp.flush()
        with OUTPUT.open("wb") as pdf:
            subprocess.run(["cupsfilter", "-m", "application/pdf", temp.name], stdout=pdf, check=True)
    print(f"Rendered {OUTPUT}")


if __name__ == "__main__":
    main()
