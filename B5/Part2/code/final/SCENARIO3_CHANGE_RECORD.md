# Scenario 3 — AFTER Change Record

## Provenance and scope
- Source version: `scenario3_cancellation_policies`
- Input source (never edited): `/mnt/data/scenario2_multiple_booking_providers_AFTER.zip`
- Input SHA-256: `9dd94c466280d0ab83998da93b86ab4afc0595c51ceae749cf12dadb8b4e0f28`
- Starting state: 12 confirmed collaborations across 4 types, unchanged until a separate pattern verification.
- Feature: **hypothetical cancellation quotes only**, no real cancellation, refunds, payment, booking-state or database changes.
- No migrations; `db/structure.sql` is byte-identical to Scenario 2.

## BEFORE state, Scenario 2 source evidence
- `app/models/trip_item.rb:21–24`: status enum `idea` or `confirmed` only.
- `app/controllers/trip_items_controller.rb:89–106`: update, delete and status toggle operate on local itinerary, not provider cancellations.
- `app/controllers/expenses_controller.rb:74–85`: local expense delete and confirmation.
- `app/models/inbox_item.rb:12–14,27–58,67–99,101–207`: review status, genuine email booking linkage, booking Expense creation.
- `app/controllers/booking_options_controller.rb:18–57`: prospective demo ideas, never bookings.
- `app/jobs/parse_inbox_item_job.rb:20–139`: extraction of booking facts but no contractual cancellation rules.
- `app/mailboxes/trip_mailbox.rb:2–31`: incoming booking email intake.
- `db/structure.sql:91–125`: TripItem amount, currency, start, ref and InboxItem link; Expense records.
- `config/routes.rb:30–49`: nested itinerary, import, generation, provider and inbox routes.
- `app/views/trip_items/show.html.erb:127–177,238–297`: booking-reference display fallback, edit/delete actions.

## AFTER workflow
Owner opens a confirmed email-linked TripItem → link to `new_trip_trip_item_cancellation_quote_path` → `CancellationQuotesController#new` → check membership and eligibility → choose Flexible/Moderate/Strict → POST `CancellationQuotesController#create` → `QuoteEvaluator#call` reads stored booking fields and invokes the selected stateless policy → BigDecimal hypothetical fee/refund → render same view with disclaimer. **No writes, external calls or job enqueue.**

## Eligibility and authorization
- `app/services/cancellation_policies/quote_evaluator.rb:60–73`: `confirmed?`, actual InboxItem relation with confirmed review, **own** nonblank `confirmation_ref`, start time, amount >= 0, and currency in EUR/GBP/USD.
- `app/controllers/cancellation_quotes_controller.rb:26–33`: user-scoped Trip and TripItem; owner-only GET and POST.
- `app/controllers/cancellation_quotes_controller.rb:6–22`: both actions verify eligibility; POST accepts only policy code and supplies `Time.current`. Error messages are controlled.
- Manually confirmed ideas, generated ideas and provider demo ideas remain ineligible unless they acquire the genuine booking evidence required by the frozen specification.

## Policy rules (fee %)
| Time difference `starts_at - evaluated_at` | Flexible | Moderate | Strict |
| --- | ---: | ---: | ---: |
| >= 72 hours | 0 | 0 | 100 |
| >= 24 and < 72 hours | 0 | 50 | 100 |
| > 0 and < 24 hours | 10 | 100 | 100 |
| <= 0 hours | 100 | 100 | 100 |

`Flexible#fee_rate` in `app/services/cancellation_policies/flexible.rb:5–12`, `Moderate` in `moderate.rb:5–12`, and `Strict` in `strict.rb:5–9`; all return BigDecimal rates.

`QuoteEvaluator` (`quote_evaluator.rb:13–22,32–55`) selects a whitelisted class, computes fee using `(amount * rate).round(2, BigDecimal::ROUND_HALF_UP)`, and returns the eight fields: policy_code, policy_name, original_amount, fee_amount, refund_amount, currency, refundable, explanation. Refund = stored original amount - rounded fee, so totals balance. An explicit evaluation timestamp is required. Invalid input raises a controlled Error subclass. A zero-cost item is valid but `refundable` is false.

## File-level change locations
### Existing modified
- `config/routes.rb:37`: singular nested `resource :cancellation_quote, only: [:new, :create]` (new feature route).
- `app/views/trip_items/show.html.erb:207–212`: owner-only and eligibility-dependent quote entry point (UI).
- `README.md`: new Scenario 3 instructions, rules and verification commands (documentation).

