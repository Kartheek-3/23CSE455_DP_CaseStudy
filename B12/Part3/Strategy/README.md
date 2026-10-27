# Part 3 — Strategy (cross-language)

GoF Strategy: a pluggable parking-slot allocation policy.

- Context: `SlotAllocator` holds a `SlotAllocationStrategy` and delegates `allocate(slots)` to it.
- Concrete strategies: `FirstAvailableStrategy`, `NearestToEntranceStrategy`, `EvPreferredStrategy`.
- The strategy can be swapped at runtime (`setStrategy`) without changing the context or clients.

This instance is the cross-language form of the Part 2 Change 1 evolution (dynamic
parking-slot allocation). It is also the same GoF pattern confirmed at baseline in
Part 1 (`JwtStrategy`), here made explicit in application classes.

Implementations (production snippet + tests in each directory):

| Language | Production | Test | Result | Median ms |
|---|---|---|---|---|
| JavaScript | `javascript/slot_allocation_strategy.js` | `javascript/test_strategy.js` | 5/5 | 80.866 |
| Python | `python/slot_allocation_strategy.py` | `python/test_strategy.py` | 5/5 | 112.122 |
| Java | `java/SlotAllocationStrategy.java` | `java/StrategyTest.java` | 5/5 | 185.646 |
| C++ | `cpp/slot_allocation_strategy.hpp` | `cpp/strategy_test.cpp` | 5/5 | 18.977 |

Shared test cases (identical inputs/expected results in every language):

1. first-available over [A1,A2,E1] → A1
2. nearest-to-entrance over [A1,A2,E1] → A2 (distance 30)
3. ev-preferred over [A1,A2,E1] → E1 (only EV)
4. ev-preferred over [A1,A2] (no EV) → A2 (nearest)
5. empty input → none

Run instructions, LOC/CC/timing rules and the exact commands are in each
language's README. Raw runs are in `../evidence/Strategy_*.txt`.
