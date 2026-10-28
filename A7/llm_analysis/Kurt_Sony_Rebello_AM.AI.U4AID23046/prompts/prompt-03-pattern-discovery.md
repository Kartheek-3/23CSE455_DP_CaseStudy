# Prompt 03 — Part 1 Design-Pattern Analysis and Verification

Using the verified baseline and architecture analysis already completed, perform the actual Part 1 design-pattern analysis of the Ruby on Rails application.

Repository:
https://github.com/andrewdsilva/rails-room-booking/tree/main

Baseline:
- `source_version = original`
- `commit = 5e15551ee646871b4bed32c982fa17da319d3ee3`

The previous architecture analysis identified the following highest-value areas:

- `app/models/booking.rb`
- `app/models/room.rb`
- `app/models/user.rb`
- `app/models/setting.rb`
- `app/models/concerns/*`
- `app/controllers/application_controller.rb`
- `app/controllers/bookings_controller.rb`
- `app/controllers/rooms_controller.rb`
- `app/controllers/settings_controller.rb`
- `app/controllers/concerns/*`
- `app/policies/*`
- `config/routes.rb`
- `config/initializers/payify.rb`
- `config/initializers/integromat.rb`
- relevant tests

Use that analysis as an inspection guide, but independently verify every pattern claim against the actual source at the exact baseline commit.

# OBJECTIVE

Identify the genuinely present and defensible design-pattern collaborations in the baseline application.

Do NOT attempt to maximize the number of patterns.

A small number of strongly evidenced patterns is preferable to many speculative patterns.

# PATTERN CATEGORIES

Investigate where applicable:

- GoF Creational
- GoF Structural
- GoF Behavioral
- GRASP
- relevant architectural patterns
- relevant Rails-specific idioms

Do not force a GoF classification onto normal Rails behavior.

Clearly distinguish:

1. Formal design pattern
2. GRASP principle/pattern
3. Architectural/framework mechanism
4. Ordinary implementation technique
5. Third-party framework behavior

# IMPORTANT FALSE-POSITIVE RULE

Do NOT classify something merely because:

- its name resembles a pattern
- it uses inheritance
- it uses a module/concern
- it uses callbacks
- it uses polymorphism superficially
- it delegates to another object
- Rails itself provides the mechanism
- an LLM suggests the pattern

The source must demonstrate the defining collaboration and intent of the pattern.

# INVESTIGATION

For each plausible candidate, inspect the actual implementation and determine:

1. Pattern name
2. Pattern category
3. Meaningful instance name
4. Problem being solved
5. Actual participants
6. Pattern-role mapping
7. How participants interact
8. Why the collaboration satisfies the pattern
9. Exact source files
10. Exact line ranges
11. Relevant methods/functions
12. Verification evidence

# PARTICIPANT MAPPING

Map textbook roles to actual source symbols.

Example:

- Context → `CrudConcern#create`
- Concrete implementation → `BookingsController`
- Hook → `BookingsController#base_class`

If one class/module performs multiple roles, state that explicitly.

Do NOT invent interfaces or classes that do not exist.

Include every applicable participant.

# THREE-WAY CLASSIFICATION

Every candidate must be placed into exactly one category.

## CONFIRMED

The source clearly demonstrates the pattern's defining collaboration.

## UNCERTAIN

There is some evidence of the pattern, but the repository does not provide enough evidence to confirm it.

## REJECTED

The code resembles the pattern superficially but does not satisfy its defining collaboration.

For rejected and uncertain candidates, explain why.

# PARTICULAR AREAS TO INVESTIGATE

Pay special attention to:

### 1. CrudConcern + controllers

Investigate whether the shared CRUD workflow and controller-specific hook methods constitute a recognized pattern such as Template Method, polymorphism or another design mechanism.

Do not assume the answer.

### 2. Model concerns

Investigate:

- `HasOwnerConcern`
- `HasPriceConcern`
- `HasSettingsConcern`

Determine whether these represent a recognized pattern, a Rails-specific composition mechanism, GRASP, or simply code reuse.

### 3. Policies

Investigate:

- `ApplicationPolicy`
- `BookingPolicy`
- `RoomPolicy`
- `SettingPolicy`

Determine whether inheritance/polymorphism represents a meaningful recognized pattern or simply ordinary implementation.

### 4. Booking callbacks

Investigate:

- `after_save`
- `after_create`
- `before_save`
- validation callbacks

Determine whether any callback collaboration genuinely represents a recognized pattern or is simply Rails lifecycle behavior.

### 5. Payment integration

Investigate the application-side interaction with:

- `Payify::HasPaymentConcern`
- payment object
- Payify engine
- Stripe boundary

Do not claim knowledge of Payify internals that are absent from the repository.

### 6. Integromat webhook

Investigate:

Booking → `after_create` → `notify_booking` → `Integromat::Webhook` → `trigger`

Determine whether this is a recognizable pattern such as Observer/Event Notification, Adapter, Facade, etc., or simply a direct integration call.

Do not force a classification.

# OUTPUT

Return ONLY the following structured analysis.

## A. CONFIRMED PATTERNS

First provide a table with these columns:

| Pattern | Category | Instance | Participants | Source locations | Evidence |

Then provide a detailed record for every confirmed instance:

- Pattern:
- Category:
- Instance:
- Intent:
- Participants:
- Role mapping:
- Interactions:
- Source locations:
- Evidence:
- Why it qualifies:
- Verification status:

## B. UNCERTAIN CANDIDATES

Provide a table with these columns:

| Candidate | Evidence suggesting it | Missing evidence | Reason uncertain |

## C. REJECTED CANDIDATES

Provide a table with these columns:

| Candidate | Observed mechanism | Why it does not qualify |

## D. FINAL BASELINE INVENTORY

Provide:

- total confirmed pattern types
- total confirmed pattern instances
- concrete participant classes/modules/functions
- unique participant symbols
- uncertain candidate count
- rejected candidate count

Ensure these numbers are derived directly from the confirmed records.

## E. PART 1 EVIDENCE TABLE

For every confirmed pattern instance provide:

- `source_version`
- `pattern_name`
- `pattern_type`
- `instance_name`
- `participant_roles`
- `source_locations`
- `intent_and_evidence`

This must be directly convertible into `patterns.csv`.

## F. RESEARCH CONCLUSION

Give a concise conclusion identifying:

1. Which patterns are safe to use in the final case study
2. Which candidates should NOT be claimed
3. Which source files are most important for the next verification step

# STRICT RULES

- Do not invent patterns.
- Do not invent participants.
- Do not invent source locations.
- Do not invent line numbers.
- Do not fabricate tests.
- Do not treat framework behavior as application pattern evidence without explicitly qualifying it.
- Do not use pattern-count targets.
- Do not add a pattern merely to make Part 1 look richer.

The final output must be defensible by a professor inspecting the actual repository.
