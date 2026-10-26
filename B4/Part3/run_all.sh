#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BUILD="${ROOT}/evidence/build"
mkdir -p "$BUILD"

run_case() {
  local label="$1"
  local warmup="$2"
  local command="$3"
  printf '%s\n' "$label"
  bash -lc "$warmup" >/dev/null
  local times=()
  for _ in 1 2 3 4 5; do
    local start end
    start="$(date +%s%N)"
    bash -lc "$command"
    end="$(date +%s%N)"
    times+=("$(( (end - start) / 1000000 ))")
  done
  printf 'times_ms=%s\n' "${times[*]}"
  printf 'median_ms=%s\n' "$(printf '%s\n' "${times[@]}" | sort -n | sed -n '3p')"
}

javac -d "$BUILD/strategy-java" "$ROOT/strategy/java/Pricing.java" "$ROOT/strategy/java/PricingTest.java"
javac -d "$BUILD/spec-java" "$ROOT/filter_specification/java/PropertyFilter.java" "$ROOT/filter_specification/java/PropertyFilterTest.java"
g++ -std=c++20 -O2 "$ROOT/strategy/cpp/test_pricing.cpp" -o "$BUILD/strategy-cpp"
g++ -std=c++20 -O2 "$ROOT/filter_specification/cpp/test_property_filter.cpp" -o "$BUILD/spec-cpp"

run_case "Strategy|Java" "java -cp '$BUILD/strategy-java' PricingTest" "java -cp '$BUILD/strategy-java' PricingTest"
run_case "Strategy|Python" "cd '$ROOT/strategy/python' && python3 test_pricing.py" "cd '$ROOT/strategy/python' && python3 test_pricing.py"
run_case "Strategy|JavaScript" "node '$ROOT/strategy/javascript/test_pricing.mjs'" "node '$ROOT/strategy/javascript/test_pricing.mjs'"
run_case "Strategy|C++" "'$BUILD/strategy-cpp'" "'$BUILD/strategy-cpp'"
run_case "Specification|Java" "java -cp '$BUILD/spec-java' PropertyFilterTest" "java -cp '$BUILD/spec-java' PropertyFilterTest"
run_case "Specification|Python" "cd '$ROOT/filter_specification/python' && python3 test_property_filter.py" "cd '$ROOT/filter_specification/python' && python3 test_property_filter.py"
run_case "Specification|JavaScript" "node '$ROOT/filter_specification/javascript/test_property_filter.mjs'" "node '$ROOT/filter_specification/javascript/test_property_filter.mjs'"
run_case "Specification|C++" "'$BUILD/spec-cpp'" "'$BUILD/spec-cpp'"

