# DaPlanStan — Scenario 2 independent AFTER verification

Source version: `scenario2_multiple_booking_providers` | compared against `scenario1_personalized_itinerary` | Date: 2026-10-11

**Scope**: Source audit and pattern evolution only. Neither source archive nor its original pattern inventory was edited. No Scenario 3 work. This file is not the final `patterns_evolution.csv`.

## 1. Archive, patch and implementation integrity

- Inspected both complete ZIPs and the supplied Scenario 1 → Scenario 2 patch. ZIP CRC checks passed; `patch -p1 --dry-run` succeeded against extracted Scenario 1 source.
- Scenario 1: **412** files; Scenario 2: **429** files; 409 identical paths/bytes, 3 modified files, 17 added files, 0 removed.
- Only original files modified: `config/routes.rb` (`:42`), `app/views/trips/_trip_panel.html.erb` (`:246-253`), `README.md` (`:155-201`).
- SHA-256 Scenario 1 ZIP: `113702be8326da1e15dc7887a7a5a82b88f4b08fbabab95e84f24b05cf9abd3e`
- SHA-256 Scenario 2 ZIP: `9dd94c466280d0ab83998da93b86ab4afc0595c51ceae749cf12dadb8b4e0f28`
- Critical unchanged: TripItemsController, ItinerarySuggestionGenerator, TripItem, Geocodable, GeocodeTripItemsJob, InboxItem, InboxItemsController, TripMailbox, ParseInboxItemJob, Expenses, sessions/membership, `db/structure.sql`, original Scenario 1 tests and import view. No new migration.

## 2. Source-supported AFTER flow

Owner uses Offers (`app/views/trips/_trip_panel.html.erb:246-253`) → nested Rails index route (`config/routes.rb:42`) → `BookingOptionsController#index` (`:6-16`) guarded by authenticated user, scoped trip and `current_member_for(@trip)&.owner?` (`:2-4,66-72`) → `BookingProviders::Registry.find` (`registry.rb:24-30`) → `AtlasAdapter#offers_for` (`atlas_adapter.rb:14-35`) / `BeaconAdapter#offers_for` (`beacon_adapter.rb:14-33`) → respective local fixture → `Registry.validate_offer!` (`registry.rb:38-49`) → nine-field offer hashes and options view (`index.html.erb:19-45`) → POST three identity params → `BookingOptionsController#create` performs independent server-side relookup (`:18-26`) → notes-marker duplicate check (`:28-34`) → `TripItem.idea` save with `added_by`, nil dates/ref/inbox (`:36-46`) → `GeocodeTripItemsJob.perform_later` (`:48-57`) → fresh-model geocode and Turbo trip refresh (`geocode_trip_items_job.rb:4-21`) → existing trip timeline/map. GET creates no records. No payment, confirmation, `InboxItem` or `Expense` is created by this workflow.

## 3. Providers and integrity checks

- Atlas (`config/booking_provider_fixtures/atlas_demo.json:1-69`) has a `destinations.{rome,paris}.offers[]` shape, `id/title/category/location` and nested `price.value/currency`. Atlas maps it at `atlas_adapter.rb:21-30`.
- Beacon (`config/booking_provider_fixtures/beacon_demo.json:1-56`) has flat `results[]` with `code/label/type/address/amount/currency`; mapping at `beacon_adapter.rb:20-28`.
- Each fixture has five distinct IDs across Rome/Paris; `Registry` whitelists only `atlas_demo` and `beacon_demo` (`registry.rb:11-30`); no `constantize` or dynamic provider class loading.
- Both implement `#offers_for(destination_code:)`, return the same validated nine keys (`registry.rb:14,38-49`), with typed/finite/currency checks (`registry.rb:51-66`) and reject malformed catalogue entries.
- POST reads provider/destination/offer ID (`booking_options_controller.rb:19-21`) and derives *all* fields from server-owned normalized data (`:24-26,36-44`), ignoring client-supplied name/amount/kind/status/reference/coordinates.
- The notes marker `[demo_provider_offer:provider_code:offer_id]` is built from validated normalized values (`:28-30,74-76`); `LIKE` query is scoped to same trip and `idea` status and uses `sanitize_sql_like`. Sequential duplicates with intact marker are prevented; concurrency, user-editable notes, or status changes can invalidate that guarantee. Different providers cannot collide in the marker because `provider_code` is part of it.
- `TripItem#defer_geocoding` remains per-instance (`trip_item.rb:32-41`), callback registered (`geocodable.rb:4-6`), and the job reloads each record (`geocode_trip_items_job.rb:8-12`) and broadcasts via Turbo (`:20-21`).

## 4. Pattern decisions

**Adapter (GoF): CONFIRMED — one instance S2-N01.** The client assumes a uniform `offers_for(destination_code:)` call and nine-field offer contract; Atlas and Beacon convert structurally incompatible source-data contracts into this interface and shield the controller from both source schemas. There is no separately declared Target interface or Adaptee Ruby class: the adapted interfaces are fixture data formats. This is one provider-normalization collaboration with two adapter participants, not one per adapter file.

**Controller (GRASP): CONFIRMED NEW INSTANCE — S2-N02.** `BookingOptionsController#index/#create` coordinates a distinct owner-initiated provider browsing/offer-selection use case with a registry, providers, owner authorization, one-item idea persistence and the existing job; P05 coordinates external JSON bulk import, while S1-N01 coordinates Anthropic itinerary personalization. Sharing `TripItem`/geocoding is not duplicate system-event coordination.

