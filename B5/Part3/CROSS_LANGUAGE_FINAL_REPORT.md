# Part 3 — Final Cross-Language Comparison and Verification

## Purpose and representative selection

This case study translates five **source-confirmed** DaPlanStan design-pattern collaborations into small, dependency-free problems in Java, Python, JavaScript and C++. The selection covers all five detected pattern **types** (not all 14 original instances). The original application and frozen pattern-evolution records were not edited in this aggregation.

| Type | Source ID | Confirmed instance | Simplified problem | Preserved roles | Simplification |
| --- | --- | --- | --- | --- | --- |
| Strategy | S3-N01 | Cancellation Policy Evaluation | Hypothetical cancellation fee and refund | QuoteEvaluator context; FeeStrategy; FlexiblePolicy, ModeratePolicy, StrictPolicy; selecting client | Integer cents and supplied seconds; no Rails booking or external cancellations |
| Observer | P08 | Outbound Mail Delivery Logging | Simulated successful-mail delivery notification | MailDeliveryPublisher; MailObserver/onDelivered; MailLogger; MailMessage; register/unregister | No Action Mailer, SMTP, message delivery or persistent logs |
| Controller | P03 | Trip Creation Coordination | Create one trip, owner membership and cover task | TripCreationController coordinates Trip, Account, TripMember, TripStore, CoverTaskQueue | In-memory storage/queue; no Rails, database or cover-image API |
| Information Expert | P01 | Parsed Email to Trip Record Linking | Link parsed booking to an existing/new trip item | InboxItem expert, InboxReviewController caller, Trip and TripItem domain data | One candidate per fixture; no live email, parsing AI or database |
| Adapter | S2-N01 | Multiple Booking Provider Normalization | Translate Atlas/Beacon raw offers to normalized offers | BookingOfferClient; OfferProvider target; AtlasAdapter, BeaconAdapter; ProviderRegistry; NormalizedOffer | Local differently shaped TSV catalogues, not live provider APIs |


## Common methodology and shared-fixture approach

Each pattern is solved as the **same logical problem** in all four languages, with one common input TSV and one common expected-results TSV. Production implementations and their test runners are separate. Each runner compares the exact numbered fixture outputs against the shared expected results, rather than embedding language-specific expected answers. The Adapter runner also performs provider-isolation assertions, reported separately and excluded from the numbered test count. Fixed inputs replace network calls, a Rails database, real provider bookings and wall-clock conditions.

Production LOC excludes blanks, comment-only lines, test files, TSV fixtures and generated binaries/caches (including C++ `main.hpp` **and** `main.cpp` in the production count). Maximum function CC is a source-level, lexical/AST-assisted McCabe-style approximation: one base unit per function plus conditional branches, loops, switch cases, exception handlers, ternary operators and short-circuit Boolean operators. Language-specific function discovery is documented in the retained measuring scripts; the decision-counting definition did not change. These values are **not** formal compiler complexity measurements.

Java and C++ were compiled before timing. Each language underwent one warm-up and five separately timed fresh-process executions of its entire fixture suite. Timings include runtime startup, TSV reading, test comparisons, other assertions and process exit, but exclude compilation. The table uses the recorded median of the five measured runs, with raw times in the per-language `timings.csv` files. The recordings are machine-specific, not isolated algorithm microbenchmarks.

## Execution environment and shared fixture verification

- Java: OpenJDK `21.0.12.1`; `javac 21.0.12.1`.
- Python: `Python 3.13.5`.
- JavaScript: `Node.js v22.16.0`.
- C++: `g++ 14.2.0`, C++17 (`-O2` in recorded compile commands).

| Pattern | Cases per language | Java | Python | JavaScript | C++ | Total passed |
| --- | --- | --- | --- | --- | --- | --- |
| Strategy | 15 | 15/15 | 15/15 | 15/15 | 15/15 | 60/60 |
| Observer | 7 | 7/7 | 7/7 | 7/7 | 7/7 | 28/28 |
| Controller | 8 | 8/8 | 8/8 | 8/8 | 8/8 | 32/32 |
| Information Expert | 8 | 8/8 | 8/8 | 8/8 | 8/8 | 32/32 |
| Adapter | 10 | 10/10 | 10/10 | 10/10 | 10/10 | 40/40 |
| **Total** | — | 48/48 | 48/48 | 48/48 | 48/48 | **192/192** |


**Total counted fixture cases: 192 passed out of 192; zero recorded failures/errors and exit code zero for each of the 20 verification runs.** Compilation outcomes were checked against the per-pattern compilation evidence; the runtimes/compilers are recorded in the append-ready rows. Standalone fixture tests do not imply the DaPlanStan Rails test suite has run.

