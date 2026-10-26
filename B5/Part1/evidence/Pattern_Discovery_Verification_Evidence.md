# Part 2 — Pattern Verification Evidence Records

**Project:** DaPlanStan  
**Source version:** `baseline`  
**Source snapshot:** `daplanstan-main.zip`  
**Method:** LLM-assisted static source and previously checked versioned framework contracts  
**Baseline classification:** Frozen source-supported proposal  
**Runtime tests:** Not completed  
**Independent human sign-off:** Not established

## A. Source-confirmed pattern records

### P01 — Parsed Email to Trip Record Linking

- **Pattern name:** Information Expert (GRASP)
- **Stable instance name:** Parsed Email to Trip Record Linking
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** app/models/inbox_item.rb:19–25,34–58,67–187,191–207; app/controllers/inbox_items_controller.rb:16–35; app/models/trip.rb:4–12; app/models/trip_item.rb:1–28; app/models/expense.rb:1–28; app/models/trip_member.rb:1–6; app/models/traveler.rb:1–8
- **Participant-role mapping:** `InboxItem` (owner of parsed email data and record-linking responsibility); `InboxItemsController` (requesting client); `Trip` (parent context); `TripItem` (matched/created itinerary record); `Expense` (conditional expense record); `TripMember` and `Traveler` (payer resolution).
- **Strongest supporting evidence:** `InboxItem#parsed_data` holds extracted data, while `#confirm_and_create_items!`, `#fill_missing_links!` and `#build_expense` convert it into associated itinerary and expense records.
- **Strongest alternative tested:** This could be an oversized Active Record model performing controller-like orchestration.
- **Why retained:** The central interpreted information belongs to `InboxItem`, and its record-linking decisions are delegated to it by the requesting controller.
- **Application/framework boundary:** DaPlanStan implements matching and linkage rules; Active Record provides queries, associations and persistence. Anthropic performs earlier extraction.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

### P02 — Inbound Travel Email Intake Coordination

- **Pattern name:** Controller (GRASP)
- **Stable instance name:** Inbound Travel Email Intake Coordination
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** app/mailboxes/application_mailbox.rb:1–3; app/mailboxes/trip_mailbox.rb:2–31,35–60; app/models/trip.rb:4–19; app/models/approved_sender.rb:1–6; app/models/inbox_item.rb:1–17; app/models/trip_member.rb:1–6; app/jobs/parse_inbox_item_job.rb:99–112,127–139; app/mailers/trip_mailer.rb:2–10
- **Participant-role mapping:** `ApplicationMailbox` (routing declaration); `TripMailbox#process` (system-event coordinator); `Trip` (recipient destination); `ApprovedSender`, `TripMember`, `Traveler`, `User` (sender checks); `InboxItem` (persisted message); `ParseInboxItemJob#perform` (delegated parser); `TripMailer` (notification construction).
- **Strongest supporting evidence:** `TripMailbox#process` resolves the trip, tests sender eligibility, persists `InboxItem`, and conditionally enqueues `ParseInboxItemJob` or requests pending-sender notification.
- **Strongest alternative tested:** `process` is a conventional Action Mailbox callback and could be ordinary framework mail handling.
- **Why retained:** Trip matching, eligibility decisions and choice of delegated actions are substantive application-level coordination.
- **Application/framework boundary:** Action Mailbox routes and executes incoming messages; Active Job executes parsing; Action Mailer handles delivery; Anthropic supplies extraction. Application owns sender/route decisions.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

### P03 — Trip Creation Coordination

- **Pattern name:** Controller (GRASP)
- **Stable instance name:** Trip Creation Coordination
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** app/controllers/trips_controller.rb:35–48; app/controllers/application_controller.rb:14–20; app/models/trip.rb:4–19,31–37; app/models/account.rb:9–11; app/models/traveler.rb:1–8; app/models/trip_member.rb:1–6; app/jobs/fetch_trip_cover_image_job.rb:4–32; config/routes.rb:21
- **Participant-role mapping:** `TripsController#create` (system-event coordinator); `ApplicationController` (user/account context); `Trip` (new domain record); `Account#owner_traveler` and `Traveler` (owner identity); `TripMember` (owner membership); `FetchTripCoverImageJob` (deferred cover retrieval).
- **Strongest supporting evidence:** After saving a `Trip`, `TripsController#create` creates its `TripMember` with role `owner` and requests cover retrieval.
- **Strongest alternative tested:** Could be a short conventional Rails `create` action containing a few database writes and a job call.
- **Why retained:** It coordinates the cohesive multi-object outcome of trip creation and initial ownership rather than isolated record persistence.
- **Application/framework boundary:** Rails supplies routing and Active Record; Active Job executes jobs; Pexels supplies image-search results. DaPlanStan owns sequence and owner-role rule.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

