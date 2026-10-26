# Change 3 — Occupancy monitoring (Observer pattern)

Status: implemented and tested.

## Requirement

The baseline changes slot status directly (for example in
`SlotsService.expireOverdueReservations`) with no way for other parts of the system
to react to occupancy changes without being coupled to the slot service.

Change 3 adds an occupancy monitor that broadcasts each slot status change to any
number of registered listeners. Components can subscribe and unsubscribe at runtime
and are notified automatically, which is the GoF **Observer** pattern.

## Implementation (see `diff/change3.diff`)

- New `occupancy/` package:
  - `occupancy-observer.ts` — `OccupancyObserver` interface and `OccupancyEvent`;
  - `occupancy-monitor.ts` — `OccupancyMonitor` subject with `attach` / `detach` /
    `report` (notify);
  - `observers/logging.observer.ts` — records every event;
  - `observers/availability.observer.ts` — tracks which slots are occupied;
  - `occupancy.controller.ts` — `POST /occupancy/:slotId/status`;
  - `occupancy.module.ts` — registers the subject and attaches both observers;
  - `occupancy.spec.ts` — Jest unit tests.
- `app.module.ts`: imports `OccupancyModule`.

Fully additive apart from the one-line module registration.
