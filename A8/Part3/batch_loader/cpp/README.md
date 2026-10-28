\# Batch Loader — C++



\## Pattern



Batch Loader



\## Source correspondence



Representative source instance:



\- `src/users/loaders/user.loader.ts` (`UserDataLoader`)



The original project has three Batch Loader instances (`UserDataLoader`, `FlightDataLoader`, `SeatDataLoader`) that share the same structure. Each wraps a `DataLoader` so that relation lookups requested during one resolution tick are collected and fetched with a single repository query (`WHERE id IN (...)`), then returned in the order of the requested keys. `BookingResolver` uses them to resolve the `user`, `flight` and `seat` fields without N+1 queries.



This reproduction keeps the batching behavior of the user loader and removes NestJS, GraphQL, TypeORM, DataLoader and database dependencies. A small in-memory repository stands in for the database and records every query it receives.



\## Problem



Implement a loader that collects individual `load(key)` requests, resolves all pending keys with one call to a batch function, and returns the results in the order the keys were requested.



\## Implementation



\- `batch\_loader.cpp` — pattern implementation: `Ticket<V>`, `BatchLoader<V>`, `User`, `UserRepository` and `createUserBatchFn`

\- `test\_batch\_loader.cpp` — shared test fixture; includes `batch\_loader.cpp` directly

\- `timing\_raw.csv` — five measured execution times



\- `BatchLoader<V>` is a class template. The batch function is a `std::function` that maps a vector of keys to a vector of `std::optional<V>`.

\- `Ticket<V>` holds a `std::optional<V>` and is shared through `std::shared\_ptr`, so the caller keeps a handle while the loader fills it in.

\- The cache is a `std::map<std::string, std::shared\_ptr<Ticket<V>>>` and the pending keys are a `std::vector`; `dispatch()` swaps the vector out before calling the batch function.

\- `createUserBatchFn(repo)` returns a lambda that queries the repository once and re-orders the result to match the requested keys.

\- A missing record is represented by `std::nullopt`.



How it works:



1\. `load(key)` returns a ticket immediately. A key that is not yet cached is added to the cache and to the pending list; a key that is already cached returns its existing ticket.

2\. `dispatch()` takes the pending keys and calls the batch function once. If there are no pending keys, it does nothing.

3\. The batch function asks the repository for all keys at once and returns one result per key, in key order.

4\. Each ticket receives its value, so duplicate requests and repeated loads share one lookup.



\## Test cases



The shared fixture contains three users (`u1` Alice, `u2` Bob, `u3` Carol). The test requests `u2`, `u1`, `u2` (duplicate) and `u9` (missing), calls `dispatch()` once, and then requests `u2` again.



The tests verify:



1\. Four load requests trigger one repository query.

2\. The repository receives unique keys in first-seen order (`u2,u1,u9`).

3\. `u2` resolves to Bob.

4\. `u1` resolves to Alice.

5\. The duplicate `u2` request resolves to Bob.

6\. The missing `u9` resolves to `null` (`std::nullopt`).

7\. A repeated `u2` load is served from the cache without a new query.



Expected result:



```text

RESULT: 7 passed, 0 failed

```



\## Build



```powershell

g++ -std=c++17 -O2 test\_batch\_loader.cpp -o batch\_loader\_test.exe

```



\## Test



```powershell

.\\batch\_loader\_test.exe

```



\## Environment



\- Compiler: g++ (MSYS2) 14.2.0

\- Standard: C++17

\- Optimization: `-O2`

\- Platform: Windows



\## Measurement



| Metric | Value |

|:--|--:|

| Production LOC | 79 |

| Maximum function cyclomatic complexity | 5 |



LOC counts production lines only, excluding blank lines, comments and tests.



\## Timing



Compilation was performed before timing.



Procedure:



1\. Compile the implementation.

2\. Run one warmup execution.

3\. Run five measured executions using PowerShell `Measure-Command`.

4\. Report the median of the five `TotalMilliseconds` values.



Timing command:



```powershell

Measure-Command { .\\batch\_loader\_test.exe > $null }

```



Timing includes executable startup and test execution. Compilation is excluded.



Official measured values:



| Run | Process time (ms) |

|----:|------------------:|

| 1 | 16.5664 |

| 2 | 16.6092 |

| 3 | 11.2842 |

| 4 | 7.6118 |

| 5 | 6.2332 |



\*\*Median: 11.2842 ms\*\*



Raw measurements are stored in `timing\_raw.csv`.



\## Limitations



This is a reduced cross-language reproduction of the original pattern. Framework-specific behavior such as NestJS request scoping, the DataLoader library's automatic tick-based scheduling, TypeORM queries, and database access is intentionally removed. Batches are dispatched by an explicit `dispatch()` call so that the core batching, de-duplication, ordering and caching behavior can be reproduced consistently across Java, Python, JavaScript, and C++.