### P04 — Trip Membership Management Coordination

- **Pattern name:** Controller (GRASP)
- **Stable instance name:** Trip Membership Management Coordination
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** app/controllers/trip_members_controller.rb:6–22,26–65; app/controllers/application_controller.rb:22–25; app/models/trip.rb:4–12; app/models/account.rb:1–11; app/models/traveler.rb:1–8; app/models/user.rb:11–17; app/models/trip_member.rb:1–6; app/mailers/invitation_mailer.rb:8–13; config/routes.rb:40
- **Participant-role mapping:** `TripMembersController#create/#destroy` (event handlers); `#require_owner_or_planner` (authorization); `#resolve_and_add_by_email` (identity resolution); `#add_traveler` (membership creation); `Trip`, `Account`, `Traveler`, `User` (context); `TripMember` (role-bearing membership); `InvitationMailer` (invitation).
- **Strongest supporting evidence:** The controller authorizes the actor, resolves or creates travelers, avoids duplicates, assigns contributor memberships, and guards owner removal.
- **Strongest alternative tested:** Procedural membership policy inside a Rails controller may be read as controller-heavy CRUD.
- **Why retained:** The methods together implement a cohesive trip-membership lifecycle involving permissions, roles, identity resolution and invitations; add/remove count once.
- **Application/framework boundary:** Rails supplies request handling, associations and role enum storage; Action Mailer supplies mail facilities; app supplies authorization and membership decisions.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

### P05 — Bulk Itinerary Import Coordination

- **Pattern name:** Controller (GRASP)
- **Stable instance name:** Bulk Itinerary Import Coordination
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** app/controllers/trip_items_controller.rb:31–58,128–179; app/models/trip.rb:4–12; app/models/trip_item.rb:1–28; app/models/concerns/geocodable.rb:9–11; app/jobs/geocode_trip_items_job.rb:4–21; app/views/trip_items/import.html.erb:93–106; config/routes.rb:30–34
- **Participant-role mapping:** `TripItemsController#import` (preview/confirmation event coordinator); `#bulk_create_items` (batch persistence decisions); `#parse_import_time` (date parsing); `Trip` (destination); `TripItem` (records); `Geocodable#geocoded?` (coordinate check); `GeocodeTripItemsJob` (deferred geocoding); import view (user form).
- **Strongest supporting evidence:** Import action handles preview and confirmation; batch method matches existing items, creates or updates itinerary ideas and schedules geocoding.
- **Strongest alternative tested:** The import implementation is largely procedural within one controller and uses conventional Active Record operations.
- **Why retained:** Preview and confirmation are phases of a single cohesive bulk-import use case with multiple collaborators and deferred work.
- **Application/framework boundary:** DaPlanStan owns import decisions; Active Record owns persistence/callbacks; Active Job executes the geocoding job.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

### P06 — OAuth Sign-in and Identity Linking Coordination

- **Pattern name:** Controller (GRASP)
- **Stable instance name:** OAuth Sign-in and Identity Linking Coordination
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** app/controllers/sessions_controller.rb:4–41,54–81; app/models/user_identity.rb:1–8; app/models/user.rb:11–22; app/models/traveler.rb:26–28; app/models/account.rb:1–11; app/models/invite.rb:12–18; app/controllers/application_controller.rb:14–16; config/initializers/omniauth.rb:1–16; config/routes.rb:12–14
- **Participant-role mapping:** `SessionsController#create` (post-auth event coordinator); `#provision_account_or_gate` (access decision); `#create_account_for` (account/traveler creation); `UserIdentity` (provider link); `User` (local identity); `Traveler#accept!` (pending link); `Account` (account); `Invite` (eligibility); OmniAuth initializer (provider configuration).
- **Strongest supporting evidence:** The callback resolves provider/UID, links user by email if necessary, stores identity, establishes session, accepts pending travelers and gates/provisions account.
- **Strongest alternative tested:** OmniAuth has already handled external authentication, leaving procedural account bookkeeping.
- **Why retained:** The post-authentication local identity/access decision is still a distinct cohesive application system event; Google and Apple count as one use case.
- **Application/framework boundary:** OmniAuth/provider gems own OAuth protocol; Rails owns session and persistence; app owns user/identity linking, acceptance and account eligibility.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

