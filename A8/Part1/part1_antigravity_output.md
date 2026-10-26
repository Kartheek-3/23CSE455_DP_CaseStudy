# Part 1 Repository Archaeology & Design Pattern Analysis — Preserved Output

**Repository**: `DP_Case_study`  
**Baseline Git Commit SHA**: `ae2c24869377ce2f7a29022cd237d808338156ea`  
**Branch**: `main`  
**Team**: A9  

---

## 1. Baseline Environment & Verification Results

- **Node.js**: `v25.9.0`
- **npm**: `11.12.1`
- **TypeScript**: `5.9.3` / `^5.7.3`
- **NestJS Core**: `@nestjs/core ^11.0.1`, `@nestjs/common ^11.0.1`
- **TypeORM**: `typeorm ^0.3.27`, `@nestjs/typeorm ^11.0.0`
- **Apollo Server**: `@apollo/server ^5.1.0`, `@nestjs/graphql ^13.2.0`
- **DataLoader**: `dataloader ^2.2.3`
- **BullMQ**: `bullmq ^5.65.1`, `@nestjs/bullmq ^11.0.4`

### Runtime Command Verification:
1. `npm run build` — **PASSED** (Exit Code 0). NestJS TypeScript compilation completed cleanly.
2. `npm test` — **PASSED** (Exit Code 0). All 10 unit test suites passed.
3. `npm run test:e2e` — **FAILED** (Exit Code 1). Jest e2e test runner failed due to `test/jest-e2e.json` lacking `moduleNameMapper` mapping for `src/` absolute imports in baseline source.

---

## 2. Subsystem Capability & Feature Tracing

1. **Flight Subsystem**: `IMPLEMENTED` (`src/flight/flight.service.ts`, `flight.resolver.ts`, `staff.service.ts`). Features include flight creation, search with pagination, staff crew assignment, seat availability tracking, auto-deletion cron worker (`FlightAutoDelete`). Bug observed at `src/flight/flight.service.ts:39` (`Object.assign(foundedFlight, this.updateFlight)`).
2. **Booking Subsystem**: `IMPLEMENTED` (`src/booking/booking.service.ts`, `booking.resolver.ts`). Features include booking creation, seat boundary validation, booking cancellation restoring available seats on flight.
3. **Seat Subsystem**: `IMPLEMENTED` (`src/seat/seat.service.ts`, `loaders/seat.loader.ts`). Features include seat validation (seatNo 1..6, rowNo 1..20), availability checks, request-scoped DataLoader batching.
4. **User & Auth Subsystem**: `IMPLEMENTED` (`src/users/users.service.ts`, `auth.service.ts`, `google-auth/`). Features include password hashing (`scrypt`), session cookies, Google OAuth 2.0 (`GoogleStrategy`), role restrictions (`rolesRestrict`).
5. **Notification & Queue Subsystem**: `IMPLEMENTED` (`src/users/send-grid.service.ts`, `workers/email.worker.ts`). Features include BullMQ Redis queue processing for email dispatching (`sending-token-sendGrid`, `sending-token-mailtrap`).
6. **Payment Subsystem**: `NOT FOUND / NOT IMPLEMENTED`. Zero payment entities, services, resolvers, or controllers exist in baseline repository.

---

## 3. Confirmed Pattern Inventory & Source Evidence

### 1. Dynamic Guard Factory (`rolesRestrict`)
- **Pattern Name**: `Dynamic Guard Factory`
- **Pattern Type**: `Structural`
- **Instance Name**: `Role-Based Guard Synthesis`
- **Participant Roles**: `Factory Function=rolesRestrict; Dynamic Product Class=RolesRestriceGuard; Product Interface=CanActivate; Dependency=UsersService`
- **Source Location**: `src/flight/guards/roles.restrict.guard.ts:12-28`
- **Intent & Evidence**: Parameterizes authorization guard generation by closing over allowed roles (`...allowedRoles: string[]`). Dynamically constructs and registers a decorated `CanActivate` guard class via NestJS `mixin()`, eliminating duplicated static guard classes across resolvers.

