\# Batch Loader — JavaScript



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



\- `batchLoader.js` — pattern implementation: `Ticket`, `BatchLoader`, `UserRepository` and `createUserBatchFn`, exported with `module.exports`

\- `testBatchLoader.js` — shared test fixture

\- `timing\_raw.csv` — five measured execution times



\- `BatchLoader` takes a function as its batch function.

\- `Ticket` is a small class with a `value` field that stays `null` until `dispatch()` has run.

\- The cache is a `Map` and the pending keys are an array; `dispatch()` swaps the array out and fills the tickets with `forEach`.

\- `createUserBatchFn(repo)` builds the batch function. It creates a `Map` of the returned users and maps each requested key to a user or `null`.

\- A missing record is represented by `null`.



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

6\. The missing `u9` resolves to `null`.

7\. A repeated `u2` load is served from the cache without a new query.



Expected result:



```text

RESULT: 7 passed, 0 failed

```



\## Build



No separate build step is required; JavaScript runs the source directly.



\## Test



```powershell

node testBatchLoader.js

```



\## Environment



\- Node.js: v22.12.0

\- Platform: Windows



\## Measurement



| Metric | Value |

|:--|--:|

| Production LOC | 48 |

| Maximum function cyclomatic complexity | 2 |



LOC counts production lines only, excluding blank lines, comments and tests.



\## Timing



Procedure:



1\. Run one warmup execution.

2\. Run five measured executions using PowerShell `Measure-Command`.

3\. Report the median of the five `TotalMilliseconds` values.



Timing command:



```powershell

Measure-Command { node testBatchLoader.js > $null }

```



Timing includes Node.js process startup, module loading, and test execution.



Official measured values:



| Run | Process time (ms) |

|----:|------------------:|

| 1 | 47.8695 |

| 2 | 51.7907 |

| 3 | 40.4761 |

| 4 | 41.2825 |

| 5 | 40.7217 |



\*\*Median: 41.2825 ms\*\*



Raw measurements are stored in `timing\_raw.csv`.



\## Limitations



This is a reduced cross-language reproduction of the original pattern. Framework-specific behavior such as NestJS request scoping, the DataLoader library's automatic tick-based scheduling, TypeORM queries, and database access is intentionally removed. Batches are dispatched by an explicit `dispatch()` call so that the core batching, de-duplication, ordering and caching behavior can be reproduced consistently across Java, Python, JavaScript, and C++.



