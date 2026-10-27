# Part 3 scope — evidence-based decision note (B12)

Date: 2026-10-10
Author: Team B12

Status: **RESOLVED — expanded to all confirmed pattern types.** The literal
reading of the instruction ("for each detected pattern type") was adopted, so
Part 3 now implements one representative instance of **all six confirmed pattern
types** in all four languages. This note records what the instructions say, what
the repository previously contained, the earlier ambiguity, and the decision that
was taken.

---

## 1. What the instruction says (verbatim)

From `DP_Csestudy_INSTRUCTIONS.pdf`, page 2, section **4. cross_language.csv —
snippet comparison**:

> "One row = one representative confirmed pattern instance implemented in one
> language. **For each detected pattern type, implement its small problem in all
> four languages, using the same inputs and expected outputs.**"

From the same PDF, page 3, the required repository hierarchy:

> "Part3/ **pattern_problem_name/ repeat for each pattern type**"

From the report template (`DP_Casestudy_completed.tex`, line 81, section *Part 3
Cross-language comparison*):

> "**For each confirmed pattern type, choose one representative verified
> instance.** Implement its small problem/snippet in Java, Python, JavaScript and
> C++; preserve the same pattern and behavior."

## 2. What the repository previously contained

Originally `data/cross_language.csv` had 8 rows = **2 pattern types × 4
languages**: Strategy (slot allocation, Part 1 baseline Change 1) and State (EV
charging session, Part 2 Change 2), both with real passing runs and raw logs in
`Part3/evidence/`.

## 3. The ambiguity (as it stood before the decision)

Confirmed pattern types in this study are **not limited to Strategy and State**:

- Part 1 baseline (`data/patterns.csv`) confirms **4 pattern types**:
  Strategy, Repository, Dependency Injection / IoC, and Layered Architecture
  (7 instances).
- Part 2 (`data/patterns_evolution.csv`) adds State and Observer.

So the phrase "each detected pattern type" admitted at least three readings:

1. **Baseline confirmed types only** → Strategy, Repository, DI/IoC, Layered
   Architecture (4 types).
2. **All confirmed types across the study** → the 4 baseline types plus State and
   Observer (6 types). This is the most literal reading and requires 4 more
   snippets × 4 languages (Observer, Repository, DI/IoC, Layered).
3. **A representative subset** → the word "representative" could be read as
   allowing the team to pick representative behavioural types (Strategy + State).

## 4. Decision taken (expansion to all six types)

**Reading (2) was adopted: implement every confirmed pattern type.** Part 3 has
been extended so that each of the six confirmed types has one representative
instance implemented in all four languages (JavaScript, Python, Java, C++) with
the same inputs and expected outputs. Four pattern types were added on top of the
original Strategy and State:

| Pattern type | Representative instance | Language dirs |
|---|---|---|
| Strategy | Slot allocation strategies | `Part3/Strategy/{javascript,python,java,cpp}` |
| State | EV charging session lifecycle | `Part3/State/{javascript,python,java,cpp}` |
| Observer | Parking slot occupancy notification | `Part3/Observer/{javascript,python,java,cpp}` |
| Repository | User account persistence | `Part3/Repository/{javascript,python,java,cpp}` |
| Dependency Injection | Notification channel injection | `Part3/DependencyInjection/{javascript,python,java,cpp}` |
| Layered Architecture | Reservation request handling | `Part3/LayeredArchitecture/{javascript,python,java,cpp}` |

Each language folder holds the production snippet, a separate language-native test
runner, and a README. `data/cross_language.csv` now has 24 rows (6 types × 4
languages), each backed by a raw log in `Part3/evidence/`. Current results:

- Strategy 5/5, State 13/13, Observer 8/8, Repository 8/8, Dependency Injection
  6/6, Layered Architecture 8/8 — passing in all four languages.

Repository, DI/IoC and Layered Architecture are architectural/wiring patterns, so
their "small problem" is a minimal but faithful standalone composition (a
map-backed repository, a constructor-injected notification service, and a
data/service/controller stack) rather than the whole application.

## 5. Outcome

Part 3 now complies with the most literal reading of "for each detected pattern
type" — every confirmed pattern type (Strategy, State, Observer, Repository,
Dependency Injection, Layered Architecture) is implemented in all four languages
with matching inputs/outputs, and `data/cross_language.csv` has one row per type
per language. No further scope is outstanding.
