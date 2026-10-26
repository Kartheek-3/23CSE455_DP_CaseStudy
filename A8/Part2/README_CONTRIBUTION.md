# Part 2 README Contribution

## Application/Source URL
https://github.com/DevBM04/DP_Case_study

## Source Commits
- **Original / Baseline (Part 1):** ae2c24869377ce2f7a29022cd237d808338156ea
- **Change 1 (Flight Cancellation):** b731f57
- **Change 2 (Seat Class Expansion):** febb4c4
- **Change 3 (Ticket Modification):** 34e8621

## Environment Versions
- Node.js: v24.15.0
- npm: 11.12.1
- Jest: 30.0.0
- NestJS: 11.1.9
- TypeScript: 5.9.3

## Run Commands
```bash
npm install
npm run build
npm run start
```

## Test Commands
```bash
npm test
```

## Inspected Modules
- src/booking (BookingModule, BookingService, BookingResolver)
- src/flight (FlightModule, FlightService, FlightResolver)
- src/seat (SeatModule, SeatService, SeatResolver)
- src/users (UsersModule, SendGridService, EmailWorker)

## LOC / Complexity / Timing Rules
Part 2 does not use runtime measurements (timing rules), cyclomatic complexity counts, or strict Lines of Code (LOC) thresholds. Efficacy is demonstrated via architectural pattern integration, functional correctness, and unit testing as evidenced in the `Part2/changes/` records.

## Limitations
- Payment gateway integration is out of scope and intentionally omitted.
- Modifying a booking's seat requires providing the complete target seat configuration; partial seat updates inside a multi-seat booking are replaced entirely by the new `seats` array provided in the GraphQL input.
