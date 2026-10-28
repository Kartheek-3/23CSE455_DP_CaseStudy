#!/usr/bin/env bash
# Run the unchanged demonstration and check its output against the shared cases.
set -euo pipefail
cd "$(dirname "$0")"
python3 design_patterns.py | python3 ../../tools/check_output.py Python
