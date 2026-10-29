# Command in Java

Based on JUnit's B9 Node Execution Tasks (`NodeTestTask` / `TestTask`). Written by Claude Code (Claude Opus 5.5) for this case study; see `data/llm.csv`.

## Commands (run from this `java/` folder; Java 25 (OpenJDK 25.0.4.1))

```sh
javac -d out src/command/*.java test/command/*.java
java -cp out command.CommandDemo ../test-data/tasks.txt
java -cp out command.CommandTest
```

To diff the program output against the expected file yourself:

```sh
java -cp out command.CommandDemo ../test-data/tasks.txt | diff - ../test-data/expected-output.txt && echo same
```

The test runner (`test/command/CommandTest.java`) checks three things: the output equals `expected-output.txt`, the bad input fails with exactly `expected-error.txt`, and one Command-specific property. It exits with 0 only when all pass.

## Files

| File | Role in the pattern |
|---|---|
| `Command.java` | Command interface |
| `RunTestCommand.java`, `NoteCommand.java` | Concrete commands (records) |
| `TaskExecutor.java` | Invoker |
| `CommandDemo.java` | Client: parsing, wiring, `main` |

## How the pattern comes out in Java

- Commands are `record`s implementing one interface; the invoker keeps a `List<Command>` and runs them later, which is what makes execution deferrable (the test checks nothing runs on `submit`).
- In Java a lambda could also be a command, because the interface has one method.
- The queue is cleared after `runAll`.
