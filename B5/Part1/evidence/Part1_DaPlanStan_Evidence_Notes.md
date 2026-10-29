# DaPlanStan Part 1 — Evidence Handoff Notes

## Status: source-evidence guide, NOT completed human-verification results

The Part 1 architecture diagram was available as Mermaid markup in the team's ChatGPT conversation. This file accompanies the exported diagram and provides a targeted source-reference index.

**No separate, completed human-verification sign-off file was found among available uploads.** The chat contains an unfilled verification checklist and a statement that human verification occurred, but it does not provide a reviewer-by-reviewer signed record or filled verification results. Do not represent the accompanying CSV as completed verification.

## Project baseline

- Application: DaPlanStan
- Source repository URL stated by team: https://github.com/GeertClaes/daplanstan
- Selected baseline commit stated by team: `da54d9ab8bfc118e99375fdd6c506efb20b66e5b`
- Source ZIP: `daplanstan-main.zip`
- Commit correspondence: NOT independently established; archive lacked `.git` metadata in prior inspection.
- Ruby version (source evidence): `.ruby-version` -> 3.4.2
- Rails version (source evidence): `Gemfile`, `Gemfile.lock` -> 8.1.3
- Database: `config/database.yml` -> SQLite
- Runtime/third-party integration success: NOT established by static inspection alone.

## Major diagram connections and where to check them

| Diagram claim | Source file(s) to inspect | Method/configuration to verify | Human verification result |
|---|---|---|---|
| HTTP route to trip controller | `config/routes.rb`, `app/controllers/trips_controller.rb` | `resources :trips`, `create` | NOT RECORDED |
| Trip creation saves trip and member | `app/controllers/trips_controller.rb`, `app/models/trip.rb`, `app/models/trip_member.rb` | `create`, owner membership logic | NOT RECORDED |
| Trip creation enqueues cover lookup | `app/controllers/trips_controller.rb`, `app/jobs/fetch_trip_cover_image_job.rb` | Enqueue and job perform logic | NOT RECORDED |
| Cover-image job uses Pexels | `app/jobs/fetch_trip_cover_image_job.rb` | HTTPS request / API key | NOT RECORDED |
| Incoming message goes to TripMailbox | `app/mailboxes/application_mailbox.rb`, `app/mailboxes/trip_mailbox.rb`, Action Mailbox config | `routing`, `process` | NOT RECORDED |
| TripMailbox creates InboxItem and decides sender status | `app/mailboxes/trip_mailbox.rb`, `app/models/inbox_item.rb` | Sender approval and InboxItem creation | NOT RECORDED |
| Approved email enqueues parsing | `app/mailboxes/trip_mailbox.rb` | `ParseInboxItemJob` enqueue | NOT RECORDED |
| ParseInboxItemJob calls Anthropic and updates InboxItem | `app/jobs/parse_inbox_item_job.rb` | Client request / response and record update | NOT RECORDED |
| Review/confirmation triggers InboxItem linking | `app/controllers/inbox_items_controller.rb`, `app/models/inbox_item.rb` | Exact confirmation call site; `fill_missing_links!` | NOT RECORDED |
| InboxItem creates/links TripItem and Expense | `app/models/inbox_item.rb` | `fill_missing_links!`, `confirm_and_create_items!` | NOT RECORDED |
| Geocoding HTTP action enqueues job | `config/routes.rb`, `app/controllers/trips_controller.rb` | `geocode_missing` | NOT RECORDED |
| GeocodeTripItemsJob calls TripItem | `app/jobs/geocode_trip_items_job.rb`, `app/models/trip_item.rb` | `geocode_from_address` | NOT RECORDED |
| TripItem invokes Geocodable | `app/models/trip_item.rb`, `app/models/concerns/geocodable.rb` | `include Geocodable`, override, `super` | NOT RECORDED |
| Geocoder uses Nominatim | `config/initializers/geocoder.rb`, concern | `lookup: :nominatim` / call | NOT RECORDED |
| Geocoding job broadcasts Turbo refresh | `app/jobs/geocode_trip_items_job.rb` | `Turbo::StreamsChannel.broadcast_refresh_to` | NOT RECORDED |
| OAuth callback manages local identities | `config/routes.rb`, `app/controllers/sessions_controller.rb`, `config/initializers/omniauth.rb` | `/auth/:provider/callback`, `create` | NOT RECORDED |
| TripMailer/InvitationMailer send email via configured Postmark | `app/mailers/`, `config/environments/production.rb` | Delivery paths/config | NOT RECORDED |
| Notifications page derives InboxItem states | `app/controllers/notifications_controller.rb`, `app/views/notifications/index.html.erb` | `index`, pending sender/review queries | NOT RECORDED |
| SQLite stores application models | `config/database.yml`, `db/structure.sql`, `app/models/*.rb` | SQLite adapter, Active Record relationships | NOT RECORDED |

## Verified scope / do not overclaim

- `Trip` is a central domain entity, not a formally proven DDD aggregate.
- `TripItem.kind` represents flights, stays, activities and other items. Separate current Flight/Hotel/Activity domain models were not identified.
- No dedicated service-object or repository/DAO abstraction was identified in the supplied snapshot.
- `Expense` supports expense/payer tracking, not verified payment processing.
- No cancellation workflow or persistent generalized Notification entity was identified.
- Source existence does not imply successful application startup, job execution or third-party API access.
- Do not infer design patterns from this architecture diagram; independent verification belongs to the teammate doing pattern discovery.

## How to complete human verification

1. Open each cited file in the baseline archive.
2. Record actual source-line ranges, screenshots or code excerpts.
3. In the accompanying CSV, update `verification_result`, `reviewer`, `verified_date` and `evidence_file` for each claim.
4. If a claim is wrong, record the discrepancy and remove/correct the corresponding diagram arrow before treating it as independently verified.
5. Preserve actual test logs separately; do not fabricate successful execution.
