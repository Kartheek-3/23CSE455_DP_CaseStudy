# Part 3 — Test Cases

The same logical test cases are implemented in every language so the comparison
is like-for-like. Test code is always kept in a separate file from the production
snippet.

## Strategy — 5 assertions

| # | Case | Expected |
|---|---|---|
| 1 | FirstAvailable over [A1(dist50),A2(dist30),E1(dist40,ev)] | A1 |
| 2 | NearestToEntrance over the same list | A2 |
| 3 | EvPreferred over the same list | E1 |
| 4 | EvPreferred over [A1,A2] (no EV) | A2 |
| 5 | Any strategy over empty list | none |

## State (EV charging) — 13 assertions

Initial `idle`; `startCharge` from idle rejected (state unchanged, error
recorded); `plugIn` → `plugged_in`; `removeCable` from `plugged_in` → `idle`;
happy path `plugIn → startCharge → finishCharge` → `charging → completed`;
`removeCable` during `charging` rejected; `removeCable` from `completed` →
`idle`.

Recorded run commands and results are in each language directory README and in
`../evidence/`.
