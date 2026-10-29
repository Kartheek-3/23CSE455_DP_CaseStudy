# Original handoff for Soorya: Java and C++

I wrote this before Soorya added his code. His Java and C++ examples are now in
`strategy/` and `observer/`. They use a separate set of inputs
and expected results, so the four-language comparison still needs one shared
test specification.

I finished the Python and JavaScript examples for Strategy and Observer. Please
make Java and C++ versions of these same two examples. The app code that led to
the choice is listed in `../Part1/patterns.csv`.

Each pattern folder has a `specification.md` and `fixtures.json`. Please use
those files as the rules for your code. The four languages need to give the
same result for every test case, including the error cases. Do not put answers
from the test file directly into the program.

Please put your code, tests and a short README in `java/` and `cpp/` inside
each pattern folder. Keep the program separate from its tests. Each program
should take one JSON file path as an argument and print one JSON result. Use
`benchmark_input.json` when you measure run time.

For each Java and C++ version, please send me:

1. Your branch or commit and the code path.
2. The exact commands to compile, run and test it.
3. A test log with the number of cases passed.
4. Code lines and highest function cyclomatic complexity, measured with Lizard.
5. One warm-up run and five timed runs on the same computer used for the other
   languages. Save all five times and their median in milliseconds. Time the
   whole process, including startup and reading the JSON file. Do not include
   compilation.

I will add Java and C++ to `../data/cross_language.csv` after checking your
code and results. Please leave my Python and JavaScript files and `../code/`
unchanged.
