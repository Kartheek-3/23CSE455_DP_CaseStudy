#!/usr/bin/env bash
# Compile into a temporary directory (no class files are kept), run, and check output.
set -euo pipefail
cd "$(dirname "$0")"
BUILD=$(mktemp -d); trap 'rm -rf "$BUILD"' EXIT
javac -d "$BUILD" DesignPatterns.java
java -cp "$BUILD" DesignPatterns | python3 ../../tools/check_output.py Java
