# Part 3 — Repository (cross-language)

Repository: a data-access abstraction that hides storage behind a collection-like
interface.

- `UserRepository` is the abstract interface (`save`, `findById`, `findAll`,
  `deleteById`).
- `InMemoryUserRepository` is the concrete implementation backed by a map.
- `UserService` (the client) depends only on the `UserRepository` interface, so
  storage could be swapped without changing the client.

Repository is a confirmed Part 1 (baseline) pattern. This snippet is a
representative small problem — an in-memory user repository.

Implementations (production snippet + tests in each directory):

| Language | Production | Test | Result | Median ms |
|---|---|---|---|---|
| JavaScript | `javascript/user_repository.js` | `javascript/test_repository.js` | 8/8 | 78.932 |
| Python | `python/user_repository.py` | `python/test_repository.py` | 8/8 | 104.625 |
| Java | `java/UserRepository.java` | `java/RepositoryTest.java` | 8/8 | 143.415 |
| C++ | `cpp/user_repository.hpp` | `cpp/repository_test.cpp` | 8/8 | 16.189 |

Shared test cases (identical inputs/expected results in every language):

1. save user 1 "Ada" → `findById(1).name == "Ada"`, count 1.
2. save user 2 "Bob" → count 2.
3. `findById(99)` for a missing id returns none/null.
4. saving id 1 again overwrites (count stays 2, name becomes "Ada2").
5. `deleteById(1)` → `findById(1)` is none/null, count 1.

Run instructions, LOC/CC/timing rules and the exact commands are in each
language's README. Raw runs are in `../evidence/Repository_*.txt`.
