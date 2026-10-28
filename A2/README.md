# Team A2 --- MBTA API Design Patterns Case Study

**Course:** 23CSE455 --- Design Patterns\
**Application:** [MBTA API](https://github.com/mbta/api)\
**Submission repository:**
[23CSE455_DP_CaseStudy](https://github.com/aswathymohan-amrita/23CSE455_DP_CaseStudy)

## Project overview

This project studies Strategy-pattern collaborations in the MBTA API,
documents three changes, and compares simplified Strategy examples
across Java, Python, JavaScript, and C++.

The inspected application is written in Elixir/Phoenix. The submitted
source snapshot was an archive, so its exact baseline Git commit/tag
could not be verified.

## Repository structure

``` text
A2/
├── README.md
├── A2_Report_Final_Updated.tex
├── A2_Report_Final_Updated.pdf
├── Part1/
│   ├── patterns.csv
│   ├── images/
│   └── evidence/
├── Part2/
│   ├── code/
│   ├── changes/
│   │   ├── change1/
│   │   ├── change2/
│   │   └── change3/
│   └── images/
├── Part3/
│   ├── Rate_Limiter_Backend_Selection/
│   ├── State_Data_Parsing/
│   └── evidence/
└── data/
    └── code/
```

Adjust names in this tree if the final submitted folder uses different
filenames or locations. Include only files and folders that actually
exist in the submitted A2 directory.

## Part 1 --- Pattern discovery

Two Strategy-pattern collaborations were documented:

1.  **Rate Limiter Backend Selection**
    -   Context: `ApiWeb.RateLimiter`
    -   Behaviour contract: `ApiWeb.RateLimiter.Limiter`
    -   Backends: `ApiWeb.RateLimiter.ETS` and
        `ApiWeb.RateLimiter.Memcache`
    -   The context selects the configured backend and delegates
        operations.
2.  **State Data Parsing**
    -   Context: `State.Server`
    -   Parser contract: `Parse.parse/1`
    -   Parser implementations: `Parse.Alerts`, `Parse.Line`, and
        `Parse.Routes`
    -   `Parse.Simple` supplies shared parsing support for applicable
        parsers.

See `Part1/patterns.csv` and the architecture diagrams for the recorded
evidence.

## Part 2 --- Changes and test evidence

### CH01 --- Rate-limiter test coverage

Added tests for clearing rate-limiter state and keeping different users'
counters independent. The recorded command was:

``` powershell
mix test apps/api_web/test/api_web/rate_limiter_test.exs --no-warnings-as-errors
```

Recorded result: **8 tests passed, 0 failures**. The run excluded
`:memcache` and `:integration` tests. Compilation warnings were allowed
and remain unresolved. This change adds test coverage; it does not
change production Strategy participants.

### CH02 --- ETS rate-limiter tests

Added targeted ETS tests covering within-limit requests, over-limit
requests, independent keys, clearing state, and concurrent requests.

``` powershell
mix test apps/api_web/test/api_web/rate_limiter/ets_test.exs
```

Recorded result: **5 tests passed, 0 failures**. The run excluded
`:memcache` and `:integration` tests. The Strategy pattern is preserved.

### CH03 --- Parser exception handling

Updated `parse_new_state/3` so parser exceptions are handled before the
successful state-update flow. On parsing failure, the code logs the
error and avoids publishing a successful update event.

The recorded targeted test result was **1 passed, 18 excluded**, using
`--no-compile`. This does not prove that the latest source compiles
cleanly. A separate regular compile/test attempt encountered a warning
in `apps/state/lib/state/shape.ex` treated as an error.

## Part 3 --- Cross-language examples

The report includes simplified educational Strategy examples for Java,
Python, JavaScript, and C++ for both rate-limiter backend selection and
state-data parsing.

These examples are **illustrative equivalents**, not production
implementations copied from the MBTA API. In particular, the
rate-limiter examples use placeholder behavior and should not be treated
as production rate limiters.

Run each example using the language-specific instructions and test
runner in its own folder. Confirm filenames and commands against the
final submitted files before submission.

## Toolchain notes

The repository's `.tool-versions` specifies:

-   Elixir `1.19.5-otp-28`
-   Erlang/OTP `28.5.0.3`

Use the versions declared by the repository when setting up the full
application. A clean full build was not verified for this report
revision. Do not describe the full test suite as passing based only on
the focused test results above.

## Team

-   **AM.SC.U4CSE23201 --- Aadhav Gugan DU (Batch A):** Part 1 pattern
    discovery, source inspection, participant mapping, and pattern
    evidence.
-   **AM.SC.U4CSE23220 --- G Yaswanth Ram Saran (Batch A):** Part 2
    change records, test additions, targeted test evidence, and pattern
    evolution analysis.
-   **AM.SC.U4CSE23227 --- KB Sai Prasad Reddy (Batch A):** Part 3
    cross-language Strategy examples, test runners, and comparison
    documentation.

Update these allocations if the team's actual contributions differed.

## References

-   [MBTA API repository](https://github.com/mbta/api)
-   [Elixir behaviours
    documentation](https://hexdocs.pm/elixir/typespecs.html#behaviours)
-   [Java documentation](https://docs.oracle.com/en/java/)
-   [Python documentation](https://docs.python.org/3/)
-   [Node.js documentation](https://nodejs.org/docs/latest/api/)
-   [C++ reference](https://en.cppreference.com/)
-   23CSE455 Design Patterns Case Study instructions and report template
    supplied for the assignment
