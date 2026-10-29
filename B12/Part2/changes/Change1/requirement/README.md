# Change 1 — Dynamic parking-slot allocation (Strategy pattern)

Status: implemented and tested.

## Requirement

The baseline `SlotsService.findAvailableByParkingArea` returns all free slots and
the caller implicitly takes the first one (`slots/slots.service.ts:166-192`). There
is no way to choose a different allocation policy, and adding one would mean editing
`SlotsService` for every policy.

Change 1 introduces a replaceable **slot-allocation policy** so the same service can
allocate by:
- `first-available` — keep baseline behaviour (lowest slot number);
- `nearest-to-entrance` — pick the slot with the smallest `distanceToEntrance`;
- `ev-preferred` — pick an EV slot when one is free, otherwise fall back.

The policy is selected per request (`GET /slots/allocate/:parkingAreaId?strategy=...`)
without changing the allocation logic in the service, which is the GoF **Strategy**
pattern.

## Implementation (see `diff/change1.diff`)

- New `slots/allocation/` package: `slot-allocation.strategy.ts` (interface),
  `first-available.strategy.ts`, `nearest-to-entrance.strategy.ts`,
  `ev-preferred.strategy.ts`, `slot-allocation.context.ts` (context that dispatches
  by name and falls back to `first-available`).
- `slots/slot.entity.ts`: added nullable `distanceToEntrance` column.
- `slots/slots.service.ts`: injected `SlotAllocationContext`, added `allocateSlot()`
  and `allocationStrategies()`; baseline methods unchanged.
- `slots/slots.module.ts`: registers the three strategies and builds the context.
- `slots/slots.controller.ts`: added `GET /slots/allocate/:parkingAreaId`.
- `slots/allocation/slot-allocation.spec.ts`: Jest unit tests.

This is the only change that edits pre-existing baseline files.