## Strategy (S3-N01): Cancellation Policy Evaluation

The `QuoteEvaluator` context selects a `FeeStrategy` through an approved policy code and delegates to three concrete policies—Flexible, Moderate and Strict—through a stable fee-rate method. Java exposes an interface, Python an abstract base class, JavaScript a shared duck-typed method, and C++ an abstract base interface. Fifteen identical cases per language cover the 72-hour and 24-hour boundaries, 10%/50%/100% fees, half-up rounding in integer cents, zero amount, and controlled errors. The strategy variation is in **interchangeable fee algorithms**, not a single combined fee calculation switch. There is no real booking cancellation or refund.

## Observer (P08): Outbound Mail Delivery Logging

A `MailDeliveryPublisher` maintains subscribers and notifies through an observer callback after a simulated successful delivery. `MailLogger` registers and unregisters; `MailMessage` carries event data. Interfaces or abstract bases make the callback explicit in Java, Python and C++, while JavaScript uses a base contract and an observer collection. Seven cases per language exercise successful notification, no registration, failed delivery, changed message content, input errors and unregistration. The C++ example uses non-owning observer pointers valid for the fixed test lifetime. No actual email is sent or logged persistently.

## Controller (P03): Trip Creation Coordination

`TripCreationController` receives the create-trip system event and coordinates a `Trip`, `Account`, `TripMember`, `TripStore` and `CoverTaskQueue`. Responsibility is distributed across domain and supporting collaborators, with successful requests creating one trip, one initial owner membership and one simulated cover task. Eight cases per language test strict Gregorian dates, authentication/owner/title errors, same-day trips and title normalization, plus in-memory side-effect counts. This is GRASP **Controller** as event coordination, not a framework naming convention; it remains demonstrable outside Rails.

## Information Expert (P01): Parsed Email to Trip Record Linking

`InboxItem` owns parsed booking information and the linking/creation decision; an `InboxReviewController` merely invokes it. The `Trip` and `TripItem` types supply the collection and domain context. Eight cases per language verify same-trip name matching, case normalization, creation, preserving existing nonblank references and inbox links, cross-trip isolation and invalid provider names, including state assertions. The responsibility belongs to the information holder regardless of language, so this is GRASP **Information Expert**, not a GoF construction or adapter pattern.

## Adapter (S2-N01): Multiple Booking Provider Normalization

`BookingOfferClient` consumes a common `OfferProvider` target contract and `NormalizedOffer` result. `AtlasAdapter` reads destination-scoped Atlas fields including a compound currency/price; `BeaconAdapter` reads a differently arranged Beacon table with distinct amount and currency fields. `ProviderRegistry` whitelists the two implementations without arbitrary class loading. Ten shared numbered cases per language test normalized offers, invalid providers, destinations, foreign offer IDs and malformed data; additional uncounted checks establish provider isolation. The variation is **data/interface translation** and therefore illustrates Adapter rather than Strategy. Both providers are fictional and no booking or payment is performed.

## Production LOC comparison

| Pattern | Java | Python | JavaScript | C++ |
| --- | --- | --- | --- | --- |
| Strategy | 52 | 54 | 42 | 74 |
| Observer | 47 | 32 | 43 | 60 |
| Controller | 66 | 59 | 55 | 90 |
| Information Expert | 63 | 45 | 38 | 83 |
| Adapter | 120 | 93 | 67 | 141 |


## Maximum per-function cyclomatic complexity

| Pattern | Java | Python | JavaScript | C++ |
| --- | --- | --- | --- | --- |
| Strategy | 12 | 8 | 8 | 15 |
| Observer | 5 | 5 | 5 | 4 |
| Controller | 9 | 10 | 9 | 13 |
| Information Expert | 7 | 7 | 6 | 7 |
| Adapter | 12 | 7 | 8 | 12 |


## Median fresh-process execution time

| Pattern | Java | Python | JavaScript | C++ |
| --- | --- | --- | --- | --- |
| Strategy | 91.907135 | 839.468689 | 30.425864 | 2.582103 |
| Observer | 109.548044 | 1133.244762 | 43.67267 | 2.325304 |
| Controller | 159.472871 | 818.330142 | 37.862085 | 2.565644 |
| Information Expert | 75.601558 | 819.621766 | 36.435657 | 4.390529 |
| Adapter | 71.667737 | 852.239836 | 35.245684 | 2.705641 |


## Cross-language observations

Across these five fixed examples, Java and C++ require more explicit type and interface declarations, particularly for Adapter and the domain-rich Controller. Python and JavaScript generally express the same role assignments with fewer production lines, although the LOC differences depend on the implementations and do not measure maintainability on their own. Java, Python and C++ can express roles through formal interfaces or ABCs, while JavaScript uses a consistent callback/method contract without requiring a class hierarchy. All four languages retain domain responsibility for the two GRASP examples independently of Rails.

