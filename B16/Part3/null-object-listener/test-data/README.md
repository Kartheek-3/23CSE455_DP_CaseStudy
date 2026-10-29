# Null Object test data

All four versions read the same files and must produce byte-for-byte the same output.

| File | Used for |
|---|---|
| `tests.txt` | Input |
| `expected-output.txt` | Exact stdout for `tests.txt` (LF line endings, trailing newline) |
| `invalid-tests.txt` | Input with an error on line 2 |
| `expected-error.txt` | The error message every version must raise for `invalid-tests.txt` |

One test per line: `<test> PASS|FAIL`. The runner is used twice: with a console listener and with no listener, in which case it gets the shared no-op listener instead of a null value.

Blank lines and lines starting with `#` are ignored; fields are split on runs of whitespace. A bad line stops the run: the program prints `error: line N: ...` to stderr and exits with 1.
