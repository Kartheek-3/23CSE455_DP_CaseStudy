# Verification - K_Harish_output_01.md (CH03 ride types + dynamic pricing, ChatGPT free tier, 2026-10-11)

Topic owner: K Harish. Run and checked from Dilip Kumar Reddy's session (Claude Code drove the browser).
Method: each claim compared with the baseline source (`Part1/code`), our CH03 implementation
(`Part2/changes/CH03`, `Part2/code/src/domain/pricing`) and its tests (`tests/pricing.test.ts`, 41/41 at commit a12c878).

| Claim | Verdict | Evidence |
|---|---|---|
| if/else per ride type in `FareCalculatorService.ts:17-36` violates Open/Closed | correct | same smell we refactored (Replace Conditional with Polymorphism) |
| Hard-coded rates (`:8-9`) and duplicated Rs 10/km in `UpdateBookingstatus.ts:50-53` | correct | we replaced the duplicate with the strategy's `extraKmRate` |
| Fare computed before driver discovery (`BookDriver.ts:52-57`), so supply-based pricing is impossible | correct | our CH03 moved pricing after matching and passes `availableDrivers` |
| `console.log(params)` at `:19` | correct | line 19 |
| `!estimatedKm` lets negative/NaN distances through | cannot confirm as a defect | true for the excerpt, but `BookingRequestDTO.ts:14,92` already enforce `z.coerce.number().nonnegative()`, which the prompt did not include |
| Enum strings `ONE_RIDE` / `RANGE_OF_DATES` differ from member names | correct (style) | `Booking.ts:16-19`; we kept the stored values, as ChatGPT also advises |
| Strategy with `RideFareStrategy` + four concrete strategies, `FareCalculatorService` as context | correct | matches our `FareStrategy`, `OneWayFare`, `RoundTripFare`, `HourlyFare`, `OutstationFare`, context `FareCalculatorService` |
| Surcharges as a "composable pricing-rule pipeline" (`PricingRule[]` reduced in order) | correct alternative | we used Decorator (`PeakHourSurcharge(LowSupplySurcharge(...))`); both stack multiplicatively to x1.5, as ChatGPT states. Its pipeline is not named as a GoF pattern |
| Effect table: Booking extended, `IFareCalculatorService` modified, calculator replaced internally, DI extended, layering preserved | mostly correct | matches our `patterns_evolution.csv`; it describes components rather than pattern instances, so Repository/Adapter/Observer effects are not discussed |
| HOURLY = `max(hours, 4) * 200` | partial | no rounding of part hours (5.5 h -> Rs 1100); we bill per started hour (S5: 1200) |
| Rule outputs not rounded (e.g. 450 x 1.25 = 562.5) | design gap | our decorators round to whole rupees |

Overall evaluation: **partial** - the smells and the Strategy design agree with our implementation; one "defect" is already
handled by request validation outside the excerpt, and the hourly rounding differs.

Reviewer signature/date (K Harish): ______________________________
