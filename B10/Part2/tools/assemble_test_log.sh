#!/usr/bin/env bash
# Usage: assemble_test_log.sh <ChangeN dir>
# Builds <dir>/test_result.log from the raw pytest logs in <dir>/raw/ (0_before, 1_after_step_a,
# 2_after_step_b, 3_after_step_c). The pass counts in the header are copied from pytest's own
# summary line of each raw log; the raw logs are appended unedited.
D="$1"
summary() { grep -E "^=+ .*(passed|failed|error|no tests ran).* in [0-9.]+s" "$1" | tail -1 | sed -E 's/^=+ //; s/ =+$//'; }
head_of() { head -1 "$1" | sed -E 's/^\$ //'; }
{
  echo "# $(basename "$D") test results"
  echo "# Command (run in Part2/code with the venv .venv-mycodo from a parent folder):"
  echo "#   python -m pytest -p no:cacheprovider -v mycodo/tests/case_study"
  echo "# Pass counts (pytest summary line of each raw run below):"
  echo "#   before the change : $(summary "$D/raw/0_before.log")"
  echo "#   after step a      : $(summary "$D/raw/1_after_step_a.log")"
  echo "#   after step b      : $(summary "$D/raw/2_after_step_b.log")"
  echo "#   after step c      : $(summary "$D/raw/3_after_step_c.log")"
  echo "# The raw, unedited pytest output of each run follows."
  echo
  for f in 0_before 1_after_step_a 2_after_step_b 3_after_step_c; do
    echo "################ raw/$f.log ################"
    cat "$D/raw/$f.log"
    echo
  done
} > "$D/test_result.log"
sed -n 1,10p "$D/test_result.log"
