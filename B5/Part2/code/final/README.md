# DaPlanStan

> **What's the plan, Stan?**

A self-hosted, open source trip planning app built with Ruby on Rails 8.1 — for families and friends who actually travel together.

One shared space for your whole group: forward booking confirmation emails and let AI parse them, pin places on an interactive map, track what everyone spends, and keep the whole itinerary in sync.

🌐 [daplanstan.com](https://daplanstan.com) · 📖 [Setup guide](docs/SETUP.md) · ⚖️ [O'Saasy License](LICENSE.md)

---

## Stack

- **Ruby 3.4 / Rails 8.1** — full-stack, server-rendered, no JS framework needed
- **SQLite** — single-file database, self-hosted friendly
- **Hotwire** (Turbo + Stimulus) — reactive UI without a separate frontend
- **TailwindCSS v4 + DaisyUI v5** — themeable UI via standalone binary
- **Leaflet.js + OpenStreetMap** — interactive map, no API key needed
- **ActionMailbox + Postmark** — inbound email routing
- **Solid Queue** — background jobs (built into Rails 8)
- **Anthropic Claude Haiku** — AI for parsing booking confirmation emails
- **Pexels API** — trip cover images
- **Cloudflare Tunnel** — zero-config HTTPS for self-hosters

> 💡 **Recommended environment:** [Omarchy](https://omarchy.org) — an opinionated Linux setup built for Rails developers. Gets you from zero to running in minutes.

---

## Features

- Create and share a trip with your family or friend group
- Forward booking confirmation emails to a trip-specific address — AI parses and adds them after your review
- Shortlist restaurants, sights, and activities on an interactive map
- Track actual spend with multi-currency support
- Shared expense view for the whole group
- Invite travel partners by email or shareable invite link
- Auto-fetch trip cover images from Pexels
- AI-assisted trip idea import (paste a prompt into ChatGPT, import the JSON)
- Installable as a PWA — add to home screen on iOS and Android
- 20+ themes including a custom DaPlanStan theme

---

## Self-hosting

### Prerequisites

- Ruby 3.4+ (`mise use --global ruby@3.4`)
- [Anthropic API key](https://console.anthropic.com/) — for email parsing
- [Pexels API key](https://www.pexels.com/api/) — for cover images (optional)
- A domain with Cloudflare DNS

### Quick start

```bash
git clone https://github.com/GeertClaes/daplanstan.git
cd daplanstan
bundle install

# DaisyUI plugin (gitignored — re-run after every fresh clone)
mkdir -p app/assets/tailwind/plugins
curl -sL -o app/assets/tailwind/plugins/daisyui.js https://cdn.jsdelivr.net/npm/daisyui@5/+esm

cp .env.example .env   # fill in your credentials
bin/rails db:encryption:init
bin/rails db:create db:migrate db:seed
bin/dev
```

See [docs/SETUP.md](docs/SETUP.md) for the full guide covering Cloudflare tunnels, Postmark inbound email, Google/Apple OAuth, and PWA installation.

### Key environment variables

```
ANTHROPIC_API_KEY=              # AI email parsing
PEXELS_API_KEY=                 # Trip cover images (optional)
GOOGLE_CLIENT_ID=               # OAuth
GOOGLE_CLIENT_SECRET=
POSTMARK_API_TOKEN=             # Inbound + outbound email
POSTMARK_FROM_EMAIL=            # e.g. noreply@yourdomain.com
TRIP_EMAIL_DOMAIN=              # e.g. app.yourdomain.com
RAILS_INBOUND_EMAIL_PASSWORD=
```

---

## Design principles

1. **Email-first** — forwarding a confirmation is the lowest-friction way to add a booking
2. **Review before saving** — AI parses, humans confirm; nothing is added silently
3. **Simple over powerful** — every screen should be immediately obvious
4. **Self-hosted friendly** — one server, one process, SQLite by default

---

## License

[O'Saasy License](LICENSE.md) — free to self-host and fork; you may not resell it as a competing hosted SaaS. See [osassy.dev](https://osassy.dev) for details.

---

## Status

Beta 0.1 — core features complete: email ingestion, AI parsing, interactive map, expense tracking, trip sharing, and PWA install. Actively maintained.

---

## Coursework AFTER source: Scenario 1 personalized itinerary

Source version: `scenario1_personalized_itinerary` (separate copy; original snapshot preserved).

The trip-owner-only **Generate** action accepts interests (`culture`, `food`, `nature`,
`shopping`), budget (`low`, `medium`, `high`), pace (`relaxed`, `balanced`, `busy`)
and optional notes (max 300 characters). It uses the configured `ANTHROPIC_API_KEY`
through the existing Anthropic Ruby client. The generator accepts only up to six
schema-validated, unbooked activity suggestions; preview alone persists nothing.
A signed 20-minute preview binds suggestions to the trip and user; the guarded
confirmation action validates the JSON again, saves ideas using the existing
`bulk_create_items` workflow and queues the existing geocoding job. Times are
tentative and parsed in the application's time zone; no trip-specific time zone
is stored. Users must verify suggested venues, opening hours and travel times.

No migration is needed. Other members' existing JSON-import access has not been
changed. Batch saves now defer geocoding **per instance** instead of modifying
Rails callbacks globally; normal manual item creation still geocodes at save.

### Running Scenario 1 tests

Use the repository's Ruby version (`.ruby-version`: 3.4.2), run `bundle install`,
configure the Rails test database, then:

```bash
RAILS_ENV=test bin/rails db:test:prepare
bin/rails test test/services/itinerary_suggestion_generator_test.rb \
  test/controllers/trip_items_generation_test.rb \
  test/controllers/trip_items_import_regression_test.rb
```

Tests substitute Anthropic and geocoding calls; they should not issue external
requests. A live manual demonstration requires a real Anthropic API key, a working
Rails environment and a trip with an authenticated owner membership. Set the
`whats.` application host locally as described in the repository's setup guide.

**Verification limitation for supplied coursework package:** the packaging
container had Ruby 3.3.8 rather than 3.4.2, and Rails 8.1.3 plus the locked gems
were not available. The Rails test command was attempted but could not boot;
no Rails tests are claimed as passed. See `SCENARIO1_CHANGE_RECORD.md`.

---

## Coursework AFTER source: Scenario 2 multiple booking providers

Source version: `scenario2_multiple_booking_providers`. This snapshot was copied from
`scenario1_personalized_itinerary`, not from the original application baseline.
The frozen Scenario 1 source and pattern records were not edited.

Trip owners can select **Atlas Demo** or **Beacon Demo**, pick a **Rome** or **Paris**
sample destination, and browse clearly fictional offers. The two local JSON fixture
formats intentionally differ; `BookingProviders::AtlasAdapter` and
`BookingProviders::BeaconAdapter` convert them to one validated shape through a
strictly whitelisted `BookingProviders::Registry`. Browser POSTs submit only
`provider_code`, `destination_code`, and `offer_id`: the server resolves the offer
again rather than accepting client-supplied prices, names, booking status, or IDs.

**These offers are mock planning ideas, not live prices, inventory, or bookings.**
Selected offers become `TripItem` records with status `idea`, optional **sample**
amount/currency, nil dates, nil confirmation reference, and nil inbox item. No
`Expense` or payment transaction is created. A stable, server-generated marker
`[demo_provider_offer:CODE:ID]` in notes prevents sequential duplicate additions
within a trip; without a database uniqueness constraint, simultaneous requests
may still race. The existing per-record `defer_geocoding` option queues the
existing `GeocodeTripItemsJob` after saving. No migration or new job is needed.
The existing genuine confirmation-email flow and Scenario 1 generation remain
unchanged. Only the route table and trip-owner action panel were edited in place.

### Scenario 2 verification commands

Use the repository's required Ruby 3.4.2 and install Gemfile.lock dependencies.
Then run (with a properly configured test database and `whats.` host):

```sh
bundle install
RAILS_ENV=test bin/rails db:test:prepare
bin/rails test test/services/booking_providers_test.rb \
  test/controllers/booking_options_controller_test.rb \
  test/models/scenario2_email_and_refresh_regression_test.rb
bin/rails test
```

Standalone validation of the local provider fixtures can run **without Rails**:

```sh
ruby evidence/isolated_provider_checks.rb
```

Do not confuse isolated Ruby validation with Rails integration. The packaging
environment used Ruby 3.3.8 and lacked the Rails 8.1.3 locked dependencies.
`bin/rails test` was attempted and failed before test discovery with
`Bundler::GemNotFound`; **zero Rails tests executed**. Detailed actual command
results and source changes are in `SCENARIO2_CHANGE_RECORD.md` and `evidence/`.

---

## Coursework AFTER source: Scenario 3 hypothetical cancellation-policy quotes

Source version: `scenario3_cancellation_policies`, copied from the complete
`scenario2_multiple_booking_providers` AFTER archive. Scenario 2 is unchanged.

Trip owners can view **Estimate cancellation (demo)** for a *confirmed* TripItem
with a genuinely confirmed InboxItem link, its **own** confirmation reference,
start timestamp, nonnegative amount, and EUR/GBP/USD currency. Select Flexible,
Moderate, or Strict to see a **hypothetical** cancellation fee and refund.
Nothing is cancelled, no provider is contacted, and no TripItem, InboxItem,
Expense, payment, refund, or cancellation row is written or updated. Demo
provider offers and generated ideas do not qualify merely by changing their
status to confirmed. The selected policy is not the real provider's terms.

Fictional policy tiers based on elapsed time before start:

| Time until start | Flexible fee | Moderate fee | Strict fee |
| --- | ---: | ---: | ---: |
| >= 72 hours | 0% | 0% | 100% |
| >= 24, < 72 hours | 0% | 50% | 100% |
| > 0, < 24 hours | 10% | 100% | 100% |
| At or after start | 100% | 100% | 100% |

`CancellationPolicies::QuoteEvaluator#call` takes an explicit `evaluated_at`
and uses BigDecimal with `ROUND_HALF_UP` at two decimals. The controller
passes `Time.current`; tests pass fixed timestamps. The policies never call
an external service or modify Active Record models.

With the repository-required Ruby 3.4.2, bundled Rails 8.1.3 dependencies and
configured test database, run:

```sh
bundle install
RAILS_ENV=test bin/rails db:test:prepare
bin/rails test test/services/cancellation_policies_test.rb \
  test/controllers/cancellation_quotes_controller_test.rb
bin/rails test
```

Independent deterministic checks that **do not require Rails**:

```sh
ruby evidence/isolated_cancellation_policy_checks.rb
```

At packaging time the environment supplied Ruby 3.3.8 and lacked the
Gemfile.lock dependencies. Both Rails test commands failed before test
collection with `Bundler::GemNotFound` (Rails 8.1.3 among missing gems).
No Rails tests are claimed as passed. See `SCENARIO3_CHANGE_RECORD.md` and
`evidence/` for exact logs, limits and source locations.
