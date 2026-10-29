# Part 3 — Observer (cross-language)

GoF Observer: real-time occupancy notifications for the parking system.

- Subject: `OccupancyMonitor` keeps a list of observers, supports `attach` /
  `detach`, and broadcasts each event with `notify(event)` (which returns the
  number of observers that received it).
- Observer interface: `OccupancyObserver.update(event)`.
- Concrete observers: `AvailabilityObserver` (tracks which slots are occupied),
  `LoggingObserver` (records the raw event stream).

This is the cross-language form of the Part 2 evolution that introduces
real-time occupancy notifications, where Observer is confirmed as a pattern type.

Implementations (production snippet + tests in each directory):

| Language | Production | Test | Result | Median ms |
|---|---|---|---|---|
| JavaScript | `javascript/occupancy_observer.js` | `javascript/test_observer.js` | 8/8 | 75.321 |
| Python | `python/occupancy_observer.py` | `python/test_observer.py` | 8/8 | 65.179 |
| Java | `java/OccupancyObserver.java` | `java/ObserverTest.java` | 8/8 | 159.106 |
| C++ | `cpp/occupancy_observer.hpp` | `cpp/observer_test.cpp` | 8/8 | 15.937 |

Shared test cases (identical inputs/expected results in every language):

1. `notify` with two attached observers returns 2.
2. `occupy:1` → availability count 1, logging records 1 event.
3. `occupy:2` → availability count 2.
4. `free:1` → availability count 1.
5. after `detach(logging)`, `occupy:3` → availability count 2.
6. the detached logger still has only 3 events (detach really removes it).
7. logger contents are `occupy:1,occupy:2,free:1`.

Run instructions, LOC/CC/timing rules and the exact commands are in each
language's README. Raw runs are in `../evidence/Observer_*.txt`.
