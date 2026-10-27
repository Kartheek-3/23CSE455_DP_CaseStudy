#!/usr/bin/env bash
# Usage: run_tests.sh <app-dir> <out-dir> <TestClass...>
# Compiles the application's REAL main sources against Jakarta API stubs, compiles its tests with a
# JUnit-5 shim, and runs them with MiniRunner. Sandbox substitute for `mvn test` (Maven Central is unreachable here).
set -euo pipefail
export JAVA_TOOL_OPTIONS=
H="$(cd "$(dirname "$0")" && pwd)"; APP="$1"; OUT="$2"; shift 2
rm -rf "$OUT"; mkdir -p "$OUT/classes"
find "$H/stubs" "$H/junit-shim" "$H/runner" -name '*.java' > "$OUT/sources.txt"
find "$APP/src/main/java" -name '*.java' >> "$OUT/sources.txt"
[ -d "$APP/src/test/java" ] && find "$APP/src/test/java" -name '*.java' ! -path '*org/acme*' >> "$OUT/sources.txt"
javac --release 17 -parameters -encoding UTF-8 -d "$OUT/classes" @"$OUT/sources.txt"
java -cp "$OUT/classes" MiniRunner "$@"
