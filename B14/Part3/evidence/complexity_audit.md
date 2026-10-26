# Cyclomatic Complexity Audit

## Method and counting rule

A source-level, function-by-function McCabe audit was performed on the four production snippet files listed in `complexity_audit.csv`. For each implemented function or method, complexity is calculated as **M = 1 + D**, where `D` is the number of authored control-flow decision points in that function body. Each `if` and loop counts as one. For the Java `switch`, each non-default `case` label counts as one; the `default` label is not counted separately. Short-circuit boolean operators and ternary expressions would each add decision points, but none occur in these production method bodies. Abstract/interface declarations without bodies are omitted. Test code and standard-library internals are excluded.

This is an explicit manual audit, **not output from an external static-analysis package**. An external analyzer could not be installed in this execution environment because package network access was unavailable. The method-level decisions and arithmetic are provided in the CSV so the calculation can be reviewed and reproduced. If the course requires a particular analyzer, run that analyzer before final submission and record its version and any convention differences.

## Maxima used in `cross_language.csv`

| Pattern | Language | Highest-complexity method | Decision points | M |
|---|---|---|---:|---:|
| Strategy | Java | `LlmContext.select` | 3 switch case labels | 4 |
| Strategy | C++ | `LlmContext::stream` | 3 `if` statements | 4 |
| Observer | Java | `AuthEventSource.publish` | 1 `for` loop | 2 |
| Observer | C++ | `AuthEventSource::publish` | 1 `for` loop | 2 |

## Interpretation

The maximum function complexities are 4 for both Strategy snippets and 2 for both Observer snippets under the stated rule. These are method-level values for the small comparison snippets, not complexity measurements of the original TypeScript application.
