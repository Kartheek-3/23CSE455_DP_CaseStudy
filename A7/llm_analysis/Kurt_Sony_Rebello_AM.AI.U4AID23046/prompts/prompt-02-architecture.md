# Prompt 02 — Architecture Reconstruction & Collaboration Map

Using the exact baseline established in Prompt 01:

Repository:
https://github.com/andrewdsilva/rails-room-booking/tree/main

Baseline:
- `source_version = original`
- `commit = 5e15551ee646871b4bed32c982fa17da319d3ee3`

Perform a rigorous architecture reconstruction of the application.

**IMPORTANT:** This is still NOT the formal pattern-discovery stage.

Do not label anything as Strategy, Observer, Factory, Adapter, Decorator, Facade, etc. unless explicitly asked later.

The purpose of this task is to reconstruct the actual architecture and collaboration structure that will be used as evidence during Part 1 pattern discovery.

---

# 1. ARCHITECTURE SCOPE

Inspect the actual baseline source, including where relevant:

- `app/models`
- `app/models/concerns`
- `app/controllers`
- `app/controllers/concerns`
- `app/policies`
- `app/views`
- `app/javascript`
- `config/routes.rb`
- initializers
- database schema/migrations
- tests/specifications
- payment integration
- webhook/integration code
- authentication/authorization configuration
- relevant Gemfile dependencies

Do not treat the entire Rails framework as application architecture.

Clearly distinguish:

A. Application-owned code

B. Rails framework behavior

C. Third-party dependency behavior

---

# 2. ARCHITECTURAL STYLE

Determine the application's actual architectural structure.

At minimum investigate:

- MVC
- Active Record
- concerns/modules
- policy-based authorization
- external service integration
- payment integration
- webhook/event integration
- client-side Stimulus/Turbo behavior
- persistence

For every architectural mechanism, identify the actual source files implementing or configuring it.

Do not force architectural labels that are unsupported by the code.

---

# 3. COMPONENT INVENTORY

Create a table with these columns:

- Component
- Type
- Actual files/classes/modules
- Responsibility
- Depends on
- Used by
- Evidence

Include at least:

- User
- Room
- Booking
- Setting
- booking controller
- room controller
- controller concerns
- model concerns
- Pundit policies
- Payify/Stripe
- Integromat/Make
- database
- views
- frontend controllers
- authentication
- authorization

Only include components that actually exist.

---

# 4. DOMAIN COLLABORATION MAP

Build an evidence-based collaboration map for:

- User ↔ Booking
- Room ↔ Booking
- Booking ↔ Setting
- Booking ↔ payment
- Booking ↔ webhook/integration
- Controller ↔ model
- Controller ↔ concerns
- Model ↔ concerns
- Controller ↔ policy
- Application ↔ external dependency

For each relationship identify:

- caller
- callee
- method/function
- direction
- purpose
- source file
- exact line range

Example format:

Caller: `BookingsController#create`

Callee: `Booking.new`

Relationship: Controller creates domain object

Evidence: `app/controllers/bookings_controller.rb`

Do not infer relationships from naming alone.

---

# 5. REQUEST / RESPONSE FLOWS

Trace these concrete application flows from the actual source.

## FLOW A — Booking creation

Trace:

User/browser → route → controller action → authorization → model/domain logic → validation → persistence → response/view/redirect

Identify every actual step.

## FLOW B — Booking availability

Trace how the application determines whether a room/date range is available.

Identify:

- entry point
- relevant controller/action
- model methods
- database queries
- validations
- returned result

## FLOW C — Booking payment

Trace:

Booking → payment initialization → Payify/Stripe → callback/webhook if applicable → resulting application state

Clearly separate application code from Payify/Stripe behavior.

## FLOW D — Booking cancellation

Trace the actual cancellation implementation.

Identify:

- entry point
- authorization
- method invoked
- state changes
- persistence
- external effects

Do not assume cancellation is an independent domain object.

## FLOW E — Booking webhook/notification

