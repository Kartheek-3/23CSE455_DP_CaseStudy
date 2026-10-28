# Repository: Java

- Production code: `InMemoryRepository.java`
- Test runner: `InMemoryRepositoryTest.java` (reads the shared fixture and prints `PASS`/`FAIL` per case and `passed N/M`; exit code 0 only if all cases pass)

Run from `Part3/code/pattern_repository/java/`:

```
javac -d build *.java
java -cp build InMemoryRepositoryTest ../../../test-cases/repository.txt
```

Remove the `build/` folder afterwards if one was created; compiled output is not part of the submission.

**Language notes:** `MiRepository` is an interface whose default method `insertOne` is mixed into `UsersRepository` (`extends InMemoryRepository implements MiRepository`).
