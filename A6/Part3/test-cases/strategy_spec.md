# Strategy - Ride Fare Calculation

Source instance: **Ride Fare Pricing** (introduced in CH03, `Part2/code/src/domain/pricing/`).

## Participants
- `FareStrategy` - interface with `calculate(trip) -> number` (whole rupees).
- Concrete strategies: `OneWayFare`, `RoundTripFare`, `HourlyFare`, `OutstationFare`.
- `FareCalculator` - context. Holds a registry `rideType -> FareStrategy`; `register(type, strategy)` adds a ride type
  without editing existing strategies; `calculate(trip)` delegates to the registered strategy.

## Input
`trip = { rideType: string, km: number, days: integer, hours: number }` (unused fields are 0).

## Rules
| rideType | validation | fare |
|---|---|---|
| `ONE_WAY` | km > 0 | max(450, km * 10) |
| `ROUND_TRIP` | days >= 1 | days * 1000 |
| `HOURLY` | hours > 0 | max(4, ceil(hours)) * 200 |
| `OUTSTATION` | km > 0 and days >= 1 | km * 12 + days * 300 |
| anything else | - | error `UNKNOWN_RIDE_TYPE` |

A failed validation raises error `INVALID_INPUT`.

## Fixtures (identical in all four languages)
| id | rideType | km | days | hours | expected |
|---|---|---:|---:|---:|---|
| S1 | ONE_WAY | 30 | 0 | 0 | 450 |
| S2 | ONE_WAY | 60 | 0 | 0 | 600 |
| S3 | ROUND_TRIP | 0 | 3 | 0 | 3000 |
| S4 | HOURLY | 0 | 0 | 3 | 800 |
| S5 | HOURLY | 0 | 0 | 5.5 | 1200 |
| S6 | OUTSTATION | 200 | 2 | 0 | 3000 |
| S7 | ONE_WAY | 0 | 0 | 0 | error INVALID_INPUT |
| S8 | SHUTTLE | 10 | 0 | 0 | error UNKNOWN_RIDE_TYPE |
