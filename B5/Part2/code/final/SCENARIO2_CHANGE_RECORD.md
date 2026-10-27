# Scenario 2 — Multiple Booking Providers: Source Change Record

- **Source version:** `scenario2_multiple_booking_providers`
- **Starting source:** the complete `scenario1_personalized_itinerary_AFTER.zip` (not the original DaPlanStan baseline)
- **Starting ZIP SHA-256:** `113702be8326da1e15dc7887a7a5a82b88f4b08fbabab95e84f24b05cf9abd3e`
- **Date:** 2026-10-11
- **Status:** Source implemented and statically checked; Rails runtime/integration verification **blocked**.
- **Pattern inventory:** P01–P09 and S1-N01 unchanged, 10 confirmed current instances / 3 distinct pattern types. No Scenario 2 pattern status or instance is claimed.
- **Scope guard:** No Scenario 3 cancellation functionality; no live provider API; no payment, real reservation, made-up confirmation reference, Expense creation, or schema migration.

## Requirement and acceptance criteria

Implement a local, reproducible example of supporting two independent booking-provider inputs. Trip **owners** may browse fictional travel options for Rome/Paris from Atlas Demo and Beacon Demo, see provider and sample cost information, and add a selected option to their trip **as an idea only**. Both providers must return identical application-facing fields despite genuinely different fixture schemas. Reject invalid providers, destinations, offers and malformed fixture entries. Ignore browser-controlled offer attributes. Avoid sequential duplicate ideas for the same provider/offer ID. Use the unchanged Scenario 1 per-record deferred-geocoding behavior. Existing generated ideas, manual TripItems, JSON import, email ingestion, Trip membership and Turbo broadcasting should continue working.

**Do not interpret locally generated offers as live inventory or actual reservations.** The offer saved on acceptance is not a booking transaction or payment.

## Verified Scenario 2 BEFORE (Scenario 1 AFTER input)

- `config/routes.rb:21–48`: existing trip resources; `:import` and `:generate` collection paths at `:30–41`; no booking-option routes.
- `app/views/trips/_trip_panel.html.erb:178–259`: owner-only action panel, including existing Generate `:236–244` and Import `:246–255`; no provider-options entry.
- `app/models/trip_item.rb:9–28,32–41`: `kind`/`status` enums, name validations, `defer_geocoding` and normal `geocode_from_address` override.
- `app/models/concerns/geocodable.rb:4–19`: normal `after_save` geocoding callback.
- `app/jobs/geocode_trip_items_job.rb:4–21`: fresh item lookup, geocoding, Turbo trip refresh.
- `app/controllers/trip_items_controller.rb:31–70,76–85,201–253`: existing JSON import, owner-only generation and shared batch idea creation.
- `app/services/itinerary_suggestion_generator.rb:42–153`: Anthropic suggestion generation and validation.
- `app/mailboxes/trip_mailbox.rb:2–31`: real confirmation email ingestion.
- `app/jobs/parse_inbox_item_job.rb:20–139`: Anthropic extraction of confirmation provider and reference data.
- `app/models/inbox_item.rb:19–25,67–207`: real booking-email linking and associated Expense creation.
- `app/controllers/inbox_items_controller.rb:16–35`: real confirmation review.
- `db/structure.sql:91–104`: TripItem supports name, kind, idea, notes, address, optional amount/currency and confirmation reference; no dedicated provider field or required migration.
- `test/test_helper.rb` and existing Scenario 1 test files were inspected and copied without modification.

## Actual AFTER workflow

1. Owner sees **Offers** on trip panel (`app/views/trips/_trip_panel.html.erb:246–253`) and opens nested `booking_options#index` (`config/routes.rb:42`).
2. `BookingOptionsController#index` (`:6–16`) checks authenticated trip ownership via callbacks (`:2–4,66–72`), selects a fixed provider and destination, calls the provider's `#offers_for(destination_code:)`, and renders normalized offer cards (`app/views/booking_options/index.html.erb:1–49`). **No persistence** happens on GET.
3. Atlas and Beacon read separate local fixtures; their adapters normalize their different raw field names and type values (`atlas_adapter.rb:14–37`, `beacon_adapter.rb:14–35`). The registry owns the strictly whitelisted provider/destination selection and common field validations (`registry.rb:11–68`).
4. Browser submits **only** `provider_code`, `destination_code`, and `offer_id` to `booking_options#create` (`booking_options_controller.rb:18–26`). The selected provider and its offer are resolved again from trusted local fixtures, rejecting cross-provider or cross-destination IDs.
5. A stable notes marker `[demo_provider_offer:CODE:ID]` allows the controller to detect an existing **idea** for that same provider/offer ID (`:28–34`). A new entry (`:36–46`) has `status: idea`, `added_by: current_user`, provider-prefixed name, explanatory demo notes, sample amount/currency and optional address. The stored dates, `confirmation_ref`, and `inbox_item_id` are `nil`. There is no Expense or InboxItem created.
6. A new item's instance-only `defer_geocoding` flag skips synchronous geocoding; unchanged `GeocodeTripItemsJob.perform_later` (`:48–57`) later loads it afresh and uses the existing Turbo trip refresh (`geocode_trip_items_job.rb:4–21`). A failed enqueue produces a warning, not a false claim that geocoding succeeded.
7. The existing trip timeline and map display the saved idea without new rendering code.

