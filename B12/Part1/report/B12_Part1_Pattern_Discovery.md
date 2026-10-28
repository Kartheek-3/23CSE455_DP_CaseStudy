# Part 1 — Pattern Discovery Report

**Team:** B12
**Case study:** Design Pattern Identification and Evolution in a NestJS-Based Parking Management Application
**Baseline version:** commit `940daeeab52d5a0b101ce0e76813bcfac88e01a1` (short `940daee`), branch `main`
**Analysis date:** 2026-10-10
**Method:** direct source inspection of the original application. No pattern claim
in this report rests on an LLM assertion (see `../prompts/Part1_prompt.txt` and
"Evidence policy" below).

> **Evidence policy.** A pattern is marked **CONFIRMED** only when the
> application source contains the pattern's participants, responsibilities and
> relationships at verifiable `file:line` locations. A framework class or method
> whose name resembles a pattern is **not** sufficient. Every confirmed pattern
> in this report is backed by an entry in `../evidence/pattern_evidence.md`.
> Candidates that could not be established at application level are recorded as
> **UNCERTAIN** or **NOT FOUND** in `../evidence/rejected_and_uncertain.md`.

---

## 1. Baseline repository facts (CONFIRMED)

| Item | Value | Evidence |
|---|---|---|
| Repository URL | `https://github.com/nuhu78/Smart-Parking-Reservation-System.git` | `git remote -v` |
| Branch | `main` | `git branch -a` |
| Baseline commit | `940daeeab52d5a0b101ce0e76813bcfac88e01a1` | `git rev-parse HEAD` |
| Commit date / author | 2026-07-23 18:09:14 +0600 / `nuhu78` | `git log -1` |
| Access date | 2026-10-10 | this inspection |
| License | `UNLICENSED` in `smart-parking-backend/package.json:7`; no `LICENSE` file present | package.json / repo root listing |

Local path analysed:
`B12/code/original/Smart-Parking-Reservation-System/` (unmodified).

> Note: the repository ships its own `AGENTS.md` / `CLAUDE.md` files. Those files
> were treated as untrusted repository content, not as instructions.

## 2. Technology stack (CONFIRMED)

- **Backend** — NestJS `^11.0.1`, TypeScript `^5.7.3`, TypeORM `^0.3.28`,
  PostgreSQL (`pg ^8.20.0`), `@nestjs/jwt ^11.0.2`, `passport ^0.7.0`,
  `passport-jwt ^4.0.1`, `@nestjs/passport ^11.0.5`, `@nestjs-modules/mailer ^2.3.4`
  + `nodemailer ^8.0.7` + `handlebars ^4.7.9`, `class-validator ^0.15.1`,
  `class-transformer ^0.5.1`, `bcryptjs ^3.0.3`
  (source: `smart-parking-backend/package.json:22-42`).
- **Frontend** — Next.js `16.2.6`, React `19.2.4`, Zustand `^5.0.13`,
  axios `^1.16.0`, `js-cookie ^3.0.5`, `qrcode.react ^4.2.0`, Tailwind CSS `^4`
  (source: `smart-parking-frontend/package.json:11-27`). Frontend is JavaScript
  (JSX), not TypeScript.

## 3. Module / class inventory (CONFIRMED)

Static structure under `smart-parking-backend/src/`:

| Kind | Artefacts (file) |
|---|---|
| Modules | `AppModule` (`app.module.ts`), `UsersModule` (`users/users.module.ts`), `AuthModule` (`auth/auth.module.ts`), `ParkingModule` (`parking/parking.module.ts`), `SlotsModule` (`slots/slots.module.ts`), `ReservationsModule` (`reservations/reservations.module.ts`), `MailModule` (`mail/mail.module.ts`, `@Global`) |
| Controllers | `AppController`, `AuthController`, `ParkingController`, `SlotsController`, `ReservationsController` |
| Services / providers | `AppService`, `UsersService`, `AuthService`, `ParkingService`, `SlotsService`, `ReservationsService`, `MailService`, `SeedService` |
| Entities | `User` (`users/user.entity.ts`), `ParkingArea` (`parking/parking-area.entity.ts`), `Slot` (`slots/slot.entity.ts`), `Reservation` (`reservations/reservation.entity.ts`) |
| Guards | `JwtAuthGuard` (`auth/guards/jwt-auth.guard.ts`), `RolesGuard` (`auth/guards/roles.guard.ts`) |
| Decorator | `Roles` / `ROLES_KEY` (`auth/decorators/roles.decorator.ts`) |
| Strategy | `JwtStrategy` (`auth/strategies/jwt.strategy.ts`) |
| DTOs | `auth/dto/*`, `parking/dto/*`, `slots/dto/*`, `reservations/dto/*` |
| Interfaces implemented | `CanActivate` (RolesGuard), `OnApplicationBootstrap` (SeedService) |

