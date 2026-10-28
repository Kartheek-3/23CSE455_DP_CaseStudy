# Command test data

All four versions read the same files and must produce byte-for-byte the same output.

| File | Used for |
|---|---|
| `tasks.txt` | Input |
| `expected-output.txt` | Exact stdout for `tasks.txt` (LF line endings, trailing newline) |
| `invalid-tasks.txt` | Input with an error on line 2 |
| `expected-error.txt` | The error message every version must raise for `invalid-tasks.txt` |

One command per line: `test <name> PASS|FAIL` or `note <text>`. All commands are queued first and executed later, in order, by the executor (invoker), which never looks inside them.

Blank lines and lines starting with `#` are ignored; fields are split on runs of whitespace. A bad line stops the run: the program prints `error: line N: ...` to stderr and exits with 1.
