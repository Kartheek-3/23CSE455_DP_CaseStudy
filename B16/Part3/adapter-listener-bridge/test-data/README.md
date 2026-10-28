# Adapter test data

All four versions read the same files and must produce byte-for-byte the same output.

| File | Used for |
|---|---|
| `events.txt` | Input |
| `expected-output.txt` | Exact stdout for `events.txt` (LF line endings, trailing newline) |
| `invalid-events.txt` | Input with an error on line 2 |
| `expected-error.txt` | The error message every version must raise for `invalid-events.txt` |

Engine events, one per line: `started <unique-id>` or `finished <unique-id> SUCCESSFUL|FAILED|ABORTED`; a unique id is a path of `[kind:value]` segments as in JUnit. The engine side only knows the unique ids; the adapter turns each one into a `TestIdentifier` (display name, test or container, parent) for the client listener.

Blank lines and lines starting with `#` are ignored; fields are split on runs of whitespace. A bad line stops the run: the program prints `error: line N: ...` to stderr and exits with 1.
