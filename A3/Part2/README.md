# Part 2 — implemented evolution

Final application source: `code/`. CH01, CH02 and CH03 are sequential patches over the pinned original source. `changes/Change1/source` and `changes/Change2/source` preserve intermediate snapshots. `data/patterns_evolution.csv` at the team root is the canonical record; it retains unchanged collaboration names across snapshots. `tests/` contains the 26 new cases; the original 129-case suite is retained inside both source trees.

See the root README for build/run commands and limitations. The final tests validate SQLite transactions and Identity code handling; no live payment or email provider is involved.
