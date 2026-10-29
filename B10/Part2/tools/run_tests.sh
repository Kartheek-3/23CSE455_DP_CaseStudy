#!/usr/bin/env bash
# Usage: run_tests.sh <description> <output-log>
# Runs the full case-study suite in Part2/code and saves pytest's raw output unedited.
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$HERE/../code"
find_venv() { d="$1"; while [ ! -d "$d/.venv-mycodo" ]; do [ "$d" = "/" ] || [ "$d" = "$(dirname "$d")" ] && { echo ".venv-mycodo not found" >&2; exit 1; }; d="$(dirname "$d")"; done; echo "$d/.venv-mycodo"; }
PY="$(find_venv "$HERE")/Scripts/python.exe"
OUT="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"
cd "$WORK" || exit 1
{
  echo "\$ python -m pytest -p no:cacheprovider -v mycodo/tests/case_study   (Part2/code @ $(git rev-parse --short HEAD 2>/dev/null || echo bce41febb); $1)"
  "$PY" -m pytest -p no:cacheprovider -v mycodo/tests/case_study 2>&1
  echo "[exit code: $?]"
} > "$OUT"
tail -2 "$OUT"