### 2. User Entity Batch Loading (`UserDataLoader`)
- **Pattern Name**: `Batch Loader`
- **Pattern Type**: `Architectural`
- **Instance Name**: `User Entity Batch Loading`
- **Participant Roles**: `Batch Loader Provider=UserDataLoader; DataLoader Instance=userLoader; Target Repository=Repository<User>; Relational Resolver=BookingResolver.user`
- **Source Locations**: `src/users/loaders/user.loader.ts:10-24; src/booking/booking.resolver.ts:114-117`
- **Intent & Evidence**: Request-scoped provider wrapping Facebook DataLoader to batch individual user ID lookups during GraphQL execution ticks into single `WHERE id IN (...)` SQL queries, eliminating $N+1$ query cascades.

### 3. Flight Entity Batch Loading (`FlightDataLoader`)
- **Pattern Name**: `Batch Loader`
- **Pattern Type**: `Architectural`
- **Instance Name**: `Flight Entity Batch Loading`
- **Participant Roles**: `Batch Loader Provider=FlightDataLoader; DataLoader Instance=flightLoader; Target Repository=Repository<Flight>; Relational Resolver=BookingResolver.flight`
- **Source Locations**: `src/flight/loaders/flight.loader.ts:7-23; src/booking/booking.resolver.ts:119-122`
- **Intent & Evidence**: Collects flight ID fetch requests across request execution ticks and executes batch database queries via TypeORM `In()` operator.

### 4. Seat Entity Batch Loading (`SeatDataLoader`)
- **Pattern Name**: `Batch Loader`
- **Pattern Type**: `Architectural`
- **Instance Name**: `Seat Entity Batch Loading`
- **Participant Roles**: `Batch Loader Provider=SeatDataLoader; Single Loader Instance=seatLoader; Relation Loader Instance=seatManyLoader; Target Repository=Repository<Seat>; Relational Resolver=BookingResolver.seat`
- **Source Locations**: `src/seat/loaders/seat.loader.ts:8-45; src/booking/booking.resolver.ts:124-127`
- **Intent & Evidence**: Provides request-scoped batching infrastructure for seat entity retrieval and booking-seat relational mappings.

### 5. Async Email Processing Queue (`SendGridService` / `EmailProcessor`)
- **Pattern Name**: `Producer-Consumer`
- **Pattern Type**: `Architectural`
- **Instance Name**: `Async Email Processing Queue`
- **Participant Roles**: `Job Producers=SendGridService & UsersResolver; Queue Channel=BullMQ Queue 'email'; Consumer Worker=EmailProcessor`
- **Source Locations**: `src/users/send-grid.service.ts:30-42; src/users/users.resolver.ts:94; src/app.module.ts:27-31; src/users/workers/email.worker.ts:8-25`
- **Intent & Evidence**: Decouples synchronous GraphQL API request handling from asynchronous, IO-intensive transactional email delivery.

---

## 4. Candidate Downgrades & Rejections

- **`allAuthGuard`** ([`src/users/guards/allAuth.guard.ts:8-25`](file:///Users/karthikkishor/Development/DP_Case_study/src/users/guards/allAuth.guard.ts#L8-L25)): Classified as **`PATTERN-LIKE STRUCTURE`** (Rejected as formal GoF Composite). Line 23 returns `new UnauthorizedException()` instead of throwing it or returning boolean `false`. In JS boolean context, non-null objects evaluate to `true`, causing unauthorized requests to pass when all child guards fail.
- **TypeORM Repositories & Data Mappers**: Classified as **`FRAMEWORK MECHANISM`**. standard framework features supplied out-of-the-box by TypeORM without custom application-level abstraction classes.
- **Passport Google Strategy**: Classified as **`FRAMEWORK MECHANISM`**. Strategy pattern is internal to Passport library rather than custom application logic.
