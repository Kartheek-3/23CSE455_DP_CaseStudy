#!/usr/bin/env bash
# Usage: snapshot.sh <ChangeN> <version label> [extra copy dir]
# Step f: copy the files in metrics_files.txt from Part2/code to Part2/changes/<ChangeN>/code/ (and to the
# optional extra dir), run lizard on the copies, append the raw output to metrics.log under the heading
# "<ChangeN>", and add a metrics.csv row. Test counts come from pytest's summary in raw/3_after_step_c.log.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"          # Part2
N="$1"; LABEL="$2"; EXTRA="$3"
find_venv() { d="$1"; while [ ! -d "$d/.venv-mycodo" ]; do [ "$d" = "/" ] || [ "$d" = "$(dirname "$d")" ] && { echo ".venv-mycodo not found" >&2; exit 1; }; d="$(dirname "$d")"; done; echo "$d/.venv-mycodo"; }
VENV="$(find_venv "$ROOT")"
DEST="$ROOT/changes/$N/code"
for f in $(cat "$ROOT/changes/metrics_files.txt"); do
  mkdir -p "$DEST/$(dirname "$f")"; cp "$ROOT/code/$f" "$DEST/$f"
  if [ -n "$EXTRA" ]; then mkdir -p "$EXTRA/$(dirname "$f")"; cp "$ROOT/code/$f" "$EXTRA/$f"; fi
done
cd "$DEST"
{ echo; echo "===== $N ====="
  echo "# command: lizard <files in Part2/changes/metrics_files.txt>   (run in Part2/changes/$N/code = copies from Part2/code @ $(git -C "$ROOT/code" rev-parse --short HEAD 2>/dev/null || echo bce41febb))"
  "$VENV/Scripts/lizard.exe" $(cat "$ROOT/changes/metrics_files.txt"); } >> "$ROOT/changes/metrics.log" 2>&1 || true
SUM=$(grep -E "^=+ .* in [0-9.]+s" "$ROOT/changes/$N/raw/3_after_step_c.log" | tail -1)
PASSED=$(echo "$SUM" | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo 0)
FAILED=$(echo "$SUM" | grep -oE "[0-9]+ failed" | grep -oE "[0-9]+" || echo 0)
"$VENV/Scripts/python.exe" "$ROOT/tools/lizard_metrics.py" "$ROOT/changes/metrics.log" "$N" "$LABEL" "Part2/changes/$N/code" "$PASSED" "$((PASSED + FAILED))" | tee -a "$ROOT/changes/metrics.csv"
echo "copied $(find "$DEST" -type f | wc -l) files to $DEST"
