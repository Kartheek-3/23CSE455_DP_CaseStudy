# Change 2: Seat-Class Expansion

## 1. Requirement
Evolve the seat domain subsystem within the NestJS Airline Reservation System from a uniform seating structure to a multi-tiered cabin class architecture:
- Introduce standardized cabin seat classes: `FIRST`, `BUSINESS`, and `ECONOMY`.
- Enforce domain allocation rules mapping aircraft rows to cabin classes.
- Support seat class specification and auto-inference during seat creation and booking.
- Ensure backwards compatibility for existing bookings and DataLoader operations.
- Preserve existing seat uniqueness, boundary validation, and availability semantics.
- Do NOT implement payment, ticket pricing, dynamic tariffs, or refund mechanisms.

## 2. Intended Behavior
1. **SeatClass Taxonomy**:
   - `SeatClass` enum (`FIRST | BUSINESS | ECONOMY`) registered with GraphQL schema via `registerEnumType`.
2. **Entity & DTO Extension**:
   - `Seat` entity incorporates `@Column({ type: 'varchar', default: SeatClass.ECONOMY })` and `@Field(() => SeatClass)` `seatClass: SeatClass`.
   - `CreateSeatInput` accepts optional `@Field(() => SeatClass) seatClass?: SeatClass`.
3. **Cabin Row Allocation Rules**:
   - Rows 1–3: `FIRST` class.
   - Rows 4–8: `BUSINESS` class.
   - Rows 9–20: `ECONOMY` class.
   - When `seatClass` is explicitly specified, the row number must strictly fall within the designated range; otherwise throws `BadRequestException`.
   - When `seatClass` is omitted, the system deterministically infers the appropriate cabin class from the row number.
4. **Availability & Uniqueness**:
   - Seat booking uniqueness continues to enforce `(seatNo, rowNo, flightId, isAvailable: false)`.
   - `SeatDataLoader` batch loading continues to resolve seats with their hydrated `seatClass` attribute.
5. **Booking Integration**:
   - `BookingResolver.createBooking` propagates `seatClass` through to `SeatService.createSeat`, ensuring all booked seats reflect their assigned cabin tier.

## 3. Affected Scope
- `src/seat/enums/seat-class.enum.ts` (Newly introduced: GraphQL enum registration & TypeScript enum)
- `src/seat/entities/seat.entity.ts` (Added `seatClass` column and GraphQL field)
- `src/seat/dtos/create-seat.dto.ts` (Added optional `seatClass` input field with `@IsEnum` validation)
- `src/seat/seat.service.ts` (Added class-row consistency validation, auto-inference, and class assignment)
- `src/booking/booking.resolver.ts` (Passed `seatClass` from input DTO to `seatService.createSeat`)
- `src/seat/seat.service.spec.ts` (Unit tests for class creation, row validation, auto-inference, boundary checks, and collision detection)
