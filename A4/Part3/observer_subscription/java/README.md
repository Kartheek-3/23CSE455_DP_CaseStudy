# Observer Pattern — Java Implementation

## Pattern Problem
Implements the real-time **WebSocket Entity Subscription** mechanism from `ha-fusion` (`src/lib/Socket.ts` and `src/lib/Stores.ts`), where smart home device updates (lights, thermostats, safety sensors) are pushed asynchronously to registered dashboard widgets and logging listeners.

## File Manifest
- `EntitySubscriptionObserver.java`: Production snippet defining `EntitySubscriptionObserver` interface, `EntityRecord` value class, and `EntityHub` Subject managing subscriptions and event dispatch.
- `TestRunner.java`: Test runner executing 4 sequential entity updates across multiple observers and verifying subscription lifecycle dynamics.

## How to Compile & Run
From the root of `A4/`:
```bash
javac -d Part3/observer_subscription/java/bin Part3/observer_subscription/java/EntitySubscriptionObserver.java Part3/observer_subscription/java/TestRunner.java
java -cp Part3/observer_subscription/java/bin observer.TestRunner
```

## Timing Protocol
Measured using `System.nanoTime()` in milliseconds across 1 warm-up run and 5 measured runs.
