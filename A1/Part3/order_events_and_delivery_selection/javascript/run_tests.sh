#!/usr/bin/env bash
# Run the unchanged demonstration and check its output against the shared cases.
set -euo pipefail
cd "$(dirname "$0")"
node design-patterns.js | python3 ../../tools/check_output.py JavaScript