## Production files modified (relative to Scenario 1 input)

| File | AFTER line(s) | Type | Actual modification |
|---|---|---|---|
| `config/routes.rb` | 42 | Feature | Add `resources :booking_options, only: [ :index, :create ]` inside existing trip scope; original trip-item and inbox declarations remain. |
| `app/views/trips/_trip_panel.html.erb` | 246–253 | UI | Add an **Offers** owner-only link within the existing owner section; retain Generate and Import links. |
| `README.md` | 155–201 | Documentation | Explain sample-only provider workflow, test commands, remaining concurrency limits and blocked Rails tests. |

## Newly added production files

| File | AFTER line(s) | Responsibility |
|---|---|---|
| `app/controllers/booking_options_controller.rb` | 1–77 | Trip-owner authorization; GET provider comparison; POST server-side relookup, duplicate check, idea save and job enqueue. `index:6–16`, `create:18–62`. |
| `app/services/booking_providers/registry.rb` | 1–68 | Approved provider/destination whitelist, provider lookup, normalized offer-field/kind/price validation and controlled error classes. |
| `app/services/booking_providers/atlas_adapter.rb` | 1–37 | Read Atlas's `destinations → offers`, map `title`, `category`, `location`, nested `price` to normalized output. |
| `app/services/booking_providers/beacon_adapter.rb` | 1–35 | Read Beacon's flat `results`, map `label`, `type`, `address`, `amount` and `currency` to normalized output. |
| `app/views/booking_options/index.html.erb` | 1–49 | Provider and destination selector, fictional offer cards, sample amounts and Add as idea forms; clear no-booking/no-payment disclaimer. |
| `config/booking_provider_fixtures/atlas_demo.json` | Entire file | Local fictional Atlas data: Rome and Paris, 5 stable offers overall. |
| `config/booking_provider_fixtures/beacon_demo.json` | Entire file | Different local Beacon data shape: Rome and Paris, 5 stable offers overall. |

### Normalized offer contract

Both adapters return frozen offer hashes containing **exactly** `provider_code`, `provider_name`, `offer_id`, `name`, `kind`, `address`, `description`, `sample_amount`, and `currency`. `Registry.validate_offer!` rejects extra/missing normalized keys, incorrect provider identity, malformed IDs, missing/oversized text, invalid kinds, invalid amounts and currencies. A currency must be a three-letter uppercase code; a non-nil amount must be non-negative, finite, at most 100,000 and have at most two decimal places. Provider outputs carry no confirmation reference or reservation status. Separate fixture schemas, not a fabricated common upstream schema, are normalized by the adapters.

## Newly added test and evidence files

| File | AFTER line(s) | Purpose |
|---|---|---|
| `test/services/booking_providers_test.rb` | 1–130 | Provider whitelist, normalization, different raw shapes, supported destinations, invalid fixtures and kinds/amounts, isolation and frozen results. **Written, not executed under Rails.** |
| `test/controllers/booking_options_controller_test.rb` | 1–161 | Owner/non-owner/unrelated access; both providers; persistence as idea; tampering; invalid/cross-provider IDs; duplicate checks; no Expense or InboxItem; deferred geocoding. **Written, not executed under Rails.** |
| `test/models/scenario2_email_and_refresh_regression_test.rb` | 1–59 | Existing real confirmation email linking/expense flow stays distinct from mock ideas; fresh-object geocoding job/Turbo refresh. **Written, not executed under Rails.** |
| `evidence/isolated_provider_checks.rb` | Entire file | Standalone Minitest tests of fixture normalization and provider validation without Rails or network calls. |
| `evidence/isolated_provider_checks_output.txt` | Entire file | Actual results of standalone test run. |
| `evidence/scenario2_ruby_syntax_checks.txt` | Entire file | Actual `ruby -c` result for nine Scenario 2 Ruby files. |
| `evidence/scenario2_rails_test_attempt.log` | Entire file | Actual `bin/rails test` boot failure. |
| `evidence/ruby_version_check.log` | Entire file | Actual required-versus-active Ruby comparison. |
| `evidence/source_integrity_audit.txt` | Entire file | Scenario 1 input SHA-256 and file-level delta. |