Trace the complete application-side path from booking event/state to Integromat/Make.

Identify:

- triggering operation
- method/function
- payload construction
- external call
- configuration
- resulting behavior

---

# 6. CONCERN / MODULE COLLABORATION ANALYSIS

The baseline identified these modules.

Model concerns:

- `HasOwnerConcern`
- `HasPriceConcern`
- `HasSettingsConcern`

Controller concerns:

- `AuthConcern`
- `CrudConcern`
- `LocaleConcern`
- `PageConcern`

Analyze each individually.

For every concern/module:

1. Purpose
2. Including/using classes/modules
3. Methods provided
4. Methods overridden or extended
5. Dependencies
6. Call relationships
7. Files and exact line ranges
8. Whether it appears to represent:
   - code reuse
   - delegation
   - polymorphism
   - cross-cutting behavior
   - another architectural mechanism

Do NOT assign a formal design-pattern name yet.

---

# 7. POLICY / AUTHORIZATION STRUCTURE

Analyze:

- `ApplicationPolicy`
- `BookingPolicy`
- `RoomPolicy`
- `SettingPolicy`
- Pundit integration

Identify:

- which controllers/models invoke policies
- which policy methods are used
- whether policy inheritance exists
- whether common behavior is delegated/inherited
- exact source locations

Again, describe the structure without formally classifying it as a design pattern.

---

# 8. EXTERNAL INTEGRATION BOUNDARIES

Analyze:

- Payify
- Stripe
- Integromat/Make
- Devise
- Pundit

For each dependency:

- Where is it configured?
- Which application classes/modules use it?
- Which application methods call it?
- What abstraction boundary exists?
- What data crosses the boundary?
- Is the application directly coupled to the dependency?
- Are there wrappers, adapters, concerns, or facades?
- Exact source locations.

Do not claim Adapter/Facade/etc. yet.

The goal is to give Part 1 a factual collaboration map from which pattern candidates can later be evaluated.

---

# 9. ARCHITECTURAL UML

Produce editable UML source using PlantUML.

Create:

### Diagram 1 — Application Architecture

Show:

Browser/User → Controller → Concerns / Models / Policies → Database / External integrations

Use actual classes/modules where meaningful.

### Diagram 2 — Domain/Class Relationships

At minimum include the actual:

- User
- Room
- Booking
- Setting
- relevant concerns
- relevant policies

Show only relationships supported by source.

### Diagram 3 — Booking Creation Sequence

Show the actual request flow.

### Diagram 4 — Payment/Webhook Sequence

Show the actual integration flow if sufficiently supported by source.

Do not invent participants.

---

# 10. ARCHITECTURAL EVIDENCE TABLE

Create a table with these columns:

- Area
- Actual participant
- Relationship
- Source location
- Evidence description

This table will later serve as the raw evidence base for Part 1 pattern analysis.

---

# 11. ARCHITECTURAL QUESTIONS / UNCERTAINTIES

Explicitly list anything that could not be established.

Examples:

- dependency behavior that exists only inside a gem
- unclear runtime behavior
- missing test coverage
- incomplete frontend trace
- external webhook behavior not observable locally

Do not fill gaps with assumptions.

---

# 12. OUTPUT FORMAT

Return the following sections in order:

1. Architectural summary
2. Architecture classification
3. Component inventory
4. Domain collaboration map
5. Booking creation flow
6. Availability flow
7. Payment flow
8. Cancellation flow
9. Webhook/notification flow
10. Concern/module analysis
11. Policy/authorization analysis
12. External integration analysis
13. PlantUML architecture diagram
14. PlantUML class/domain diagram
15. PlantUML booking sequence diagram
16. PlantUML payment/webhook sequence diagram
17. Architectural evidence table
18. Uncertainties and limitations
19. Part 1 handoff: list of source files/methods that should receive detailed pattern inspection

**FINAL RULE:** Do not perform formal design-pattern classification in this task.

The output should describe WHAT collaborates with WHAT and WHY.

Pattern classification will be performed separately in Prompt 03.
