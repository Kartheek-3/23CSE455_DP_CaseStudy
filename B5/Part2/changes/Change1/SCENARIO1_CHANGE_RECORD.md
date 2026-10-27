# DaPlanStan — Scenario 1 AFTER source record

**AFTER source label:** `scenario1_personalized_itinerary`  
**Frozen BEFORE source:** user-provided `daplanstan-main(1).zip`  
**SHA-256 of untouched BEFORE ZIP:** `69af480a1a3bfecc7580b3b6b7b8f44f4df2414315d5434c8e40c67eb63475a9`  
**Frozen Part 2 ZIP SHA-256:** `ddbf38832bf1b1601a89574c813388462936c4b6368c9e6560dd49bad0560a3a`  
**Scope:** Personalized itinerary generation only. No provider/cancellation work, migration, pattern reclassification or `patterns_evolution.csv`.

## BEFORE evidence (relative paths in original source ZIP)

| BEFORE file | BEFORE lines | Observed behavior |
|---|---:|---|
| `config/routes.rb` | 21–39 | Nested trip-item routes; import GET/POST only |
| `app/controllers/trip_items_controller.rb` | 31–58 | Original JSON preview/confirmation |
| `app/controllers/trip_items_controller.rb` | 64–73 | Manual item create |
| `app/controllers/trip_items_controller.rb` | 118–124 | Trip scoped through current user's trips |
| `app/controllers/trip_items_controller.rb` | 126–180 | Batch create, global `skip_callback`/`set_callback`, parsing, deduplication, job enqueue |
| `app/models/trip_item.rb` | 9–28, 30–37 | Enum, validation, geocoding override |
| `app/models/concerns/geocodable.rb` | 4–6, 12–22 | `after_save` when name/address changes; synchronous geocoding |
| `app/jobs/geocode_trip_items_job.rb` | 4–21 | Existing job, geocoding, trip Turbo broadcast |
| `app/views/trip_items/import.html.erb` | 29–108, 118–232 | Preview and JSON input |
| `app/views/trips/_trip_panel.html.erb` | 1, 178–249 | Owner context and existing import entry point |
| `app/jobs/parse_inbox_item_job.rb` | 127–139 | Existing Anthropic client style and tool input extraction |
| `config/application.rb` | 15 | Rails test-unit railtie commented out |

Source areas inspected but unchanged: `app/models/concerns/geocodable.rb`, `app/jobs/geocode_trip_items_job.rb`, `app/jobs/parse_inbox_item_job.rb`, `app/models/trip.rb`, `app/models/trip_member.rb`, `app/controllers/application_controller.rb`.

## Files changed or created (AFTER line ranges)

| Change | AFTER path | Responsibility / important evidence | Class |
|---|---|---|---|
| Modified | `config/routes.rb` | 30–41, adds GET/POST `generate` without removing import | Feature |
| Modified | `app/controllers/trip_items_controller.rb` | 60–70 owner-only action; 138–197 preview/signed confirmation/validation; 201–253 shared batch persistence with instance-scoped deferral and strict mode | Feature/refactoring |
| Modified | `app/models/trip_item.rb` | 32–41 transient `defer_geocoding` flag and callback-method guard | Refactoring |
| Modified | `app/views/trip_items/import.html.erb` | 20, 35–43, 68–70, 99–114, 125–127 generated preview accept/reject mode; ordinary import retained | UI |
| Modified | `app/views/trips/_trip_panel.html.erb` | 236–247 owner-only Generate entry | UI |
| Modified | `config/application.rb` | 15 enables existing Rails test-unit railtie (previously commented) | Test configuration |
| Modified | `README.md` | 112–148 V1 feature/run/test instructions | Documentation |
| New | `app/services/itinerary_suggestion_generator.rb` | 1–153; preference validation 42–54; suggestion validation 56–104; Anthropic tool call 111–138 | Feature |
| New | `app/views/trip_items/generate.html.erb` | 1–46 four preference inputs, controlled error, Generate/Cancel | UI |
| New | `test/test_helper.rb` | 1–23 setup and fixture builder | Testing |
| New | `test/services/itinerary_suggestion_generator_test.rb` | 1–112 service validation, fake Anthropic, error handling | Testing |
| New | `test/controllers/trip_items_generation_test.rb` | 1–110 authorization, preview, confirm, tampering, duplicate, API error | Testing |
| New | `test/controllers/trip_items_import_regression_test.rb` | 1–52 existing import/manual geocoding/callback regression | Testing |
| New | `evidence/isolated_service_checks.rb` | stdlib-only service validation shim; **not** a Rails integration test | Verification |
| New | `evidence/isolated_service_checks_output.txt` | Executed isolated test output | Verification |
| New | `evidence/ruby_syntax_checks.txt` | Ruby syntax results | Verification |
| New | `evidence/rails_test_attempt.log` | Attempted Rails command and actual Bundler exception | Verification |
| New | `evidence/runtime_verification_summary.txt` | Runtime and blocked-test summary | Verification |
| New | `SCENARIO1_CHANGE_RECORD.md` | Baseline/AFTER handoff and limitations | Documentation |