The original Scenario 1 `evidence/rails_test_attempt.log` and `evidence/ruby_syntax_checks.txt` were **restored unchanged** after the new test runs; Scenario 2 gets separately named log files. All original Scenario 1 tests, generator, import, callback, geocoding, email-ingestion and schema files remain byte-identical to the input snapshot.

## Actual test and environment results

| Type | Command | Result | Executed / pass / failure / error / skip |
|---|---|---|---|
| Ruby syntax | `ruby -c` on nine relevant Ruby source/test files | Exit 0 for each; all `Syntax OK` | 9 files checked |
| Isolated provider validation | `ruby evidence/isolated_provider_checks.rb` | Exit 0 | 10 runs / 10 passes / 0 failures / 0 errors / 0 skips; 67 assertions |
| Rails suite | `bin/rails test` | Exit 1, `Bundler::GemNotFound`, beginning with `rails-8.1.3` | **0 Rails tests executed**; pass/failure/error/skip counts not available |
| Ruby environment | `ruby -v`; compare against `.ruby-version` | Active Ruby **3.3.8**, required **3.4.2** | Mismatch |
| Real booking-provider network | No command; intentionally not used | No external provider APIs in this feature | N/A |
| Anthropic live integration | Not run | Scenario 1 generation preserved at source level | Unverified at runtime |
| Geocoder/Turbo live | Not run | Existing job unchanged; tests written but Rails blocked | Unverified at runtime |

The Rails test command failed **before test discovery**. The isolated provider checks are real executions but do not test Rails authorization, persistence, routing or callbacks. No Rails regression is represented as passed.

## Source safety and regression record

1. `app/services/itinerary_suggestion_generator.rb` and original Scenario 1 generation/controller/import code are untouched.
2. `app/models/trip_item.rb` still uses instance-scoped `defer_geocoding`; no `skip_callback` or `set_callback` introduced.
3. `app/models/concerns/geocodable.rb` and `app/jobs/geocode_trip_items_job.rb` are untouched.
4. `app/mailboxes/trip_mailbox.rb`, `app/jobs/parse_inbox_item_job.rb`, `app/models/inbox_item.rb`, `app/controllers/inbox_items_controller.rb`, and `app/models/expense.rb` are untouched.
5. `db/structure.sql` is untouched; no new migration.
6. Existing Scenario 1 tests for generating, importing, manual saving and deferred callbacks are byte-identical. Two extra Scenario 2 regression cases were added for inbox linking and Turbo.
7. Fixture rows are clearly fictional and include no real inventory or live prices. No payment/booking execution code or created confirmation references.
8. The only original source modifications are `config/routes.rb`, `app/views/trips/_trip_panel.html.erb`, and `README.md`.

## Differences from design and remaining limitations

- Implementation follows the approved Scenario 2 design. A small **controlled notes marker** makes sequential deduplication provider+offer-specific without changing the schema. A separate test verifies real booking emails remain conceptually distinct from demo ideas.
- The mock destinations are a fixed Rome/Paris selector because Trip has no reliable destination attribute.
- Prices are hypothetical estimates only. TripItem may show them, but no expense is created automatically.
- Without a uniqueness constraint, concurrent POST requests can still insert duplicate ideas; sequential requests are checked.
- No real provider API, pricing, availability, settlement, cancellation or confirmation behavior is implemented.
- Saved provider identity and offer ID live in notes, not relational columns. Future live integrations would need a stronger schema.
- Rails integration tests, UI routing, database writes, email regression and Turbo delivery remain unverified until compatible Ruby, gems and database setup are available.

## Pattern-verification handoff — candidates only

Inspect the **proposed Adapter (GoF)** collaboration across `Registry`, `AtlasAdapter`, `BeaconAdapter` and the controller, focusing on whether the adapters genuinely adapt distinct interfaces rather than ordinary fixture parsing. Inspect the **proposed Controller (GRASP)** collaboration around `BookingOptionsController#index/#create` and its collaborators, comparing its distinct user events to P05 and S1-N01. Consider a possible Strategy classification only if source-level algorithm interchange (not merely same method names) supports it; do not double-count a single provider-normalization collaboration. `Registry.find` alone does not justify Factory. Check P01 and P09 for behavioral interaction, but do not assign evolution statuses here.

**Pattern counts remain the Scenario 1 verified counts:** Controller 7, Information Expert 1, Observer 2; total instances 10, distinct types 3. No `patterns_evolution.csv` has been created.