The maximum CC reflects each implementation's parsing, validation and dispatch decisions as well as its pattern collaboration. The Adapter is relatively verbose because it must validate two incompatible input schemas; none of these observations establishes a universally superior language. The C++ runner shows the shortest observed complete-process times for these fixed workloads, and Python shows longer measured complete-process times; startup, fixture parsing, assertions, runtime behavior and host conditions substantially influence these figures. They must **not** be treated as pure algorithm-speed rankings or evidence that a pattern works better in one language.

## Twenty-row verification matrix

| Pattern | Language | Compiler/runtime | Fixture tests | LOC | Max CC | Five timings | Append-ready | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Strategy | Java | verified | 15/15 | recorded | recorded | 5 + warm-up | yes | PASS |
| Strategy | Python | verified | 15/15 | recorded | recorded | 5 + warm-up | yes | PASS |
| Strategy | JavaScript | verified | 15/15 | recorded | recorded | 5 + warm-up | yes | PASS |
| Strategy | C++ | verified | 15/15 | recorded | recorded | 5 + warm-up | yes | PASS |
| Observer | Java | verified | 7/7 | recorded | recorded | 5 + warm-up | yes | PASS |
| Observer | Python | verified | 7/7 | recorded | recorded | 5 + warm-up | yes | PASS |
| Observer | JavaScript | verified | 7/7 | recorded | recorded | 5 + warm-up | yes | PASS |
| Observer | C++ | verified | 7/7 | recorded | recorded | 5 + warm-up | yes | PASS |
| Controller | Java | verified | 8/8 | recorded | recorded | 5 + warm-up | yes | PASS |
| Controller | Python | verified | 8/8 | recorded | recorded | 5 + warm-up | yes | PASS |
| Controller | JavaScript | verified | 8/8 | recorded | recorded | 5 + warm-up | yes | PASS |
| Controller | C++ | verified | 8/8 | recorded | recorded | 5 + warm-up | yes | PASS |
| Information Expert | Java | verified | 8/8 | recorded | recorded | 5 + warm-up | yes | PASS |
| Information Expert | Python | verified | 8/8 | recorded | recorded | 5 + warm-up | yes | PASS |
| Information Expert | JavaScript | verified | 8/8 | recorded | recorded | 5 + warm-up | yes | PASS |
| Information Expert | C++ | verified | 8/8 | recorded | recorded | 5 + warm-up | yes | PASS |
| Adapter | Java | verified | 10/10 | recorded | recorded | 5 + warm-up | yes | PASS |
| Adapter | Python | verified | 10/10 | recorded | recorded | 5 + warm-up | yes | PASS |
| Adapter | JavaScript | verified | 10/10 | recorded | recorded | 5 + warm-up | yes | PASS |
| Adapter | C++ | verified | 10/10 | recorded | recorded | 5 + warm-up | yes | PASS |


## Preservation and validation

The five frozen append-ready JSON datasets supply **20 unique pattern/language records** with the exact faculty column names. Every recorded snippet path resolves to a production source file in `Part3/`; C++ header code contributes to reported production LOC even though the snippet path convention points to `main.cpp`. Each logged test-output section exactly matches its shared expected TSV. Each recorded LOC and CC matches its pattern's static-metrics JSON, and each recorded timing median equals the median recalculated strictly for validation from the five logged measured values; no measurement was changed. The historic five cumulative ZIPs preserve the previous archive entries unchanged at each successive stage, from Strategy through Adapter. The final cumulative archive has been integrity-checked.

## Limitations

These are controlled, standalone pattern demonstrations, not proof of whole-application integration or production robustness. Shared fixtures cover specified cases, not exhaustive malformed data, concurrent behavior, provider changes, or storage/transport failures. Code style, type declarations, test harness design and process startup differ across languages. The CC counter is lexical/AST-assisted rather than an independently certified analyzer; five runs on one host do not yield generalizable performance confidence intervals. DaPlanStan's Rails integration tests remain separately blocked by the previously documented Ruby 3.3.8 versus required Ruby 3.4.2 / unavailable Rails 8.1.3 locked dependencies. This aggregation does not perform those tests or live Anthropic, geocoding/Turbo, provider API or cancellation integrations.

## Conclusion

All five confirmed pattern types are represented by one source-grounded collaboration each, in all four required languages, for **20 cross-language implementations**. Their **192 numbered shared-fixture runs passed**, and the completed faculty `cross_language.csv` retains all frozen metrics and execution evidence. The results show that the identified roles and responsibilities can be expressed consistently across languages; they do not establish a language or pattern quality ranking.