### P07 — Account Traveler Enrollment Coordination

- **Pattern name:** Controller (GRASP)
- **Stable instance name:** Account Traveler Enrollment Coordination
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** app/controllers/travelers_controller.rb:5–35,54–56; app/models/account.rb:1–11; app/models/traveler.rb:1–8,18–28; app/models/user.rb:11–22; app/mailers/invitation_mailer.rb:2–6; app/views/settings/show.html.erb:114–127; config/routes.rb:48–50
- **Participant-role mapping:** `TravelersController#create` (enrollment coordinator); `#set_account` (account-owner scope); `Account` (participant association); `Traveler` (account participant); `User` (registered identity lookup); `InvitationMailer#invite` (invitation); Settings view (enrollment form).
- **Strongest supporting evidence:** The controller distinguishes name-only, email-only and linked registered travelers, checks duplicates and requests an email invitation when applicable.
- **Strongest alternative tested:** Might be ordinary account-level CRUD overlapping traveler resolution in trip membership management.
- **Why retained:** It creates account-scoped travelers, not a role-bearing `TripMember`; the system event and resulting domain state differ from P04.
- **Application/framework boundary:** Rails owns Active Record and routing; Action Mailer/Active Job own delivery infrastructure; application owns enrollment decisions.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

### P08 — Outbound Mail Delivery Logging

- **Pattern name:** Observer (GoF)
- **Stable instance name:** Outbound Mail Delivery Logging
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** config/initializers/mail_logger.rb:1–7; app/mailers/application_mailer.rb:1–5; app/mailers/invitation_mailer.rb:2–13; app/mailers/trip_mailer.rb:2–10; versioned Action Mailer 8.1.3 and Mail 2.9.0 observer contracts
- **Participant-role mapping:** `MailLogger` (application concrete observer); `MailLogger.delivered_email` (notification callback); `ActionMailer::Base.register_observer(MailLogger)` (registration call); `ActionMailer::Base` (framework registration interface); Mail gem (publisher/registry/dispatcher); `InvitationMailer` and `TripMailer` (mail-producing collaborators).
- **Strongest supporting evidence:** The initializer defines and explicitly registers `MailLogger`, while the versioned Mail gem contract invokes `delivered_email` on registered observers.
- **Strongest alternative tested:** All observer machinery apart from application callback and explicit registration is framework-provided.
- **Why retained:** A real observer contract is explicitly used with an application-defined concrete observer; one instance covers all mailers and messages.
- **Application/framework boundary:** Application owns `MailLogger` and registration statement; Action Mailer and Mail supply registration and callback dispatch; Postmark transports mail.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

### P09 — Trip-Scoped Turbo Refresh Notifications

- **Pattern name:** Observer (GoF)
- **Stable instance name:** Trip-Scoped Turbo Refresh Notifications
- **Verification status:** SOURCE-CONFIRMED
- **Source locations:** app/models/inbox_item.rb:1–5; app/jobs/geocode_trip_items_job.rb:4–21; app/views/trips/show.html.erb:2–9; app/views/inbox_items/index.html.erb:1; versioned Turbo Rails 2.0.23/Action Cable contracts
- **Participant-role mapping:** `InboxItem` (model publication source); `GeocodeTripItemsJob` (explicit publication source); trip and inbox views (stream subscription declarations); `Turbo::Broadcastable` (framework model callback); `Turbo::StreamsChannel` (framework stream channel); Action Cable (delivery); Turbo browser runtime (subscriber/refresh).
- **Strongest supporting evidence:** `broadcasts_refreshes_to :trip`, `broadcast_refresh_to(trip)` and `turbo_stream_from @trip` establish matching broadcast and subscription paths under the checked Turbo Rails contract.
- **Strongest alternative tested:** Neither app-owned custom observer callback nor observer registry is implemented; Turbo supplies both infrastructure and browser reactions.
- **Why retained:** The app explicitly declares both publication and subscription for the same trip stream, constituting one framework-mediated collaboration shared by inbox and geocoding.
- **Application/framework boundary:** DaPlanStan defines sources and subscriptions; Turbo Rails and Action Cable supply subscription management, broadcasting, delivery and client refresh.
- **Runtime verification:** NOT COMPLETED
- **Independent human sign-off:** NOT ESTABLISHED

