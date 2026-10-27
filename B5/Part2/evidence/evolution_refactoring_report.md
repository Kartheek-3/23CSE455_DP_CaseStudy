# DaPlanStan — Final Software Evolution and Refactoring Report Section

*23CSE455 Design Patterns Case Study | Final aggregation | 11 October 2026*

## Methodology and source provenance

This analysis compares four separately preserved source versions: `baseline`, `scenario1_personalized_itinerary`, `scenario2_multiple_booking_providers`, and `scenario3_cancellation_policies`. The baseline comprises the nine original source-supported pattern collaborations P01–P09 recorded in the frozen `DaPlanStan_Part2/patterns.csv`. Subsequent inventories were taken directly from the source-verified, append-ready evolution records for each scenario. Every continuing collaboration retains its original instance name, pattern classification, mapped participants and updated locations as recorded for its version. Evolution statuses describe **transitions from the immediately preceding version**, not changes accumulated against the original baseline. One independent collaboration is one instance, even where it has multiple concrete participants.

The original baseline CSV has been retained without alteration; `patterns_evolution.csv` is the 45-row, nine-column, multi-version evidence dataset. The optional `patterns_multiversion_candidate.csv` contains the same 45 collaborations restricted to the seven original `patterns.csv` fields for faculty-folder assembly; it does not replace the frozen baseline file. Source-location fields remain as supplied by verified records, with relative application paths and clearly labeled external Turbo Rails references. The original archive's exact Git commit provenance and independent human sign-off remain unresolved.

## Original baseline

DaPlanStan is a Rails travel-planning application with email intake, itinerary management, trip membership, and notifications. At the original snapshot, the confirmed inventory contained six **Controller (GRASP)** collaborations, one **Information Expert (GRASP)** collaboration and two **Observer (GoF)** collaborations. The total was **9 instances of 3 distinct types**. In particular, P05 coordinated external JSON itinerary import, P01 linked parsed emails to trip records, and P09 represented the framework-mediated trip-scoped Turbo refresh collaboration. These baseline classifications have not been revised retrospectively.

## Scenario 1 — Personalized itinerary generation

The first evolution added owner-authorized in-app itinerary suggestion generation through an Anthropic-backed `ItinerarySuggestionGenerator`. A new `TripItemsController#generate` workflow validates preferences, previews a small generated batch, verifies signed confirmation and reuses existing `TripItem` batch persistence as `idea` records. The existing geocoding job and timeline/map remain downstream consumers. **P05 was classified `modified`** because its shared `bulk_create_items` implementation changed, notably replacing global callback enable/disable operations with instance-scoped deferred geocoding. **S1-N01 Personalized Itinerary Generation Coordination** was confirmed as a separate **Controller (GRASP)** instance because it coordinates an independent system event involving preferences, an Anthropic request and signed approval. The version contains **10 instances and 3 types**.

## Scenario 2 — Multiple booking providers

The second evolution introduced Atlas Demo and Beacon Demo, two local fictional booking-offer sources whose different data layouts are normalized behind a common `offers_for(destination_code:)` interface. Users can select a provider and add a validated sample offer as an itinerary `idea`; no live inventory, payment, booking confirmation or expense is produced. The new **S2-N01 Multiple Booking Provider Normalization** collaboration was verified as **one Adapter (GoF)** instance containing both concrete normalizers, not one instance per provider. **S2-N02 Multiple Booking Provider Option Coordination** was verified as a distinct **Controller (GRASP)** instance. P01–P09 and S1-N01 were preserved relative to Scenario 1. The version contains **12 instances and 4 types**. Separate Strategy and Factory interpretations of the provider registry were rejected to avoid double-counting normalization/lookup code.

## Scenario 3 — Different cancellation policies

The third evolution added a read-only cancellation quote feature for qualifying confirmed email-linked itinerary records. `CancellationPolicies::QuoteEvaluator` verifies email linkage, the item's own confirmation reference, amount, currency, start time and confirmed state before selecting one of three deterministic policy calculators. Flexible, Moderate and Strict policies implement the same fee-rate contract; the evaluator uses `BigDecimal` to derive rounded hypothetical fees and refunds. No booking is cancelled, payment/refund executed, Expense changed or cancellation state persisted. The interchangeable calculators form **one Strategy (GoF)** instance, **S3-N01 Cancellation Policy Evaluation**. The independent quote request is coordinated by **S3-N02 Cancellation Quote Coordination**, one new **Controller (GRASP)** instance. All preceding collaborations were preserved relative to Scenario 2. The version contains **14 instances and 5 types**.

