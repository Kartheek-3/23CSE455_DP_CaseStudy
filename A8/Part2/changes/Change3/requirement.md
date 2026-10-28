# Change 3: Ticket Modification

## 1. Requirement
Implement a flexible ticket/booking modification capability within the NestJS Airline Reservation System using the existing architectural model:
- Tickets are represented exclusively through the `Booking` aggregate entity (with foreign keys to `User`, `Flight`, and associated `Seat` entities). No redundant `Ticket` entity is introduced.
- Support passenger modification operations including seat reassignment, seat class changes, and flight rebooking/transfers.
- Ensure rigorous resource validation: seat availability, cabin class consistency, flight capacity adjustments, and cancellation state checks.
- Prevent modifications on cancelled flights or transfers into cancelled flights.
- Enforce strict role-based ownership authorization ensuring passengers can only alter their own bookings.
- Do NOT implement payment gateways, fare difference surcharges, or monetary refunds.

## 2. Intended Behavior
1. **Unified Booking Modification Interface**:
   - `UpdateBooking` GraphQL input DTO encapsulates `bookingId: string`, optional `flightId?: string`, and optional `seats?: CreateSeatInput[]`.
2. **Flight Status Guarding**:
   - Rejects modification attempts on bookings associated with a cancelled flight (`flight.status === FlightStatus.CANCELLED`) with `BadRequestException('Cannot modify a booking for a cancelled flight')`.
   - Rejects flight transfer requests targeting a cancelled flight with `BadRequestException('Cannot transfer booking to a cancelled flight')`.
3. **Flight Capacity Consistency**:
   - When transferring to a new flight, the previous flight's `availableSeats` count is restored (`+N`) and the target flight's `availableSeats` is decremented (`-N`).
   - Rejects transfers if target flight `availableSeats < requestedSeatsCount`.
4. **Seat & Seat-Class Reassignment**:
   - Safely removes obsolete seat reservations from the database.
   - Allocates new seats through `SeatService.createSeat`, ensuring proper seat numbers (1-6), row numbers (1-20), cabin class validation (`FIRST`, `BUSINESS`, `ECONOMY`), and collision detection.
5. **Authorization & Security**:
   - Verifies booking ownership against the authenticated session user (`userId`); unauthorized attempts throw `UnauthorizedException`.
   - Both `modifyBooking` and backward-compatible `updateBooking` mutations are secured via `@UseGuards(rolesRestrict('USER'))`.

## 3. Affected Scope
- `src/booking/dtos/update-booking.dto.ts` (Refactored DTO with `bookingId`, optional `flightId`, and nested `seats`)
- `src/booking/booking.service.ts` (Implemented `modifyBooking` with ownership checks, cancellation guards, flight capacity transfers, and seat reallocation)
- `src/booking/booking.resolver.ts` (Exposed `modifyBooking` and `updateBooking` mutations protected by `rolesRestrict('USER')`)
- `src/booking/booking.service.spec.ts` (Unit tests for seat/class change, flight transfer, capacity updates, cancelled flight guards, and unauthorized attempts)