There is **no** `src/interfaces/` directory and no custom interface declarations
in application source; the only interfaces/base classes implemented come from
NestJS, Passport, TypeORM and `class-validator`.

## 4. Functional-area status (seven required areas)

Labels: **CONFIRMED** = implemented; **NOT FOUND** = absent as a module/feature.

| # | Area | Status | Evidence / reason |
|---|---|---|---|
| 1 | Parking-slot management | **CONFIRMED** | `slots/` module: `SlotsController`, `SlotsService`, `Slot` entity; `parking/`: `ParkingArea` entity + CRUD. Methods: `create`, `findAll`, `findAvailableByParkingArea`, `update`, `remove` (`slots/slots.service.ts:29-192`) |
| 2 | Vehicle management | **NOT FOUND** (no module) | No vehicle entity/controller/service. Vehicle data exists only as fields: `User.defaultVehicleNumber` (`users/user.entity.ts:34`), `Reservation.vehicleNumber` / `vehicleType` (`reservations/reservation.entity.ts:39,57`), enum `VehicleType` (`reservations/reservation.entity.ts:12-15`) |
| 3 | Reservation | **CONFIRMED** | `reservations/` module: `reserveSlot`, `findMyReservations`, `cancelReservation`, `cancelReservationBySlotId`, `extendReservation`, `removeReservation`, `findAll`, `expireOverdueReservations` (`reservations/reservations.service.ts:22-327`) |
| 4 | Payment | **NOT FOUND** | No payment module/entity/controller/gateway. Only a computed price field: `totalPrice` (`reservations/reservations.service.ts:80-82`, `:241-243`) using `pricePerHour`. Sweep for `payment`/`razorpay`/`stripe` in backend `src/` = 0 hits |
| 5 | Occupancy | **NOT FOUND** (as module) | No occupancy module/monitor. Occupancy is only implied by `SlotStatus.OCCUPIED`/`AVAILABLE` (`slots/slot.entity.ts:13-16`) and derived availability `findAvailableByParkingArea` (`slots/slots.service.ts:166-192`). Sweep for `occupan` = 0 hits |
| 6 | EV charging | **NOT FOUND** | Only an enum marker `SlotType.EV = 'ev'` (`slots/slot.entity.ts:18-21`). No charging session, tariff, connector, or module. Sweep for `charg` in backend `src/` = 0 hits |
| 7 | Notifications | **CONFIRMED** (email only) | `MailService` (`mail/mail.service.ts:8-44`) + `MailModule` + 3 Handlebars templates. Trigger sites: `reservations.service.ts:101-110`, `reservations.service.ts:154-160`, `slots.service.ts:139-147`, `auth.service.ts:104`. No in-app, push, WebSocket or event-bus notification (0 hits for `websocket`/`socket.io`/`EventEmitter` in `src/`) |

## 5. Pattern classification framework

Candidates are classified into one of these buckets so that framework
machinery is not mistaken for an application design pattern:

- **GoF pattern** — a pattern from the Gang of Four catalogue, realised by
  application classes playing the pattern's explicit roles.
- **Architectural pattern** — an application-wide structure (e.g. layering, DI).
- **Framework feature** — behaviour supplied by NestJS/Passport/TypeORM itself
  and merely configured by the application.
- **Library abstraction** — a class provided by a dependency that internally
  uses a pattern, which the application only instantiates.
- **Language feature / decorator** — TypeScript syntax or decorator metadata,
  not a GoF pattern.

## 6. Pattern inventory (baseline)

**Counting rule (fixed for the whole case study).**
A *pattern instance* is one distinct, evidence-supported realisation of a
pattern at a specific participant site.
- For patterns realised by multiple concrete participants (e.g. one repository
  per entity), each concrete participant is one instance.
