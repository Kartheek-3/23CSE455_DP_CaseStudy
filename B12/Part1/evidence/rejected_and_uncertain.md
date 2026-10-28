# Part 1 — Rejected and Uncertain Candidates

**Baseline:** `940daeeab52d5a0b101ce0e76813bcfac88e01a1`
**Paths relative to** `B12/code/original/Smart-Parking-Reservation-System/`.

Each entry states the candidate, the classification that would apply, the
evidence examined, and the reason for the final label. No candidate is upgraded
without application-level evidence of the pattern's participants and
relationships.

---

## A. UNCERTAIN

### A1. Singleton
- **Observed:** NestJS providers are single-instance by default; `UsersService`
  is declared once (`users/users.module.ts:9`) and exported (`:10`), then shared
  (`auth/auth.service.ts:19`). `MailModule` is `@Global` with a single
  `MailService` (`mail/mail.module.ts:8,37-38`).
- **Reason for UNCERTAIN:** the application classes do **not** implement
  Singleton themselves. A sweep of `smart-parking-backend/src` for
  `getInstance`, `private constructor`, `Scope`, `REQUEST`, `TRANSIENT` returned
  **0 matches**. Single-instance lifetime is a container default (framework
  feature), not an application-implemented pattern. Therefore not confirmed.

### A2. Adapter
- **Observed:** `HandlebarsAdapter` is imported and instantiated for the mailer
  (`mail/mail.module.ts:3,28`).
- **Reason for UNCERTAIN:** the adapter is a **library-provided** class
  (`@nestjs-modules/mailer`); the application only configures it. The pattern
  instance exists inside the dependency but is not implemented by application
  code, so it is not confirmed as an application/baseline pattern.

### A3. Template Method
- **Observed:** `JwtStrategy.validate()` (`auth/strategies/jwt.strategy.ts:22-30`)
  supplies a primitive operation invoked by the framework's fixed algorithm;
  `SeedService.onApplicationBootstrap()` (`seed/seed.service.ts:8,14`) is a Nest
  lifecycle hook.
- **Reason for UNCERTAIN:** the template (skeleton algorithm) lives in
  `PassportStrategy` / NestJS, not in application source. The application
  provides only hook implementations. This overlaps with the confirmed Strategy
  attribution (C1) and is therefore recorded as uncertain rather than as a
  separate confirmed pattern, to avoid double counting.

### A4. Factory Method
- **Observed:** `repository.create(...)` (`users/users.service.ts:15`,
  `slots/slots.service.ts:40`, `reservations/reservations.service.ts:84`) and
  `NestFactory.create(AppModule)` (`main.ts:6`).
- **Reason for UNCERTAIN:** these are framework/ORM factory calls. There is no
  application-defined creator hierarchy or overridable factory method in the
  baseline. Framework-provided creation is not confirmed as an application
  Factory Method.

### A5. Chain of Responsibility
- **Observed:** guard pipelines via `@UseGuards(JwtAuthGuard, RolesGuard)`
  (`parking/parking.controller.ts:21`, `slots/slots.controller.ts:23`,
  `reservations/reservations.controller.ts:68,75,82`), and the frontend axios
  request interceptor (`smart-parking-frontend/src/services/api.js:13-24`).
- **Reason for UNCERTAIN:** the chain is defined and executed by NestJS/axios.
  Application classes only register handlers. No application-composed handler
  chain with explicit successor links exists. Not confirmed.

### A6. Observer
- **Observed:** no backend publish/subscribe. Sweep of `smart-parking-backend/src`
  for `EventEmitter`/`websocket`/`socket.io` = 0 matches; `@nestjs/event-emitter`
  appears only as an **unused optional peer dependency** in
  `smart-parking-backend/package-lock.json:2322,2338`. The only subscription-like
  mechanism is the frontend Zustand store (`smart-parking-frontend/src/store/authStore.js:4-35`)
  with React components subscribing to state.
- **Reason for UNCERTAIN:** the subscription mechanism is library/managed
  (Zustand + React). The application does not implement a Subject/Observer
  relationship. Because `Part3/Observer/` is a **provisional** directory, this
  candidate must not be treated as confirmed; it needs verification before any
  Part 3 claim.

### A7. Facade
- **Observed:** `AuthService` aggregates `UsersService`, `JwtService` and
  `MailService` (`auth/auth.service.ts:16-22`) and exposes a unified auth API
  (`register`/`login`/`forgotPassword`/`resetPassword`/`updateProfile`/
  `changePassword`, `:24-189`).
- **Reason for UNCERTAIN:** this is ordinary service composition in a layered
  app. A Facade specifically simplifies a *complex subsystem* interface; here the
  collaborators are few and directly used. Recorded as uncertain.

### A8. Data Mapper
- **Observed:** entities are plain classes (`users/user.entity.ts`,
  `slots/slot.entity.ts`, etc.) persisted through repositories.
- **Reason for UNCERTAIN:** the mapping is performed entirely by TypeORM. The
  application defines entities and delegates persistence; it does not implement
  the mapping logic. Closely tied to C2 (Repository); left uncertain to keep the
  confirmed set strictly application-owned.

---

## B. REJECTED

| Candidate | Reason for rejection |
|---|---|
| **Decorator (GoF)** | `@Roles()` (`auth/decorators/roles.decorator.ts:5`) is a TypeScript/NestJS **metadata decorator** (`SetMetadata`), not the GoF structural Decorator that wraps an object with added behaviour sharing the same interface. Name resemblance only. |
| **Builder** | Object creation uses DI and DTOs; no builder class or step-by-step construction API exists. |
| **State** | `ReservationStatus` (`reservations/reservation.entity.ts:5-10`) and `SlotStatus` (`slots/slot.entity.ts:13-16`) are plain enums stored as data; there are no per-state classes with state-specific behaviour. |
| **Proxy (GoF)** | `smart-parking-frontend/src/proxy.js:1-61` is Next.js auth middleware (routing/redirect), not a GoF Proxy object that controls access to a subject. Name resemblance only. |
| **Command** | Controller methods (`...controller.ts`) are HTTP handlers, not encapsulated command objects with `execute()` and a receiver/undo model. |
| **Iterator** | Iteration uses built-in language constructs (`.map`, `for..of`, TypeORM result arrays); no custom iterator/aggregate. |
| **Abstract Factory** | No families of related products or abstract factory interface; providers are injected individually. |
| **MVC** | There are no controllers paired with view-models/templates in the backend. The backend is better described by Layered Architecture (C4); "MVC" is rejected as inaccurate. |

---

## C. NOT FOUND (feature areas, recorded for completeness)

These are **absent**, not merely uncertain, and are recorded so they are not
mistakenly "discovered" later:

- **Payment** — no module/entity/controller/gateway; only `totalPrice`
  computation (`reservations/reservations.service.ts:80-82,241-243`).
- **EV charging** — only the `SlotType.EV` marker (`slots/slot.entity.ts:20`).
- **Occupancy** (as a module) — only derived `SlotStatus` + availability query.
- **Vehicle management** (as a module) — vehicle data only as fields on `User`
  and `Reservation`.

---

## D. Open issues to resolve before Part 3

1. Confirm whether any baseline pattern beyond `Strategy` is eligible for the
   Part 3 cross-language comparison, or whether Part 3 should use `Strategy`
   plus the three Part 2 evolution patterns.
2. `Observer` must not be assumed. If Part 3 needs a second pattern, it must be
   established by evidence first.
3. `Singleton` is container-managed; decide whether the case study treats
   framework-managed lifetimes as in-scope patterns (this report does not).