**Added routes** in `config/routes.rb` inside `resources :trip_items` / `collection`:

```ruby
get  :generate
post :generate
```

## BEFORE → AFTER

**BEFORE:** user creates trip → manually edits itinerary or copies external AI prompt → pastes JSON → preview → confirm → `bulk_create_items` → `GeocodeTripItemsJob` → timeline/map.

**AFTER:** trip owner selects Generate → transient interests/budget/pace/notes → controller checks owner → generator validates inputs → Anthropic schema-based tool call → generator validates up to six entries → existing preview with signed 20-minute trip/user-bound payload → Reject (save nothing) **or** Accept (signature + strict JSON validation + transaction) → existing `bulk_create_items` saves `idea` TripItems with `added_by` → existing geocoding job → timeline/map.

## Callback safety

The BEFORE batch controller globally called `TripItem.skip_callback(:save, :after, :geocode_from_address)` and restored it with `set_callback` in `ensure`. The AFTER batch builder uses `TripItem.new`, sets `item.defer_geocoding = true` before `item.save!`, and the TripItem override returns early **only on that instance**. Its unchanged parent `Geocodable` callback remains registered for every instance, so unrelated/manual saves retain normal synchronous behavior. `GeocodeTripItemsJob` loads fresh instances without the transient flag and geocodes normally. For generated confirmation, record creation is transactional, with job queueing after commit.

## Validation, security and handling

- Only `culture`, `food`, `nature`, `shopping`; budget `low`/`medium`/`high`; pace `relaxed`/`balanced`/`busy`; note max 300 chars; at least one interest.
- Tool output must be a nonempty array of <=6 hash suggestions; keys restricted to `name`, `kind`, `address`, `notes`, `starts_at`, `ends_at`. Kind is `eat`, `do`, `shop`, `other` only. Length/date/time constraints enforced; end time cannot precede start; dates must fall within trip dates.
- No generated coordinates, URL, amount, currency, status, expense or booking data accepted. Persistence forces `status: idea` and `added_by: current_user`.
- GET and both POST states require an authenticated **trip owner membership**, not merely link visibility. Unrelated trips are blocked by original `set_trip` scoping. Existing ordinary import authorization is unchanged.
- Preview persists nothing. The Accept POST must supply a valid not-expired signed payload matching the current user/trip and revalidated submitted JSON. Reject is a link with no write. Failures in strict generated-record persistence roll back transaction; job enqueue failure after commit is explicitly communicated.
- Duplicates use unchanged case-insensitive name matching. Limitation: different same-named venues may be treated as duplicates. Existing ordinary import continues to use per-item skip-on-error behavior.

## Verification actually completed

- Ruby syntax: `ruby -c` on **9 changed/new Ruby files**, all `Syntax OK` (see `evidence/ruby_syntax_checks.txt`).
- Offline validation shims: `ruby evidence/isolated_service_checks.rb` → **6 runs, 20 assertions, 0 failures, 0 errors, 0 skips** (see output). These checks load actual generator logic but substitute minimal Rails utility methods; **they do not verify Rails routing, views, controllers or persistence**.
- Rails integration: `bin/rails test` → **exit 1, blocked before test discovery** (`Bundler::GemNotFound` for Rails 8.1.3 and locked gems; Ruby 3.3.8 vs required 3.4.2). **0 Rails test cases executed; Rails passes/failures/errors/skips not available**, not zero failures from a run.
- Do **not** claim a live Anthropic request, database integration, route rendering or map update was tested.

## Deviations from initial design

- Confirmation uses an expiring, signed preview token in addition to revalidation, protecting against modifications to hidden JSON while preserving transient preferences (no migration).
- Batch generation uses `strict: true, enqueue: false` to roll back on persistence errors and queue geocoding after commit; ordinary import defaults retain best-effort per-item handling.
- Enabled the single commented Rails test-unit railtie after confirming the supplied project had no test suite or enabled test railtie; Rails environment was not available to verify this at runtime.
- For a failed background job enqueue **after** commit, the controller warns that ideas were saved but pins could not be queued rather than implying nothing persisted.

## Next AFTER pattern verification — source boundaries

Reinspect `app/controllers/trip_items_controller.rb:31–70,138–253`, `app/services/itinerary_suggestion_generator.rb:42–153`, `app/models/trip_item.rb:32–41`, `app/models/concerns/geocodable.rb`, `app/jobs/geocode_trip_items_job.rb`, both relevant trip-item views, and `config/routes.rb`. Compare against frozen P05 and P09 collaborators without assigning status until tests and source-based participant verification. **No `patterns_evolution.csv` has been created.**