**Strategy (GoF): REJECTED.** Provider differences are source-schema normalization, not independently selected alternate domain algorithms; counting another Strategy for exactly the same mapping collaborators would duplicate S2-N01.

**Factory Method/Abstract Factory (GoF): REJECTED.** `Registry.find` is a fixed `case` selecting two constructors (`registry.rb:24-30`), not a creator polymorphism or related-family construction hierarchy. This is ordinary registry/lookup code.

## 5. Evolution statuses and counts

Every continuing instance P01–P09 and S1-N01 is **preserved relative to Scenario 1**, including P05 (which was *modified during Scenario 1*). Those exact collaborations are byte-identical; route and UI additions do not change their coordination responsibilities. P01 email linking (`inbox_item.rb:67-207`), P09 Turbo (`geocode_trip_items_job.rb:4-21`, `inbox_item.rb:1-5`) and S1-N01 generation (`trip_items_controller.rb:60-70,138-197`, `itinerary_suggestion_generator.rb:42-153`) are preserved. Detailed continuing participants and path ranges appear in the JSON.

| ID | Stable instance | Pattern/category | Scenario 2 status |
|---|---|---|---|
| P01 | Parsed Email to Trip Record Linking | Information Expert (GRASP) | `preserved` |
| P02 | Inbound Travel Email Intake Coordination | Controller (GRASP) | `preserved` |
| P03 | Trip Creation Coordination | Controller (GRASP) | `preserved` |
| P04 | Trip Membership Management Coordination | Controller (GRASP) | `preserved` |
| P05 | Bulk Itinerary Import Coordination | Controller (GRASP) | `preserved` |
| P06 | OAuth Sign-in and Identity Linking Coordination | Controller (GRASP) | `preserved` |
| P07 | Account Traveler Enrollment Coordination | Controller (GRASP) | `preserved` |
| P08 | Outbound Mail Delivery Logging | Observer (GoF) | `preserved` |
| P09 | Trip-Scoped Turbo Refresh Notifications | Observer (GoF) | `preserved` |
| S1-N01 | Personalized Itinerary Generation Coordination | Controller (GRASP) | `preserved` |
| S2-N01 | Multiple Booking Provider Normalization | Adapter (GoF) | `newly_introduced` |
| S2-N02 | Multiple Booking Provider Option Coordination | Controller (GRASP) | `newly_introduced` |

**Scenario 2 AFTER:** 8 Controllers (GRASP), 1 Information Expert (GRASP), 2 Observers (GoF), 1 Adapter (GoF) = **12 current instances, 4 distinct pattern types**. The prior Scenario 1 total remains frozen at 10 instances and 3 types. No refactoring observation counted.

## 6. Actual execution evidence

- Independent run: `ruby evidence/isolated_provider_checks.rb` → exit 0, **10 runs / 67 assertions / 0 failures / 0 errors / 0 skips**; covers Ruby provider/fixture behavior without Rails.
- Independent run: `ruby -c` on nine relevant Ruby files → nine `Syntax OK`, exit 0.
- Direct `bin/rails test` in this extracted analysis directory initially failed with shell exit **126** because the extraction environment did not restore executable permissions for `bin/rails`. The original ZIP metadata **does** mark the file executable (`0100755`); this is an extraction/tool artifact, not a diagnosed code defect.
- Independent follow-up `ruby bin/rails test` → **exit 1** with `Bundler::GemNotFound`, starting with missing `rails-8.1.3`; Ruby is 3.3.8, repository specifies 3.4.2. **Zero Rails tests executed**; Rails pass/failure/error/skip counts are not available. The packaged evidence also records this missing-gem blocker.
- Rails tests present but not executed: `test/services/booking_providers_test.rb:1-130`, `test/controllers/booking_options_controller_test.rb:1-161`, `test/models/scenario2_email_and_refresh_regression_test.rb:1-59`. Scenario 1 test files byte-identical to input.
- Live Anthropic: **not run**. Live Geocoder/Turbo: **not run**. Live external provider calls: **none by design**.

## 7. Limitations and recommendation

- Strong source-level verification and append-ready pattern evidence; no reproducible end-to-end Rails run yet.
- Fixtures are fictional Rome/Paris examples; no real availability, payments or booking execution. Sample price is not a quote.
- Provider identity is encoded in mutable `TripItem.notes` rather than a relational key. No DB uniqueness constraint; simultaneous POSTs can duplicate records. A change to idea status or notes also defeats marker-based matching.
- The unchanged name-based InboxItem link matcher should be regression-tested under Rails; provider-prefixed demo item names reduce collisions but do not prove behavior until Rails tests run.
- No implementation defect requiring a silent fix was identified in the inspected Scenario 2 path. No source changes made.
- **Handoff**: Scenario 2 source/pattern audit is documented and can proceed to Scenario 3 *design*, but Rails integration and regression checks remain blocked and must be completed before the implementation is represented as fully runtime-verified.

Append-ready per-instance `participant_roles`, `source_locations`, `intent_and_evidence`, `status_after_change`, and `change_description` are in `Scenario2_evolution_rows_append_ready.json` (not the final cross-scenario CSV).
