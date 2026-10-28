# Part 2 — Design Pattern Discovery and Verification

## 1. Pattern Discovery Method

Design patterns in DaPlanStan were identified through systematic source-code inspection rather than assumptions based on framework conventions. The repository was examined area by area, covering geocoding, inbound email, trip creation and membership, itinerary importing and expenses, external integrations, authentication, and frontend interactions. Candidates were traced through actual classes, methods and collaborating objects; false positives were challenged. A repository-wide coverage sweep and final adversarial review preceded freezing of the baseline.

Pattern names were not assigned merely because Rails controllers, callbacks, associations, enums, background jobs, direct API integrations or JavaScript events existed. Only source-supported collaborations satisfying the agreed pattern and counting rules were retained.

## 2. Final Pattern Inventory

| Pattern ID | Pattern | Category | Instance name | Main participant | Short purpose |
|---|---|---|---|---|---|
| P01 | Information Expert (GRASP) | GRASP — Responsibility Assignment | Parsed Email to Trip Record Linking | `InboxItem` | Interpret parsed email and link itinerary or expense records. |
| P02 | Controller (GRASP) | GRASP — Responsibility Assignment | Inbound Travel Email Intake Coordination | `TripMailbox#process` | Route incoming email and coordinate approval, persistence and processing. |
| P03 | Controller (GRASP) | GRASP — Responsibility Assignment | Trip Creation Coordination | `TripsController#create` | Establish new trip and owner membership. |
| P04 | Controller (GRASP) | GRASP — Responsibility Assignment | Trip Membership Management Coordination | `TripMembersController` | Manage trip membership, authorization and invitations. |
| P05 | Controller (GRASP) | GRASP — Responsibility Assignment | Bulk Itinerary Import Coordination | `TripItemsController#import` | Coordinate itinerary JSON preview, confirmation and geocoding. |
| P06 | Controller (GRASP) | GRASP — Responsibility Assignment | OAuth Sign-in and Identity Linking Coordination | `SessionsController#create` | Resolve OAuth identity and local account access. |
| P07 | Controller (GRASP) | GRASP — Responsibility Assignment | Account Traveler Enrollment Coordination | `TravelersController#create` | Enroll account travelers and coordinate invitations. |
| P08 | Observer (GoF) | GoF — Behavioral (framework-mediated) | Outbound Mail Delivery Logging | `MailLogger` | Log delivery events through Action Mailer's observer contract. |
| P09 | Observer (GoF) | GoF — Behavioral (framework-mediated) | Trip-Scoped Turbo Refresh Notifications | `InboxItem`, `GeocodeTripItemsJob`, subscribed views | Publish and receive trip-scoped Turbo refresh notifications. |

## 3. Pattern Counts

| Pattern type | Confirmed instances |
|---|---:|
| Controller (GRASP) | 6 |
| Information Expert (GRASP) | 1 |
| Observer (GoF) | 2 |
| **Total pattern instances** | **9** |
| **Distinct pattern types** | **3** |

Instances were counted by cohesive application use-case responsibility or identifiable notification collaboration, not class, method, HTTP request, provider, message or runtime occurrence. Trip-member add/remove, import preview/confirmation and Google/Apple callback coordination each remain one instance. The Turbo and mail collaborations are each counted once across repeated triggers and subscribers.

## 4. Important Pattern Evidence

**GRASP Controller.** Six independent system-event responsibilities were identified. `TripsController#create` coordinates trip creation and its initial owner membership; `TripMembersController` manages membership authorization and changes; `SessionsController#create` coordinates post-OAuth identity and access decisions. The classification depends on each cohesive application responsibility, not on Rails inheritance or the presence of controller actions.

**GRASP Information Expert.** `InboxItem` stores structured email extraction data and performs the substantive work of matching, creating and linking trip itinerary and expense records through `confirm_and_create_items!` and `fill_missing_links!`. `InboxItemsController` requests these operations, while Rails provides persistence.

**GoF Observer.** Two Observer instances were confirmed as framework-mediated. In P08, DaPlanStan implements and registers `MailLogger.delivered_email`, while Action Mailer/Mail provide notification infrastructure. In P09, DaPlanStan declares `InboxItem` and geocoding broadcasts and subscribes trip/inbox views using `turbo_stream_from @trip`; Turbo Rails/Action Cable provide subscription and delivery. Application-written participants are distinguished from framework-owned mechanisms.

