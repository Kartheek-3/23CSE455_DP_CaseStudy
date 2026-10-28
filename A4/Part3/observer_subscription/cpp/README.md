# Observer Pattern — C++ Implementation

## Pattern Problem
Implements the real-time **WebSocket Entity Subscription** mechanism from `ha-fusion` (`src/lib/Socket.ts` and `src/lib/Stores.ts`), where smart home device updates (lights, thermostats, safety sensors) are pushed asynchronously to registered dashboard widgets and logging listeners.

## File Manifest
- `entity_observer.hpp` & `entity_observer.cpp`: Production snippet defining `EntitySubscriptionObserver` interface, `EntityRecord` value class, and `EntityHub` Subject managing subscriptions and event dispatch.
- `test_runner.cpp`: Test runner executing 4 sequential entity updates across multiple observers and verifying subscription lifecycle dynamics.

## How to Compile & Run
From the root of `A4/`:
```bash
g++ -O2 -std=c++14 -I Part3/observer_subscription/cpp Part3/observer_subscription/cpp/entity_observer.cpp Part3/observer_subscription/cpp/test_runner.cpp -o Part3/observer_subscription/cpp/test_runner.exe
Part3/observer_subscription/cpp/test_runner.exe
```

## Timing Protocol
Measured using `std::chrono::high_resolution_clock` inside `test_runner.cpp` in milliseconds across 1 warm-up run and 5 measured runs.
