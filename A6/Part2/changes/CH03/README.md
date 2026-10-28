# CH03 - Multiple ride types and dynamic pricing

Owner: K Harish (AM.SC.U4CSE23129). Commit `a12c878a4977787b8d2c5349dfebd7b3f605824c` (parent: CH02 `28a83c8`).

## Requirement (user story)
As a **rider** I want **hourly and outstation rides** in addition to one-way and multi-day trips, and as the **business** we
want **fares to rise at peak hours and when few drivers are nearby**.

## Acceptance criteria
1. Ride types: ONE_WAY Rs 10/km (min Rs 450, unchanged), ROUND_TRIP Rs 1000/calendar day (unchanged), **HOURLY** Rs 200 per
   started hour (min 4 h), **OUTSTATION** Rs 12/km + Rs 300 per day. Missing inputs -> 400.
2. Peak surcharge +25% when the ride starts 08:00-10:59 or 17:00-20:59 IST; low-supply surcharge +20% when fewer than 3
   drivers are within 20 km by road (known only when booking a broadcast ride); both stack.
3. Adding a ride type or pricing rule must not edit existing fare classes.
4. Final fare at completion uses the ride type's extra-km rate (Rs 10, outstation Rs 12) instead of a hard-coded 10.
5. Existing ONE_WAY / ROUND_TRIP results are unchanged off-peak with normal supply.

## Design
- **Strategy** - `src/domain/pricing/FareStrategy.ts`: `FareStrategy`, `OneWayFare`, `RoundTripFare`, `HourlyFare`,
  `OutstationFare`; context `FareCalculatorService` (registry + `register()`).
- **Decorator** - `src/domain/pricing/DynamicPricing.ts`: `FareDecorator`, `PeakHourSurcharge`, `LowSupplySurcharge`.
- `BookDriver` now prices after matching and passes `availableDrivers`.
UML: `Part2/diagrams/ch03_fare_strategy_decorator.png`.

## Pattern effects
| Instance | Status | Reason |
|---|---|---|
| Ride Fare Pricing (Strategy) | newly_introduced | replaces the if/else (the rejected baseline Strategy candidate) |
| Dynamic Fare Pricing (Decorator) | newly_introduced | pricing rules wrap any strategy |
| Use-Case and Service Composition Root (DI) | extended | `UpdateBookingStatus` injects `IFARE_CALCULATE_SERVICE` |

## Refactoring
- **Smells:** Switch Statements on `bookingType` in `FareCalculatorService.calculate`; magic number `ratePerKm = 10`
  duplicated in `UpdateBookingStatus`; ONE_WAY validation threw a plain `Error` (became HTTP 500).
- **Techniques:** Replace Conditional with Polymorphism (Strategy); Replace Magic Number with the strategy's `extraKmRate`;
  validation errors now `AuthError(400)`.
- **Behaviour preservation:** the 6 baseline tests in `tests/fare.test.ts` pass **unchanged**; the baseline BookDriver test keeps
  its Rs 450 expectation with a fixed off-peak start and 3 drivers in range (the old test used "now + 5 days", whose hour
  varies, and 1 driver, which now triggers the low-supply rule).

## Tests
`npm test` at the commit: **41/41 passed** (`test_results.txt`); new `tests/pricing.test.ts` (9 tests, fixtures S1-S8
shared with Part 3). `tsc --noEmit`: 7 errors, identical to the baseline.

## Metrics (tools/ts_metrics.js)
| File | NLOC before -> after | max CC before -> after |
|---|---|---|
| `infrastructure/services/FareCalculatorService.ts` | 32 -> 30 | 6 -> 2 |
| `BookDriver.ts` | 128 -> 136 (incl. CH01) | 15 -> 18 |
| `domain/pricing/FareStrategy.ts` (new) | - -> 52 | - -> 3 |
| `domain/pricing/DynamicPricing.ts` (new) | - -> 28 | - -> 5 |

Known limitation: `GetEstimatedFare` has no supply information, so the pre-booking estimate shows only the peak surcharge;
the low-supply surcharge is applied when the booking is created.

Files: `ride_types_dynamic_pricing.patch`, `diffstat.txt`, `test_results.txt`.
