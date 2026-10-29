# Verification - K_Harish_output_02.md (cross-language Strategy, ChatGPT free tier, 2026-10-11)

Topic owner: K Harish. Run and checked from Dilip Kumar Reddy's session (Claude Code drove the browser).
Method: the four code blocks were extracted unchanged and compiled/run with `tools/run_llm_code.py`
(log: `prompts/K_Harish_coderun_02.txt`); size claims were measured with lizard 1.17.13, the same tool as Part 3.

| Claim / artefact | Verdict | Evidence |
|---|---|---|
| Java, Python, JavaScript, C++ implementations satisfy S1-S8 | correct | all four exit 0 and print the 8 expected results (`K_Harish_coderun_02.txt`); C++ compiled with `-Wall -Wextra -pedantic`, no warnings |
| Same five participants in every language; Strategy realised by composition (calculator holds a registry) | correct | matches the code and our `Part3/strategy_ride_fare` |
| Java/C++ enforce the contract nominally, Python/JS by duck typing | correct | same observation recorded in `data/cross_language.csv` language_notes |
| C++ ownership through `unique_ptr`, others garbage-collected | correct | code; our C++ version also uses `unique_ptr` |
| "Python shortest, C++ longest" | correct for its own code, partial in general | its files (tests included): Python 76, JS 94, Java 109, C++ 114 NLOC. Our production-only files: JS 47 < Python 51 < Java 57 < C++ 69, so JS, not Python, is shortest when tests are separated |
| Comparison table: "Inheritance vs composition: Both" for JavaScript | incorrect | its JS strategies are plain classes with no `extends`; JS uses composition only |
| "Add `#include <algorithm>` for `std::max`" | correct | it compiled with gcc 13 only through transitive includes; the note is a valid portability fix |
| Returning `FareCalculator` relies on move semantics | correct | the class holds `unique_ptr`s and is move-only; compiles under C++17 |
| Fares truncated with `(long)` / `static_cast` | design difference | spec fixtures are integral; our versions round. Not an error for the given fixtures; ChatGPT itself flags the missing rounding policy |

Overall evaluation: **partial** - all generated code is correct and passes every fixture; one comparison-table
entry is wrong and the size ranking does not transfer to production-only code.

Reviewer signature/date (K Harish): ______________________________
