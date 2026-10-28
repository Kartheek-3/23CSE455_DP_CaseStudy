# Final evolution aggregation validation

- Input baseline file: `DaPlanStan_Part2/patterns.csv` inside supplied frozen Part 2 ZIP; 9 rows, SHA-256 of original CSV bytes: `130586c94cd5d9c8fdb70951d7824dd7985bb6b57cb4a5142b3d624db73b0356`.
- Original baseline pattern counts CSV SHA-256: `8ba3596b405fda7d9f5eeea284ff8d886f48dfdaf66c2ea9a103de8a4ec42e18`.
- Four version labels: `baseline`, `scenario1_personalized_itinerary`, `scenario2_multiple_booking_providers`, `scenario3_cancellation_policies`.
- Final `patterns_evolution.csv`: **45 records**, exact required 9 columns, UTF-8, one header.
- Version row counts: **9, 10, 12, 14**. No removed or replaced collaborations.
- Final `pattern_counts.csv`: **23 records** (15 positive per-pattern rows + 8 version-total rows); exactly required 4 columns.
- Optional `patterns_multiversion_candidate.csv`: **45 records**, original seven columns; intentionally not a modification of the frozen baseline `patterns.csv`.
- Matrix: **14 unique IDs** with one row per stable collaboration.
- All 9 baseline records have their original 7 fields preserved exactly as strings in the evolution dataset. For baseline rows, the only additions are `status_after_change=baseline` and an empty `change_description`.
- Earlier-version classifications and names are stable; all successive statuses match the source-verified append-ready records.
- Local application source-location segments were validated against archived files and bounded line numbers; P09's three dependency references are preserved as external Turbo Rails paths (not contained in application ZIPs). No line-range values were reconstructed or modified.
- No Rails integration test results have been invented. All standalone tests and syntax results remain separately labeled.

## Status matrix

| ID | Stable instance | Original | Scenario 1 | Scenario 2 | Scenario 3 |
|---|---|---|---|---|---|
| P01 | Parsed Email to Trip Record Linking | baseline | preserved | preserved | preserved |
| P02 | Inbound Travel Email Intake Coordination | baseline | preserved | preserved | preserved |
| P03 | Trip Creation Coordination | baseline | preserved | preserved | preserved |
| P04 | Trip Membership Management Coordination | baseline | preserved | preserved | preserved |
| P05 | Bulk Itinerary Import Coordination | baseline | modified | preserved | preserved |
| P06 | OAuth Sign-in and Identity Linking Coordination | baseline | preserved | preserved | preserved |
| P07 | Account Traveler Enrollment Coordination | baseline | preserved | preserved | preserved |
| P08 | Outbound Mail Delivery Logging | baseline | preserved | preserved | preserved |
| P09 | Trip-Scoped Turbo Refresh Notifications | baseline | preserved | preserved | preserved |
| S1-N01 | Personalized Itinerary Generation Coordination | — | newly_introduced | preserved | preserved |
| S2-N01 | Multiple Booking Provider Normalization | — | — | newly_introduced | preserved |
| S2-N02 | Multiple Booking Provider Option Coordination | — | — | newly_introduced | preserved |
| S3-N01 | Cancellation Policy Evaluation | — | — | — | newly_introduced |
| S3-N02 | Cancellation Quote Coordination | — | — | — | newly_introduced |

## Source-path audit

| Version | Check | Result |
|---|---|---|
| baseline | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/models/concerns/turbo/broadcastable.rb |
| baseline | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/channels/turbo/streams_channel.rb |
| baseline | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/channels/turbo/streams/broadcasts.rb |
| baseline | Checked application source-location segments | 65 |
| scenario1_personalized_itinerary | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/models/concerns/turbo/broadcastable.rb |
| scenario1_personalized_itinerary | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/channels/turbo/streams_channel.rb |
| scenario1_personalized_itinerary | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/channels/turbo/streams/broadcasts.rb |
| scenario1_personalized_itinerary | Checked application source-location segments | 79 |
| scenario2_multiple_booking_providers | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/models/concerns/turbo/broadcastable.rb |
| scenario2_multiple_booking_providers | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/channels/turbo/streams_channel.rb |
| scenario2_multiple_booking_providers | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/channels/turbo/streams/broadcasts.rb |
| scenario2_multiple_booking_providers | Checked application source-location segments | 98 |
| scenario3_cancellation_policies | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/models/concerns/turbo/broadcastable.rb |
| scenario3_cancellation_policies | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/channels/turbo/streams_channel.rb |
| scenario3_cancellation_policies | External dependency reference retained (not in application ZIP) | Turbo Rails 2.0.23: app/channels/turbo/streams/broadcasts.rb |
| scenario3_cancellation_policies | Checked application source-location segments | 118 |

## Manual final-submission checks

1. Run Rails integration/regression tests with Ruby 3.4.2 and locked Rails 8.1.3 dependencies; record actual pass/fail/error/skip counts.
2. Have a human reviewer validate the four-version source-role evidence and status transitions, and check source paths after placing files in the team folder.
3. Decide where the single final team-root `patterns.csv` belongs; keep the original frozen baseline `DaPlanStan_Part2/patterns.csv` unchanged, while optionally using the separate multiversion candidate for the faculty root dataset.
4. Confirm team assignment expects all five detected types in cross-language analysis as faculty instructions indicate; document any different faculty-approved scope.
5. Ensure actual Git/source provenance, team contributions and archived LLM prompt/output records are documented; the baseline package notes historical raw-output placeholders and unverified commit equivalence.
