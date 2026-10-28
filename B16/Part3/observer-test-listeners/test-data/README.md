# Observer test data

All four versions read the same files and must produce byte-for-byte the same output.

| File | Used for |
|---|---|
| `events.txt` | Input: one test event per line |
| `expected-output.txt` | Exact stdout for `events.txt` (LF line endings, trailing newline) |
| `invalid-events.txt` | Input with a bad status on line 2 |
| `expected-error.txt` | The error message every version must raise for `invalid-events.txt` |

## Event format

```
started  <test id>
finished <test id> SUCCESSFUL|FAILED|ABORTED
skipped  <test id> reason=<text, may contain spaces>
```

Blank lines and lines starting with `#` are ignored. Fields are split on runs of whitespace.
A bad line stops the run with `line N: unknown event 'x'`, `line N: malformed <event> event`
or `line N: unknown status 'X'`.

## What the program does

Three listeners are registered in this order: `SummaryListener`, `BrokenListener`, `LoggingListener`.
`BrokenListener` throws on every event. Because it sits between the other two, the output shows
that `LoggingListener` still receives every event after the failure, and every failure is
recorded by the composite, as in JUnit's `CompositeTestExecutionListener.notifyEach`.
