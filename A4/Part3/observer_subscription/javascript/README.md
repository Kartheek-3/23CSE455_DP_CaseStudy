# Observer Pattern — JavaScript (Node.js) Implementation

## Pattern Problem
Implements the real-time **WebSocket Entity Subscription** mechanism from `ha-fusion` (`src/lib/Socket.ts` and `src/lib/Stores.ts`), where smart home device updates (lights, thermostats, safety sensors) are pushed asynchronously to registered dashboard widgets and logging listeners.

## File Manifest
- `entityObserver.js`: Production snippet defining `EntitySubscriptionObserver` base class, `EntityRecord` value class, and `EntityHub` Subject managing subscriptions and event dispatch.
- `testRunner.js`: Test runner executing 4 sequential entity updates across multiple observers and verifying subscription lifecycle dynamics.

## How to Run
From the root of `A4/`:
```bash
node Part3/observer_subscription/javascript/testRunner.js
```

## Timing Protocol
Measured using Node.js `perf_hooks.performance.now()` in milliseconds across 1 warm-up run and 5 measured runs.
