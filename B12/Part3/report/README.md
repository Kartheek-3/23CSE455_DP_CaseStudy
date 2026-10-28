# Part 3 — Cross-language Comparison

Team B12. Patterns compared: **Strategy** (slot allocation), **State** (EV
charging session), **Observer** (slot occupancy notification), **Repository**
(user account persistence), **Dependency Injection** (notification channel
injection) and **Layered Architecture** (reservation request handling).
Languages: JavaScript, Python, Java, C++. All numbers are from real runs recorded
in `../evidence/` and in `../../data/cross_language.csv`.

## Results

| Pattern | Language | LOC | max CC | Test result | Median ms |
|---|---|---|---|---|---|
| Strategy | JavaScript | 75 | 5 | 5/5 | 80.866 |
| Strategy | Python | 49 | 6 | 5/5 | 112.122 |
| Strategy | Java | 77 | 7 | 5/5 | 185.646 |
| Strategy | C++ | 70 | 8 | 5/5 | 18.977 |
| State | JavaScript | 94 | 1 | 13/13 | 73.154 |
| State | Python | 57 | 1 | 13/13 | 67.420 |
| State | Java | 83 | 1 | 13/13 | 173.178 |
| State | C++ | 97 | 2 | 13/13 | 20.833 |
| Observer | JavaScript | 56 | 3 | 8/8 | 75.321 |
| Observer | Python | 33 | 3 | 8/8 | 65.179 |
| Observer | Java | 44 | 3 | 8/8 | 159.106 |
| Observer | C++ | 44 | 3 | 8/8 | 15.937 |
| Repository | JavaScript | 58 | 2 | 8/8 | 78.932 |
| Repository | Python | 43 | 1 | 8/8 | 104.625 |
| Repository | Java | 56 | 1 | 8/8 | 143.415 |
| Repository | C++ | 46 | 2 | 8/8 | 16.189 |
| Dependency Injection | JavaScript | 43 | 1 | 6/6 | 80.494 |
| Dependency Injection | Python | 25 | 1 | 6/6 | 45.405 |
| Dependency Injection | Java | 36 | 1 | 6/6 | 141.076 |
| Dependency Injection | C++ | 34 | 1 | 6/6 | 17.053 |
| Layered Architecture | JavaScript | 51 | 2 | 8/8 | 74.698 |
| Layered Architecture | Python | 34 | 3 | 8/8 | 89.697 |
| Layered Architecture | Java | 53 | 3 | 8/8 | 148.051 |
| Layered Architecture | C++ | 48 | 3 | 8/8 | 15.814 |

## Observations

- **Same behaviour, same tests.** Each pattern's identical cases pass in all four
  languages; the pattern's semantics do not depend on the language. Every snippet
  is paired with a language-native runner and the suite passes end to end.
- **LOC tracks verbosity, not difficulty.** Python is shortest in every pattern
  (duck typing / no interface boilerplate); Java and C++ are longest where
  explicit interfaces, type declarations and header guards require more lines.
  Dependency Injection is the smallest pattern (Python 25 / C++ 34 LOC) because
  it is pure wiring; State is the largest.
- **Cyclomatic complexity stays low; DI and State are the lowest.** Both move
  behaviour into injected/polymorphic collaborators, so the production snippets
  are branch-free (CC 1) in all languages except C++ State (a manual
  memory-management guard). Observer is 3 in every language (subscriber loop plus
  detach guard); the layered and repository snippets add only validation/lookup
  guards (CC 1–3).
- **Timing is dominated by process/VM startup,** not the snippet. Java's ~140-160
  ms is almost entirely JVM startup; Node ~65-105 ms; the statically linked native
  C++ binaries are fastest (~16-21 ms) by roughly an order of magnitude. These
  figures measure whole-process wall time and must not be read as algorithmic
  performance of the pattern.
- **Language-specific idioms:** JavaScript and Python express interfaces as
  abstract base classes (or duck typing); Java uses explicit `interface` types;
  C++ uses pure-virtual classes with `override` and stores collaborators by
  reference or `std::function`. Composition is done in a small composition root in
  every language.

See `../evidence/README.md` for the exact LOC, complexity and timing rules.
