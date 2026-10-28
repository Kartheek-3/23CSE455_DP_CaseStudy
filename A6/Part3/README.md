# Part 3 - Cross-language comparison

One representative instance per significant pattern type introduced or exercised by the changes, implemented in Java,
Python, JavaScript and C++ with the same fixtures:

| Folder | Pattern | Source instance | Fixtures | Result (all 4 languages) |
|---|---|---|---|---|
| `strategy_ride_fare/` | Strategy | Ride Fare Pricing (CH03) | `test-cases/strategy_spec.md` S1-S8 | 8/8 |
| `state_trip_lifecycle/` | State | Trip Lifecycle and Cancellation (CH02) | `test-cases/state_spec.md` T1-T8 | 8/8 |
| `observer_ride_notification/` | Observer | Ride Event Notification (baseline) | `test-cases/observer_spec.md` O1-O6 | 6/6 |

The same S1-S8 and T1-T8 fixtures are also asserted against the real TypeScript code in
`Part2/code/tests/pricing.test.ts` and `cancellation.test.ts`.

Why these three: they are the patterns the four requirements changed most (Strategy and State were absent in the baseline
and were introduced by the changes; Observer carries every new event). The structural/enterprise patterns of the baseline
(Repository, Adapter, Gateway, Data Mapper, DI) depend on MongoDB, Stripe, Google or tsyringe and do not reduce to a
self-contained problem with identical behaviour in four languages.

Run everything (compile, test, 1 warm-up + 5 timed runs, metrics) from the A6 folder:
`python tools/run_part3.py --lizard <path-to-lizard> --build <scratch-dir>`.
Results: `data/cross_language.csv`, `evidence/cross_language_runs.txt` (raw), `evidence/cross_language_metrics.json`,
`evidence/environment_versions.txt`. Slides: `A6_slide.pdf`.

Owners: Strategy - K Harish; State - M Kumar; Observer - Sai Sameer; measurement harness, metrics and slides - S Leela Shankar.
