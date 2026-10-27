# Part 3 — S2-N01 Adapter (GoF): Independent Execution and Verification Summary

**Instance:** Multiple Booking Provider Normalization. **Starting frozen Part3:** completed Strategy, Observer, Controller and Information Expert. **Scope:** Adapter only; no DaPlanStan modification; no final cross_language.csv.

## Common fixture freeze and correctness

- `adapter_cases.tsv` and `adapter_expected.tsv`: A01–A10 exactly, ten outcomes; valid A01–A04, controlled errors A05–A10.
- `atlas_raw.tsv`: destination-scoped seven-column table; `price` has compound currency+amount, e.g. `EUR:24.00`.
- `beacon_raw.tsv`: eight-column flat records; separate decimal `amount` and `currency`, destination in different position.
- Shared malformed fixture variants: Atlas unknown category, malformed compound price, omitted `price` header; Beacon unknown type and omitted `currency` header.
- All shared fixture SHA-256 hashes are in `common_specs/ADAPTER_README.md` and `adapter/frozen_fixtures_sha256.json`.
- Expected `OK` rows use identical nine-field normalized offer contract; monetary values are integer cents. Errors are deterministic `UNKNOWN_PROVIDER`, `UNKNOWN_DESTINATION`, `UNKNOWN_OFFER`, `INVALID_OFFER`, `INVALID_FIXTURE`.
- Expected TSVs were frozen before writing any source code and remained hash-identical throughout implementation and measurement.

## Pattern participants and fidelity

| Role | Participant | Duty |
|---|---|---|
| Client | BookingOfferClient | Uses only provider Target interface and normalized offers, never raw source fields |
| Target | OfferProvider / offersFor(destination), Python offers_for(destination) | Common provider operation |
| ConcreteAdapters | AtlasAdapter and BeaconAdapter | Translate incompatible raw schemas independently |
| Adaptees | Atlas raw TSV and Beacon raw TSV layouts | Distinct fields, layout and monetary representations |
| Provider selection | ProviderRegistry | Fixed whitelist; not a GoF Factory |
| Output | NormalizedOffer | Same nine fields across languages and providers |

This is **Adapter**, not Strategy: two incompatible source structures are translated to a common client-facing contract rather than swapping independent business fee/calculation algorithms. No runtime reflection/dynamic provider-class loading.

## Behavioral test cases

| Case | Expected |
|---|---|
| A01 | Atlas Rome walk, do, 2400 EUR cents |
| A02 | Beacon Rome museum, do, 1600 EUR cents |
| A03 | Atlas Paris market, shop, 0 EUR cents |
| A04 | Beacon Paris pastry, eat, 1250 EUR cents |
| A05 | ERROR UNKNOWN_PROVIDER |
| A06 | ERROR UNKNOWN_DESTINATION |
| A07 | ERROR UNKNOWN_OFFER (cross-provider ID) |
| A08 | ERROR INVALID_OFFER (unknown Atlas category) |
| A09 | ERROR INVALID_OFFER (malformed Atlas compound price) |
| A10 | ERROR INVALID_FIXTURE (missing Atlas schema column) |

The test runners compare **all output columns** against `adapter_expected.tsv`, and additionally prove both cross-provider directions reject foreign IDs, Rome/Paris filtering, malformed Beacon type/schema rejection, and successful Beacon lookup despite bad Atlas data and successful Atlas lookup despite bad Beacon data. No mutable global selected provider exists.

## Actual compilation and tests

| Language | Runtime/compiler | Compile command | Test command | Passed | Failures | Errors | Exit |
|---|---|---|---|---:|---:|---:|---:|
| Java | openjdk version "21.0.12.1" 2026-08-18; javac 21.0.12.1 | `javac Main.java TestMain.java` | `java TestMain` | 10/10 | 0 | 0 | 0 |
| Python | Python 3.13.5 | `Not required` | `python3 test_main.py` | 10/10 | 0 | 0 | 0 |
| JavaScript | Node.js v22.16.0 | `Not required` | `node test_main.js` | 10/10 | 0 | 0 | 0 |
| C++ | g++ (Debian 14.2.0-19) 14.2.0; C++17 | `g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o adapter_tests` | `./adapter_tests` | 10/10 | 0 | 0 | 0 |

## Production LOC, maximum per-function cyclomatic complexity and fresh-process timings

Exactly one untimed warm-up and **five measured fresh-process runs** per language. Each run reads all shared fixtures, executes all ten tests and additional isolation assertions, and compares actual output with shared expected output. Elapsed times include startup, I/O, assertions and process teardown; **not** isolated adapter-algorithm timings.

| Language | Production LOC | Max function CC | Run 1 (ms) | Run 2 | Run 3 | Run 4 | Run 5 | Median (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Java | 120 | 12 | 70.546628 | 76.930458 | 66.132195 | 71.667737 | 93.365098 | **71.667737** |
| Python | 93 | 7 | 865.773878 | 866.613322 | 835.153723 | 852.239836 | 846.508451 | **852.239836** |
| JavaScript | 67 | 8 | 35.454478 | 38.800172 | 35.245684 | 33.097147 | 34.353892 | **35.245684** |
| C++ | 141 | 12 | 2.522362 | 2.697677 | 2.705641 | 3.606257 | 3.631080 | **2.705641** |

Source LOC excludes blank/comment-only lines, test runners, TSVs and compiler artifacts. The maximum function CC uses the **same frozen McCabe-style helper** from `evidence/measure_complexity.py` (base 1 + branches, loops, switch/case, exception handlers, ternaries and short-circuit operations). This Adapter measurement script changes only function discovery for the new role/class names; it does not redefine the decision score. Metrics are static/lexical approximations, not instrumentation.

## Preservation and reproducibility

Frozen pre-existing Part3 file checksum matches: 138/138.
Information Expert cumulative ZIP entry comparison: 137/137 unchanged.
Adapter fixtures unchanged from original freeze: 9/9.

All prior Strategy/Observer/Controller/Information Expert production, tests, common fixtures, evidence and append-ready data were preserved unchanged. Tests, raw timings, compiler exit codes, production LOC, per-function CC, and exact environment versions are recorded in `adapter/*/test_result.txt`, `timings.csv` and `evidence/adapter_*.json`.

## Limitations

- Fictional demo catalogues and deterministic TSV fixtures, not live provider JSON or production Rails adapters.
- No booking/reservation, payment, network or provider API activity; no confirmation references.
- Only two destinations, two providers, three normalized kinds, supported fixture currencies, and ten frozen counted cases (with additional uncounted isolation assertions).
- Fail-fast validation rejects malformed selected destination records; it does not model partial acceptance, concurrency, transport failures, or persistence.
- Process times are specific to this execution environment and influenced by startup and I/O overhead.
- Final cross-language aggregation and final `cross_language.csv` are intentionally deferred.
