# Part 2 — test summary (real runs)

Environment: Windows, Node v24.18.0, Jest 30.2.0. Tests ran in a disposable copy of
the baseline backend at `%TEMP%\part2_run\smart-parking-backend` with the Part 2
overlay applied. Dependencies were installed with `npm install` (the baseline
`package-lock.json` is out of sync, so `npm ci` fails; see the report's limitations).

## Per-change results

| Change | Pattern | Command | Result |
|--------|---------|---------|--------|
| 1 | Strategy | `npx jest --runInBand --testPathPatterns "allocation"` | 1 suite, **8/8 passed** |
| 2 | State | `npx jest --runInBand --testPathPatterns "charging"` | 1 suite, **8/8 passed** |
| 3 | Observer | `npx jest --runInBand --testPathPatterns "occupancy"` | 1 suite, **5/5 passed** |

Raw logs: `../Part2/changes/ChangeN/test_result/jest_changeN.txt`.

## Full suite

Command: `npx jest --runInBand` → 7 suites, 25 tests, **22 passed, 3 failed**.
Log: `part2_jest_full.txt`.

The 3 failures are **pre-existing baseline defects**, not regressions:

- `src/auth/auth.controller.spec.ts`
- `src/auth/auth.service.spec.ts`
- `src/mail/mail.service.spec.ts`

They fail with the same Nest "can't resolve dependencies" errors on the untouched
baseline (proven in `baseline_preexisting_failures_raw.txt`). The Part 2 diff does not
touch `auth/` or `mail/`. The 22 passing tests = 1 baseline `app.controller.spec.ts`
test + 21 new Part 2 tests.

## New tests added by Part 2

- `slots/allocation/slot-allocation.spec.ts` — 8 tests (each strategy, context
  dispatch, unknown-strategy fallback).
- `charging/charging.spec.ts` — 8 tests (full lifecycle, illegal transitions, service
  dispatch).
- `occupancy/occupancy.spec.ts` — 5 tests (attach/detach, notify, slot availability
  tracking).