## 5. Rejected Candidates and False Positives

| Rejected classification | Reason |
|---|---|
| Geocoding — Template Method | No application-defined template algorithm with overridable primitive steps. |
| Geocoding — Strategy | Biased and fallback lookups are fixed sequential methods, not interchangeable algorithm implementations. |
| Geocoding — Adapter | Direct Geocoder API integration does not demonstrate incompatible-interface translation. |
| Itinerary Timeline–Map Event Coordination — Observer | Targeted DOM events directed at a known map component are a better explanation. |
| Beta Invite Eligibility Evaluation — Information Expert | Simple predicates do not meet the threshold for an independently significant responsibility collaboration. |

These preserved rejections make the analysis auditable and show that conventional Rails behavior, direct API calls, simple predicates and ordinary DOM events were not indiscriminately relabeled as design patterns.

## 6. Verification and Limitations

Static source verification was completed for all nine instances through source-location and role mapping, candidate challenges, deduplication and relevant framework-contract checks. The source examined was the uploaded `daplanstan-main.zip`, labeled `baseline`. Its correspondence to the stated Git commit `da54d9ab8bfc118e99375fdd6c506efb20b66e5b` remains **unverified**.

No complete Rails runtime or end-to-end integration tests were performed. The two framework-mediated Observers rely on previously checked Action Mailer 8.1.3 / Mail 2.9.0 and Turbo Rails 2.0.23 / Action Cable contracts. This verification was LLM-assisted and **independent human sign-off has not been established**, unless separately performed and documented by a team member. Static classification is not evidence that every runtime workflow succeeds.

## 7. Part 2 Deliverables

- `patterns.csv` — nine frozen source-supported records.
- `pattern_counts.csv` — per-pattern and total counts.
- `uml/source/` — nine editable P01–P09 Mermaid class diagrams.
- `uml/svg/` — nine editable/vector SVG depictions of the same UML relationships.
- `verification/Part2_Verification_Evidence.md` — nine source-confirmed and five rejected-candidate evidence records.
- `llm/llm.csv` — 20 major LLM audit stages.
- `llm/prompts/` — 20 named historical prompt slots.
- `llm/raw_outputs/` — 20 named historical raw output slots.
- `handoff/Part2_to_Software_Evolution_Handoff.md` — standalone continuation notes.
- `FINAL_CONSISTENCY_CHECK.md` — package checks and disclosure of archival limitations.

Exact original prompt and raw-output text must be archived from the original conversation when accessible. Any item that cannot be recovered exactly is **explicitly marked**, not fabricated or backfilled from later conclusions. These archival slots do not imply independent human verification.

## 8. Handoff to Software Evolution / Refactoring

The evolved application should use the nine-instance `baseline` as the unchanged **BEFORE** source version. Preserve P01–P09 identifiers while comparing implementation changes, and record whether each existing collaboration is **preserved, modified, extended, replaced or removed**. Record genuinely new patterns separately and use `patterns_evolution.csv` for status tracking. Do not retroactively modify baseline counts because of subsequent evolution.

| Next-stage requirement | Baseline source areas to examine | Existing references where applicable |
|---|---|---|
| Personalized itinerary generation | `Trip`, `TripItem`, itinerary import and related coordination | P03, P05; P01 only where record interpretation/linking changes |
| Multiple booking providers | External integration boundaries, provider interactions and booking-related data | P01, P02 or P06 only if their existing responsibilities are affected |
| Different cancellation policies | New cancellation logic and any affected trip, membership or controller responsibilities | P03, P04 or P07 only if actually affected |

New booking and cancellation code should be compared against the baseline, not described as having existed in the original snapshot. These are investigation entry points, **not refactoring or pattern-design prescriptions**.

## 9. Part 2 Completion Statement

Part 2 source-based design-pattern discovery and verification are complete and frozen at **9 pattern instances across 3 distinct pattern types**: 6 Controller (GRASP), 1 Information Expert (GRASP) and 2 Observer (GoF). The final inventory, UML sources, source-verification records, rejections and LLM audit document the **BEFORE** version for subsequent evolution work. Source provenance, runtime validation and independent human-review limitations remain explicitly documented. No Part 3 evolution analysis was performed.