## Pattern evolution and before/after counts

| Pattern type | Baseline | Scenario 1 | Scenario 2 | Scenario 3 |
|---|---:|---:|---:|---:|
| Controller (GRASP) | 6 | 7 | 8 | 9 |
| Information Expert (GRASP) | 1 | 1 | 1 | 1 |
| Observer (GoF) | 2 | 2 | 2 | 2 |
| Adapter (GoF) | 0 | 0 | 1 | 1 |
| Strategy (GoF) | 0 | 0 | 0 | 1 |
| **Total instances** | **9** | **10** | **12** | **14** |
| **Distinct types** | **3** | **3** | **4** | **5** |

Five collaborations were introduced across the three evolutions: one Controller in Scenario 1; one Adapter and one Controller in Scenario 2; and one Strategy and one Controller in Scenario 3. There are no verified removals or replacements. P05's `modified` classification applies only to the baseline→Scenario 1 transition; it is `preserved` in both later transitions. More pattern instances alone do not establish better architecture. The significance of the evolution is the source-supported separation of independent application events, provider data conversion and cancellation fee algorithms, accompanied by acknowledged integration and test limitations.

## Refactoring and design-pressure analysis

| Scenario | Original problem or pressure | Implemented change | Benefit | Trade-off and runtime limitation |
|---|---|---|---|---|
| 1 | The original `bulk_create_items` temporarily called global `TripItem.skip_callback` and `set_callback`, potentially affecting unrelated saves. | Transient per-record `defer_geocoding` flag; existing background job later loads fresh records. | Limits callback suppression to intended batch items and reuses existing asynchronous geocoding. | Adds per-object control state and enqueue-path complexity; concurrency, callback behavior and geocoding have not been Rails-runtime verified. |
| 2 | Distinct booking-provider response shapes would otherwise leak into controllers or require ad hoc branches. | Local provider-specific normalizers expose one offer contract and a fixed provider registry. | Isolates schema differences and supports deterministic, credential-free demonstration. | Fictional catalogues, notes-based offer identity and sequential-only deduplication; live provider integration and full Rails tests not verified. |
| 3 | Multiple fee schedules would otherwise concentrate policy-specific conditional logic inside UI/controller code. | Stateless Flexible, Moderate and Strict calculators selected by a quote evaluator. | Independent deterministic fee calculations and precise boundary testing with money-safe arithmetic. | Hypothetical rules do not reflect external contracts; controller/rendering/read-only assertions have not been Rails-runtime verified. |

## Verification and testing evidence

| Evidence layer | Scenario 1 | Scenario 2 | Scenario 3 |
|---|---|---|---|
| Source comparison / ZIP / patch checks | Source-verified; original preserved | 3 existing files modified, 17 new, 0 removed; patch checked | 3 existing files modified, 15 new, 0 removed; patch replay checked |
| Ruby syntax | 9/9 checked — Syntax OK | 9/9 checked — Syntax OK | 8/8 checked — Syntax OK |
| Standalone checks | 6 tests; 20 assertions; 0 failures/errors | 10 tests; 67 assertions; 0 failures/errors | 10 tests; 45 assertions; 0 failures/errors |
| Full Rails service/controller/regression tests | Not executed | Not executed | Not executed |
| Live integrations | Anthropic/geocoding/Turbo not verified | No external booking APIs by design; live app flow not verified | No external cancellations by design; live app flow not verified |

These standalone tests are **not** equivalent to application-level Rails test passes. The attempted Rails test commands exited before test discovery with `Bundler::GemNotFound` for missing locked dependencies, including Rails 8.1.3. The available environment has **Ruby 3.3.8**, whereas the project specifies **Ruby 3.4.2**. Consequently **0 Rails tests executed**, and Rails pass/fail/error/skip totals cannot be reported. Source preservation verifies unchanged files, not observed runtime behavior.

## Limitations and submission readiness

The application has not been fully booted and regression-tested under its specified Ruby/Rails dependency versions; live Anthropic generation and geocoding/Turbo behavior are unverified. Scenario 2 integrates only fictional/local providers and never creates a real booking. Scenario 3 uses hypothetical demonstration cancellation policies and never cancels an external reservation or guarantees a refund. The original source ZIP's Git commit provenance and final independent human review remain to be established. Before submission, the team must run the full Rails suite in a compatible environment, retain actual logs, verify team-folder-relative evidence paths, incorporate the CSVs into the faculty layout, and obtain a human review of the pattern-role classifications. The final evolution analysis documents source-supported change; it does **not** claim production readiness.
