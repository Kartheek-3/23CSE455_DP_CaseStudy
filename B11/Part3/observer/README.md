# observer — cross-language snippets

Four implementations of the same pattern with identical inputs and outputs.

| Language | Run command (from this folder) |
|----------|-------------------------------|
| Java | `cd java && javac *.java && java <MainClass>` |
| Python | `python3 python/*.py` |
| JavaScript | `node javascript/*.js` |
| C++ | `cd cpp && g++ -O2 -std=c++17 -o out *.cpp && ./out` |

Shared test: all four must print the same lines (see ../../test_result/part3_output.txt).
Metrics (source_loc, max_function_cc, median_process_ms) are in ../data/cross_language.csv.
Timing rule: compile once, 1 warmup run, 5 measured runs, median reported. Regenerate with ../measure.py.
