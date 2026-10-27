# Change 1: Flight Cancellation

## 1. Requirement
Implement non-destructive, lifecycle-managed flight cancellation within the NestJS Airline Reservation System:
- Replace destructive flight deletion with an authoritative operational cancellation state.
- Prevent future bookings from being scheduled on cancelled flights.
- Ensure seat consistency by releasing booked seats upon flight cancellation.
- Enforce role-based authorization restricting cancellation operations to administrators and flight crew.
- Integrate passenger cancellation notifications via the existing asynchronous email processing queue (BullMQ / SendGrid).
- Maintain distinct separation between individual booking cancellation (`cancelBooking`) and holistic flight cancellation (`cancelFlight`).
- Do NOT implement payment, refund, or banking transactions.

## 2. Intended Behavior
1. **Authoritative State Transition**:
   - `Flight` entity introduces a single authoritative `status: FlightStatus` field (`ACTIVE | CANCELLED`), defaulting to `FlightStatus.ACTIVE`.
   - Cancellation transitions `flight.status` to `FlightStatus.CANCELLED` and resets `availableSeats` to 0.
   - Attempting to cancel an already cancelled flight throws `BadRequestException('Flight is already cancelled')`.
   - Cancellation is non-destructive (`flightRepo.save()` updates persistence instead of `flightRepo.remove()`).
2. **Booking Guarding**:
   - `BookingService.createBooking` inspects the flight status; if `flight.status === FlightStatus.CANCELLED`, it throws `BadRequestException('Cannot book seats on a cancelled flight')`.
3. **Seat Consistency**:
   - Upon flight cancellation, all associated seats for that flight are updated with `isAvailable: true` via `SeatRepository.update()`.
4. **Asynchronous Notification**:
   - If passenger bookings exist and the email subsystem is active, `FlightService.cancelFlight` invokes `SendGridService.send()`, dispatching async cancellation email jobs into BullMQ queue `'email'`.
5. **GraphQL Operations & Authorization**:
   - Exposes `@Mutation(() => Flight) cancelFlight(id: ID!)` guarded by `rolesRestrict(Role.ADMIN, Role.CREW)` (Dynamic Guard Factory).
   - Preserves backward-compatible `removeFlight(id: ID!)` mutation delegating to `cancelFlight` and returning `FlightResponse`.

## 3. Affected Scope
- `src/flight/enums/flight-status.enum.ts` (Newly introduced: GraphQL enum registration & TypeScript enum)
- `src/flight/entities/flight.entity.ts` (Added `status` column with `@Field(() => FlightStatus)`)
- `src/flight/flight.service.ts` (Refactored `cancelFlight` to non-destructive status update, seat release, and notification dispatch)
- `src/flight/flight.resolver.ts` (Added `cancelFlight` mutation guarded by `rolesRestrict(Role.ADMIN, Role.CREW)`, updated `removeFlight`)
- `src/flight/flight.module.ts` (Registered `Seat` repository, `BullModule.registerQueue({ name: 'email' })`, and `SendGridService`)
- `src/booking/booking.service.ts` (Added `flight.status === FlightStatus.CANCELLED` check in `createBooking`)
- `src/flight/flight.service.spec.ts` (Unit tests for successful cancellation, seat update, notification, and rejection of invalid/cancelled states)
- `src/booking/booking.service.spec.ts` (Unit tests verifying booking rejection on cancelled flights)
