# Observer Pattern — Python Implementation

## Pattern Problem
Implements the real-time **WebSocket Entity Subscription** mechanism from `ha-fusion` (`src/lib/Socket.ts` and `src/lib/Stores.ts`), where smart home device updates (lights, thermostats, safety sensors) are pushed asynchronously to registered dashboard widgets and logging listeners.

## File Manifest
- `entity_observer.py`: Production snippet defining `EntitySubscriptionObserver` interface, `EntityRecord` value class, and `EntityHub` Subject managing subscriptions and event dispatch.
- `test_runner.py`: Test runner executing 4 sequential entity updates across multiple observers and verifying subscription lifecycle dynamics.

## How to Run
From the root of `A4/`:
```bash
python Part3/observer_subscription/python/test_runner.py
```

## Timing Protocol
Measured using `time.perf_counter()` in milliseconds across 1 warm-up run and 5 measured runs.
