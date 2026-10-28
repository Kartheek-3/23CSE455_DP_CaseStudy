#!/bin/sh
# Runs every compile, run and test command from the READMEs, from each language folder,
# and diffs every program's output against the shared expected-output.txt.
# Usage: sh run-all.sh   (from this part3/ folder). Exits 1 if anything failed.

cd "$(dirname "$0")" || exit 1
ROOT=$(pwd)
FAILED=0

step() {
    printf '\n$ %s\n' "$*"
    sh -c "$*" 2>&1
    status=$?
    echo "[exit $status]"
    [ "$status" -eq 0 ] || FAILED=1
}

in_dir() {
    cd "$ROOT/$1" || exit 1
    printf '\n========== %s ==========\n' "$1"
}

echo "== Tool versions =="
uname -sm
java -version 2>&1 | head -1
javac -version 2>&1
python3 --version
node --version
clang++ --version | head -1

# problem | java package | Java class prefix | input args | python test module | C++ sources (besides main.cpp / test_main.cpp)
PROBLEMS="
observer-test-listeners|observer|Observer|../test-data/events.txt|test_observer|listeners.cpp runner.cpp
composite-test-tree|composite|Composite|../test-data/tree.txt slow|test_composite|nodes.cpp tree_parser.cpp
strategy-test-filters|strategy|Strategy|../test-data/tests.txt|test_strategy|
adapter-listener-bridge|adapter|Adapter|../test-data/events.txt|test_adapter|
decorator-timeout-invocation|decorator|Decorator|../test-data/invocations.txt|test_decorator|
template-method-engine|template|Template|../test-data/tests.txt|test_template|
command-task-queue|command|Command|../test-data/tasks.txt|test_command|
null-object-listener|nullobject|NullObject|../test-data/tests.txt|test_nullobject|
chain-of-responsibility-interceptors|chain|Chain|../test-data/invocations.txt|test_chain|
factory-method-executors|factory|Factory|../test-data/tests.txt|test_factory|
"

echo "$PROBLEMS" | while IFS='|' read -r problem pkg cls args py_test cpp_src; do
    [ -n "$problem" ] || continue
    demo=${cls}Demo; test=${cls}Test; bin=$pkg
    [ "$pkg" = observer ] && demo=ObserverDemo
    js_test=$(ls "$ROOT/$problem/javascript/test" | head -1)
    expected="../test-data/expected-output.txt"

    in_dir "$problem/java"
    step "javac -d out src/$pkg/*.java test/$pkg/*.java"
    step "java -cp out $pkg.$demo $args | diff - $expected && echo same"
    step "java -cp out $pkg.$test"

    in_dir "$problem/python"
    step "python3 main.py $args | diff - $expected && echo same"
    step "python3 -m unittest -v $py_test"

    in_dir "$problem/javascript"
    step "node src/main.js $args | diff - $expected && echo same"
    step "node --test test/$js_test"

    in_dir "$problem/cpp"
    step "clang++ -std=c++20 -Wall -Wextra -pedantic -o $bin main.cpp $cpp_src"
    step "./$bin $args | diff - $expected && echo same"
    step "clang++ -std=c++20 -Wall -Wextra -pedantic -o ${bin}_test test_main.cpp $cpp_src"
    step "./${bin}_test"
    echo "$FAILED" > "$ROOT/.run-all-status"
done
FAILED=$(cat "$ROOT/.run-all-status"); rm -f "$ROOT/.run-all-status"

echo
[ "$FAILED" -eq 0 ] && echo "ALL STEPS PASSED" || echo "SOME STEPS FAILED"
exit "$FAILED"