## B. Rejected-candidate records

### R01 — Geocoding — Template Method

- **Proposed classification:** Geocoding — Template Method
- **Source area / locations:** app/models/concerns/geocodable.rb:4–16,27–65; app/models/trip_item.rb:32–37
- **Why initially plausible:** `TripItem` overrides `geocode_from_address` and uses `super`.
- **Decisive reason for rejection:** No template algorithm calls overridable primitive steps; the override guards the complete concern operation.
- **Better explanation:** Ruby method reuse with a model-specific guard.
- **Final status:** REJECTED

### R02 — Geocoding — Strategy

- **Proposed classification:** Geocoding — Strategy
- **Source area / locations:** app/models/concerns/geocodable.rb:13–14,27–65
- **Why initially plausible:** The concern defines biased and fallback geocoding lookup methods.
- **Decisive reason for rejection:** Fixed sequential primary/fallback lookup; no interchangeable algorithms selected via common role.
- **Better explanation:** Conditional fallback within one lookup algorithm.
- **Final status:** REJECTED

### R03 — Geocoding — Adapter

- **Proposed classification:** Geocoding — Adapter
- **Source area / locations:** app/models/concerns/geocodable.rb:13–22,27–65; config/initializers/geocoder.rb:1–7
- **Why initially plausible:** The concern calls third-party Geocoder and stores returned coordinates.
- **Decisive reason for rejection:** No incompatible application target interface and adapted external interface collaboration.
- **Better explanation:** Direct third-party API integration and domain-specific coordinate handling.
- **Final status:** REJECTED

### R04 — Itinerary Timeline–Map Event Coordination — Observer

- **Proposed classification:** Itinerary Timeline–Map Event Coordination — Observer
- **Source area / locations:** app/javascript/controllers/timeline_controller.js:11–33; app/javascript/controllers/trip_nav_controller.js:31–43; app/javascript/controllers/map_controller.js:51–109
- **Why initially plausible:** `TimelineController` emits `map:locate` and `map:reset`; `TripNavController` emits `map:resize`; `MapController` listens.
- **Decisive reason for rejection:** Targeted map-specific requests to a known DOM node; no independent substantive subject/subscriber role beyond browser events.
- **Better explanation:** Targeted Stimulus-controller communication via DOM `CustomEvent` and `EventTarget`.
- **Final status:** REJECTED

### R05 — Beta Invite Eligibility Evaluation — Information Expert

- **Proposed classification:** Beta Invite Eligibility Evaluation — Information Expert
- **Source area / locations:** app/models/invite.rb:12–18; app/controllers/invites_controller.rb:5–15; app/controllers/sessions_controller.rb:63–75
- **Why initially plausible:** `Invite` owns used/expiry/email data and exposes eligibility predicates.
- **Decisive reason for rejection:** Elementary predicates fail the independent-collaboration significance threshold; controller retains full signup eligibility.
- **Better explanation:** Ordinary model encapsulation of validation predicates.
- **Final status:** REJECTED

## Verification Limitations

1. The source snapshot is the uploaded `daplanstan-main.zip`.
2. ZIP correspondence with Git commit `da54d9ab8bfc118e99375fdd6c506efb20b66e5b` remains **unverified**.
3. No complete Rails runtime or end-to-end integration testing was performed.
4. P08 and P09 depend on the previously checked framework contracts: Action Mailer 8.1.3 / Mail 2.9.0 and Turbo Rails 2.0.23 / Action Cable.
5. Independent human reviewer sign-off remains pending unless performed separately and documented by a team member. An LLM source review is not human approval.

## Verification tally

| Category | Count |
|---|---:|
| Controller (GRASP) | 6 |
| Information Expert (GRASP) | 1 |
| Observer (GoF) | 2 |
| **SOURCE-CONFIRMED** | **9** |
| **REJECTED** | **5** |
| **UNCERTAIN in frozen baseline** | **0** |

The classification set and counts are frozen; this document records source-based verification evidence, not runtime validation.
