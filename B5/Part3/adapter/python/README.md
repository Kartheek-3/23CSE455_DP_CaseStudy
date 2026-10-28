# S2-N01 — Adapter (GoF) — Multiple Booking Provider Normalization

## Pattern roles
- Client: `BookingOfferClient` (only uses the Target contract and normalized record).
- Target: `OfferProvider` with `offersFor(destination)` (Python spells `offers_for`).
- ConcreteAdapters: `AtlasAdapter`, `BeaconAdapter`.
- Adaptees: two distinct local TSV raw schemas (see `../../common_specs/ADAPTER_README.md`).
- Fixed provider selector: `ProviderRegistry` (not a Factory pattern).
- Target result: `NormalizedOffer` with 9 normalized fields including **integer cents**.

Atlas's destination-scoped source uses `id/title/category/location/details` and compound `EUR:24.00` prices. Beacon's flat table has `code/label/type/address/summary`, separate `amount` and `currency`, and destination as the final column. Only the corresponding Adapter interprets these fields. The client never contains schema-specific parsing.

## Reproduce from this language folder
Runtime/compiler: Python 3.13.5
Compile: `Not required`
Test: `python3 test_main.py`
Shared fixtures: `../../common_specs/adapter_cases.tsv`, `adapter_expected.tsv`, both raw provider TSVs and `adapter_invalid_fixtures/`.

Actual primary outcome: 10/10 fixture cases passed; zero failures, errors and skips; extra provider isolation checks passed; exit 0.
Production LOC: 93; maximum function cyclomatic complexity: 7.
Median fresh-process time: 852.239836 ms, from one warmup and five measured runs (see `timings.csv`).

## Deliberate simplifications
No Rails, database, Anthropic, external provider API, money transfer or real booking. Provider schemas are local TSV rather than JSON to avoid third-party dependencies. No confirmation reference or reservation ID is created. Cents are parsed without floating-point arithmetic. Each fixture run uses a fresh client/adapter resolution; no shared mutable current-provider state.