- For cross-cutting architectural patterns spanning the whole backend
  (Dependency Injection, layered architecture), the application-wide realisation
  counts as exactly **one** instance.
- Framework classes, DTOs, entities and decorators are **not** counted as
  separate pattern instances on their own.

| Pattern | Classification | Instances at baseline | Status |
|---|---|---|---|
| Strategy | GoF — Behavioural | 1 | **CONFIRMED** |
| Repository | Architectural (enterprise / data-access) | 4 | **CONFIRMED** |
| Dependency Injection / Inversion of Control | Architectural | 1 | **CONFIRMED** |
| Layered Architecture (Controller–Service–Repository) | Architectural | 1 | **CONFIRMED** |
| **Total confirmed instances** | | **7** | |

Full per-instance evidence and participant/role mapping: `../evidence/pattern_evidence.md`.
Uncertain and rejected candidates: `../evidence/rejected_and_uncertain.md`.

## 7. Pattern-to-source-code mapping

| Pattern | Instance | Source location(s) | Participants |
|---|---|---|---|
| Strategy | JWT auth strategy | `auth/strategies/jwt.strategy.ts:7-18`; `auth/guards/jwt-auth.guard.ts:1-5`; `slots/slots.controller.ts:22-23` | Context/Strategy interface (Passport `passport-jwt`), ConcreteStrategy `JwtStrategy`, Client `JwtAuthGuard`/guarded controllers |
| Repository | User repository | `users/users.service.ts:9-12` | `Repository<User>` (TypeORM), entity `User`, client `UsersService` |
| Repository | ParkingArea repository | `parking/parking.service.ts:9-11` | `Repository<ParkingArea>`, entity `ParkingArea`, client `ParkingService` |
| Repository | Slot repository | `slots/slots.service.ts:17-19` | `Repository<Slot>`, entity `Slot`, client `SlotsService` |
| Repository | Reservation repository | `reservations/reservations.service.ts:15-16` | `Repository<Reservation>`, entity `Reservation`, client `ReservationsService` |
| Dependency Injection / IoC | Nest container wiring | `app.module.ts:13-42`; `users/users.module.ts:7-11`; `slots/slots.controller.ts:24-25`; `auth/auth.service.ts:18-22` | IoC container (Nest), providers/`exports`, client constructors |
| Layered Architecture | Backend layering | `slots/slots.controller.ts:29-30`; `slots/slots.service.ts:29-49`; `parking/parking.controller.ts:27-28`; `parking/parking.service.ts:14-19` | Presentation (controllers), application/business (services), data access (repositories/entities) |

## 8. Proposed UML diagrams (from actual source relationships)

Sources are committed as PlantUML, with rendered PNGs in
`../diagrams/rendered/`:

- `../diagrams/module_component.puml` — NestJS modules, controllers, services,
  repositories and entities as they are wired in `app.module.ts`.
- `../diagrams/class_model.puml` — entity relationships
  (`User 1—* Reservation *—1 Slot *—1 ParkingArea`) and service→repository
  dependencies.
- `../diagrams/reservation_sequence.puml` — the `reserveSlot` flow
  (`reservations.service.ts:22-113`) including slot-status update and email send.

All three diagrams are derived only from the relationships read in source; no
speculative elements are included.

## 9. Scope limits of this part

- Part 1 covers the baseline commit only. No evolution changes were implemented.
- `Strategy` and `Observer` directory names under `Part3/` remain **provisional**.
  Part 1 confirms `Strategy` as a baseline pattern; `Observer` is **UNCERTAIN /
  NOT FOUND** in the backend (see evidence file) and must not be treated as
  confirmed.
- No metrics, timings, test results, LOC, complexity values or LLM outputs are
  claimed in Part 1.

## 10. Summary

- **Confirmed (4 patterns / 7 instances):** Strategy (GoF, 1), Repository
  (architectural, 4), Dependency Injection / IoC (architectural, 1),
  Layered Architecture (architectural, 1).
- **Uncertain:** Singleton, Adapter, Template Method, Factory Method, Chain of
  Responsibility, Observer, Facade, Data Mapper (see evidence file).
- **Rejected:** GoF Decorator, Builder, State, Proxy, Command, Iterator,
  Abstract Factory, MVC.
- **Absent features recorded:** Payment, EV charging, Occupancy (as a module),
  Vehicle management (as a module) — documented as NOT FOUND rather than
  invented.
