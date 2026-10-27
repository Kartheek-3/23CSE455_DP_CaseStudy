# Command in Python

Based on JUnit's B9 Node Execution Tasks (`NodeTestTask` / `TestTask`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `python/` folder; Python 3.14.2)

```sh
python3 main.py ../test-data/tasks.txt
python3 -m unittest -v test_command
```

To diff the program output against the expected file yourself:

```sh
python3 main.py ../test-data/tasks.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test_command.py`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Command-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `command.py` | `Command` ABC, `RunTestCommand`, `NoteCommand`, `TaskExecutor` (invoker), parsing and `report` |
| `main.py` | Command line entry |

## How the pattern comes out in Python

- `Command` is an ABC; since Python functions are first-class objects, a plain function or closure could serve as a command too.
- The invoker returns both the printed lines and how many commands it executed.
- Commands share the results list passed to `execute`.
