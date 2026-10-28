# Template Method test data

All four versions read the same files and must produce byte-for-byte the same output.

| File | Used for |
|---|---|
| `tests.txt` | Input |
| `expected-output.txt` | Exact stdout for `tests.txt` (LF line endings, trailing newline) |
| `invalid-tests.txt` | Input with an error on line 2 |
| `expected-error.txt` | The error message every version must raise for `invalid-tests.txt` |

One test per line: `<test> PASS|FAIL`. Two engines run the same tests through the same `execute()` skeleton; `lifecycle` also overrides the `beforeEach`/`afterEach` hooks.

Blank lines and lines starting with `#` are ignored; fields are split on runs of whitespace. A bad line stops the run: the program prints `error: line N: ...` to stderr and exits with 1.
