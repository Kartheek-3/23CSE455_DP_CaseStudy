#!/usr/bin/env bash
# Compile with the team's recorded command into a temporary directory, run, and check output.
set -euo pipefail
cd "$(dirname "$0")"
BUILD=$(mktemp -d); trap 'rm -rf "$BUILD"' EXIT
g++ design_patterns.cpp -o "$BUILD/design_patterns"
"$BUILD/design_patterns" | python3 ../../tools/check_output.py C++
