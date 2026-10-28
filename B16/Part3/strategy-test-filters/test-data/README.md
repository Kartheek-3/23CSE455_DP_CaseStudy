# Strategy test data

All four versions read the same files and must produce byte-for-byte the same output.

| File | Used for |
|---|---|
| `tests.txt` | Input |
| `expected-output.txt` | Exact stdout for `tests.txt` (LF line endings, trailing newline) |
| `invalid-tests.txt` | Input with an error on line 2 |
| `expected-error.txt` | The error message every version must raise for `invalid-tests.txt` |

One test per line: `<Class#method> [tags...]`. The program applies three strategies in turn (include-tag `fast`, exclude-tag `flaky`, name-contains `String`) and prints the selection for each. A name without exactly one `#` stops the run.

Blank lines and lines starting with `#` are ignored; fields are split on runs of whitespace. A bad line stops the run: the program prints `error: line N: ...` to stderr and exits with 1.
