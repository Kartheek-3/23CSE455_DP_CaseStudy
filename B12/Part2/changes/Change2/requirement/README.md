# Change 2 — EV charging session lifecycle (State pattern)

Status: implemented and tested.

## Requirement

The baseline only models EV as a static enum value (`SlotType.EV`,
`slots/slot.entity.ts:18-21`). There is no behaviour for an EV charging session and
no way to constrain which operations are legal at which time.

Change 2 adds a charging-session lifecycle with explicit, guarded transitions:
`idle → plugged-in → charging → completed → idle`. Illegal operations (for example
starting a session that is not plugged in) must be rejected. Modelling "an object
whose behaviour changes with its internal state, with each state a separate class" is
the GoF **State** pattern.

## Implementation (see `diff/change2.diff`)

- New `charging/` package:
  - `charging-state.ts` — `ChargingState` interface;
  - `charging-states.ts` — `IdleState`, `PluggedInState`, `ChargingActiveState`,
    `CompletedState`;
  - `charging-session.ts` — `ChargingSession` context (holds current state, energy
    delivered, transition history);
  - `charging.service.ts` — in-memory session registry + action dispatch;
  - `charging.controller.ts` — `POST /charging/:slotId`,
    `GET /charging/:slotId`, `POST /charging/:slotId/:action`;
  - `charging.module.ts`;
  - `charging.spec.ts` — Jest unit tests.
- `app.module.ts`: imports `ChargingModule`.

Fully additive apart from the one-line module registration.