### Newly introduced application files
- `app/controllers/cancellation_quotes_controller.rb:1–43`: GET/new, POST/create, access, user-scoped lookup, error rendering (feature/controller).
- `app/services/cancellation_policies/flexible.rb:1–13`: fictional Flexible rules.
- `app/services/cancellation_policies/moderate.rb:1–13`: fictional Moderate rules.
- `app/services/cancellation_policies/strict.rb:1–10`: fictional Strict rules.
- `app/services/cancellation_policies/quote_evaluator.rb:1–84`: eligibility, deterministic selection, money-safe quote and controlled errors.
- `app/views/cancellation_quotes/new.html.erb:1–35`: form, quote, back link, explicit hypothetical-only disclaimer (UI).

### New tests and evidence
- `test/services/cancellation_policies_test.rb:1–115`: Rails unit tests: deadlines, validation, money, currency, refusal and no mutation.
- `test/controllers/cancellation_quotes_controller_test.rb:1–131`: Rails controller tests: access, GET/POST, tampering, no writes, no network/job path.
- `evidence/isolated_cancellation_policy_checks.rb`: standalone Ruby policy validation without Rails (executed).
- `evidence/isolated_policy_checks_output.txt`: actual isolated result.
- `evidence/scenario3_ruby_syntax_checks.txt`: syntax verification output.
- `evidence/rails_scenario3_test_attempt.log`: focused Rails test command and actual dependency error.
- `evidence/rails_full_test_attempt.log`: full Rails test command and actual dependency error.
- `evidence/scenario3_runtime_verification_summary.txt`: split by execution tier.
- `SCENARIO3_CHANGE_RECORD.md`: this document.

## Acceptance coverage
- Three stateless policies, single `fee_rate(seconds_until_start:)` contract; exact 72h and 24h boundaries and one-second offsets.
- Whitelist allows only flexible/moderate/strict; unknown code rejected; no constantize.
- Signed-in owner access; item scoped to trip; non-owner denied.
- Ineligible idea, unconfirmed email, missing own reference, missing start, amount or unsupported currency rejected.
- Use only server-loaded amount/start/currency; browser tampering does not override stored data.
- Quote-only GET and POST: no TripItem/InboxItem/Expense mutation, no cancellation record or external request.
- Persistent Scenario 1 generation/import and Scenario 2 provider comparison unchanged.

## Verification (actual, not estimated)
- Ruby available: `3.3.8`; repository `.ruby-version`: `ruby-3.4.2`.
- Command: `ruby evidence/isolated_cancellation_policy_checks.rb` → **10 runs, 45 assertions, 0 failures, 0 errors, 0 skips**, exit 0.
- Command: `ruby -c` on **8 Scenario 3 Ruby files** → 8/8 `Syntax OK`, exit 0.
- Command: `ruby bin/rails test test/services/cancellation_policies_test.rb test/controllers/cancellation_quotes_controller_test.rb` → exit 1, `Bundler::GemNotFound`: missing locked `rails-8.1.3` and others. Rails tests executed: **0**, passes/failures/errors/skips **N/A** (not discovered).
- Command: `ruby bin/rails test` → exit 1, same missing dependency error. Rails tests executed: **0**, no meaningful passed/failed/skip counts.
- Live Anthropic, booking providers, geocoding and Turbo were not exercised. The new policy feature does not invoke any of them.
- Rails request, access-control, rendering, DB isolation and integration regression tests are **written but not executed**.

## Regression and limitations
- Byte-comparison confirmed no edits to Scenario 1 generation/import, Scenario 2 booking-provider implementations, InboxItem/Mailbox/Parser, TripItem, Expense, authentication/membership, Geocodable, geocoding job, or database schema.
- Hypothetical policies do not represent real contractual cancellation terms. No cancellation state is persisted.
- Items without direct confirmation reference, start, amount or supported currency cannot be quoted.
- Controller passes actual current time, while tests deliberately supply fixed timestamps to evaluator.
- No true Rails runtime evidence yet because dependencies could not boot; rerun Rails tests under Ruby 3.4.2 with installed locked dependencies.
- No pattern evolution statuses or instance-count changes assigned at implementation stage. **Strategy and separate GRASP Controller are candidates only** for future AFTER verification. Fixed policy whitelist is not by itself Factory.
