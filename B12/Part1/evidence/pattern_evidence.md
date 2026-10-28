# Part 1 — Pattern Evidence Register

**Baseline:** `940daeeab52d5a0b101ce0e76813bcfac88e01a1` (branch `main`)
**All paths are relative to** `B12/code/original/Smart-Parking-Reservation-System/`.
**Line ranges verified by direct inspection on 2026-10-10.**

Every **CONFIRMED** pattern below states: participants, responsibilities,
relationships and the exact source evidence. Nothing here is inferred from an
LLM response.

---

## C1. Strategy — CONFIRMED (GoF, Behavioural)

**Instance:** JWT authentication strategy (1 instance).

**Participants**

| Role | Participant | Location |
|---|---|---|
| Strategy (interface/context) | Passport strategy base + `PassportStrategy` mixin from `@nestjs/passport`; concrete interface `Strategy` from `passport-jwt` | `auth/strategies/jwt.strategy.ts:1-2` |
| ConcreteStrategy | `JwtStrategy` | `auth/strategies/jwt.strategy.ts:7-18` |
| Strategy selection / invocation (application entry point) | `JwtAuthGuard extends AuthGuard('jwt')` — resolves the strategy registered under the name `'jwt'`. The GoF **Context** role is performed by Passport's `AuthGuard('jwt')`, not by `JwtAuthGuard` itself; the application guard only selects/invokes it | `auth/guards/jwt-auth.guard.ts:1-5` |
| Client (uses the guard) | Controllers decorated with `@UseGuards(JwtAuthGuard)` | `slots/slots.controller.ts:22-23`, `parking/parking.controller.ts:20-21`, `reservations/reservations.controller.ts:22-23`, `auth/auth.controller.ts:38,57,68` |

**Responsibilities / relationships**

- `JwtStrategy.validate()` (`auth/strategies/jwt.strategy.ts:22-30`) implements the
  algorithm-specific step (verify the JWT payload, load the user, strip the
  password). The generic extraction/validation flow is supplied by
  `PassportStrategy(Strategy)` (`:8`, `:13-17`).
- The concrete strategy is selected polymorphically by name via
  `AuthGuard('jwt')` (`auth/guards/jwt-auth.guard.ts:5`), so the algorithm can be
  swapped without changing callers. This is the defining Strategy relationship.

**Scope note:** the Strategy interface and the context (Passport) are provided by
`passport-jwt` / `@nestjs/passport`; the **application** supplies the
ConcreteStrategy (`JwtStrategy`) and its registration as a provider
(`auth/auth.module.ts:22`). The pattern instance is therefore attributed to the
composed application, and this attribution is stated explicitly rather than
assumed from the presence of a class named `Strategy`.

**Evidence lines:** `auth/strategies/jwt.strategy.ts:7-18,22-30`;
`auth/guards/jwt-auth.guard.ts:5`; `auth/auth.module.ts:22`.

---

## C2. Repository — CONFIRMED (Architectural / enterprise, data-access)

TypeORM's `Repository<T>` is an enterprise data-access pattern (Fowler, PoEAA),
not a GoF pattern. The application defines the entities and injects repositories
per entity; each injected repository is one instance.

**Instances (4)**

### C2.1 User repository
- Location: `users/users.service.ts:9-12`
- Participants: `Repository<User>` (ConcreteRepository, `:10-12`), entity `User`
  (`users/user.entity.ts:9-41`), client `UsersService`.
- Responsibilities: encapsulates persistence for `User`
  (`create`/`save`/`findByEmail`/`findById`, `:14-29`).

### C2.2 ParkingArea repository
- Location: `parking/parking.service.ts:9-11`
- Participants: `Repository<ParkingArea>`, entity `ParkingArea`
  (`parking/parking-area.entity.ts:10-28`), client `ParkingService`.
- Responsibilities: persistence for `ParkingArea`
  (`create`/`findAll`/`update`/`remove`, `:14-61`).

