# Part 3 — 20 implementations and common fixtures

One representative per confirmed pattern type: Notification transport (Adapter), Security header policy (Builder), Transfer posting (Service Layer), Second-factor login (Strategy), Transfer risk checks (Chain of Responsibility). The first three are baseline instances; the latter two are newly verified evolved instances.

Each language directory has production code, a separate fixture-reading runner and a README. Test doubles live in the runners. `test-cases/*.tsv` defines identical inputs/outputs. `../data/cross_language.csv` is authoritative; `evidence/` retains all five measured process times per program and actual outcomes. Run `python3 tools/measure.py` from the team root.

The Builder snippet returns a copy to keep tests independent; the upstream builder exposes its policy object. This is a documented reduced-specification difference, not a claim of exact API equivalence. The email adapter preserves accepted/nonaccepted/exception mapping. The posting service preserves the baseline's signed balance update and missing-account behavior. Identity verification is represented by injected test doubles in the language snippets; the native C# tests exercise actual Identity recovery-code consumption separately.
