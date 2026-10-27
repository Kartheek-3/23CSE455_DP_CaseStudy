# Representative Strategy and Observer comparison

This folder preserves the original combined fixture used for the cross-language measurements. It demonstrates both Currency Settlement Strategy and Transaction Completion Notification Observer in one program per language.

Run from the relevant language folder:

- Java: `javac PatternDemos.java && java PatternDemos`
- Python: `python pattern_demos.py`
- JavaScript: `node pattern_demos.js`
- C++: `g++ -std=c++17 pattern_demos.cpp -o pattern_demos && ./pattern_demos`

Execution outputs and process timing are retained in `../evidence/`. The full metric records refer to these source files in `../../data/cross_language.csv`.

For one-pattern-per-directory examples, return to the [Part 3 README](../README.md).
