# Decorator test data

All four versions read the same files and must produce byte-for-byte the same output.

| File | Used for |
|---|---|
| `invocations.txt` | Input |
| `expected-output.txt` | Exact stdout for `invocations.txt` (LF line endings, trailing newline) |
| `invalid-invocations.txt` | Input with an error on line 2 |
| `expected-error.txt` | The error message every version must raise for `invalid-invocations.txt` |

One invocation per line: `<test> <duration-ms> PASS|FAIL` (the duration is given, not measured, so the output is deterministic). Every invocation is wrapped as `Logging(Timeout(test, 100 ms))`; the program prints the log and a summary per result.

Blank lines and lines starting with `#` are ignored; fields are split on runs of whitespace. A bad line stops the run: the program prints `error: line N: ...` to stderr and exits with 1.