### C2.3 Slot repository
- Location: `slots/slots.service.ts:17-19`
- Participants: `Repository<Slot>`, entity `Slot`
  (`slots/slot.entity.ts:23-56`), client `SlotsService`.
- Responsibilities: persistence for `Slot` and availability queries (`:29-192`).

### C2.4 Reservation repository
- Location: `reservations/reservations.service.ts:15-16`
- Participants: `Repository<Reservation>`, entity `Reservation`
  (`reservations/reservation.entity.ts:17-64`), client `ReservationsService`.
- Responsibilities: persistence and lifecycle queries for `Reservation`
  (`:22-327`).

**Scope note:** the mapping between entity and table is performed by TypeORM's
Data Mapper; the application does not implement mapping or SQL by hand. The
Repository instances are confirmed because each application service depends on a
typed repository and mediates all persistence through it.

**Evidence lines:** `users/users.service.ts:9-12`;
`parking/parking.service.ts:9-11`; `slots/slots.service.ts:17-19`;
`reservations/reservations.service.ts:15-16`.

---

## C3. Dependency Injection / Inversion of Control — CONFIRMED (Architectural)

**Instance:** NestJS DI container wiring (1 instance, application-wide).

**Participants / responsibilities**

- IoC container: the Nest application context, bootstrapped in `main.ts:5-6`.
- Composition root: `app.module.ts:13-42` imports all feature modules and
  registers `SeedService` as a provider (`:41`).
- Providers / service registry: modules declare and export providers, e.g.
  `users/users.module.ts:9-10` (`providers: [UsersService]`,
  `exports: [UsersService]`), `mail/mail.module.ts:37-38`,
  `auth/auth.module.ts:22`.
- Clients: constructors receive dependencies rather than constructing them —
  `slots/slots.controller.ts:24-25`, `auth/auth.service.ts:18-22`,
  `reservations/reservations.service.ts:14-20`.

**Relationship:** control over instantiation is inverted from the dependent
classes to the Nest container; classes declare dependencies and the container
injects them. This is confirmed by the module `providers`/`exports` metadata and
constructor injection sites.

**Evidence lines:** `app.module.ts:13-42`; `users/users.module.ts:7-11`;
`auth/auth.module.ts:9-23`; `slots/slots.controller.ts:24-25`;
`auth/auth.service.ts:18-22`.

---

## C4. Layered Architecture (Controller–Service–Repository) — CONFIRMED (Architectural)

**Instance:** NestJS backend layering (1 instance).

**Participants / responsibilities**

- Presentation layer: controllers receive HTTP requests and delegate, holding no
  business logic — `slots/slots.controller.ts:29-30`
  (`return this.slotsService.create(...)`), `parking/parking.controller.ts:27-28`.
- Application/business layer: services hold logic and call repositories —
  `slots/slots.service.ts:29-49`, `parking/parking.service.ts:14-19`,
  `reservations/reservations.service.ts:22-113`.
- Data-access layer: TypeORM repositories/entities (see C2).

**Relationship:** one-directional call flow controller → service → repository,
visible across `slots`, `parking` and `reservations` modules.

**Evidence lines:** `slots/slots.controller.ts:24-31`;
`slots/slots.service.ts:14-49`; `parking/parking.controller.ts:22-29`;
`parking/parking.service.ts:8-19`.

---

## Reused framework relationships referenced above (not counted as instances)

- `@Injectable()` decorators mark DI-managed providers
  (`users/users.service.ts:7`, `auth/auth.service.ts:16`, and all services).
- `@Controller(...)` / `@Module(...)` decorators declare Nest metadata.
- Passport `AuthGuard` and Nest guards implement `CanActivate`
  (`auth/guards/roles.guard.ts:6-22`).

These are framework/language mechanisms and are **not** counted as separate
design-pattern instances (see the counting rule in the report).
