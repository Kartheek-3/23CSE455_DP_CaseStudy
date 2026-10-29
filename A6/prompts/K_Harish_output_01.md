<!--
Raw LLM output.
Tool: ChatGPT (chatgpt.com, logged-out free tier; the interface shows only "ChatGPT", no model name). Date: 2026-10-11.
Prompt: prompts/K_Harish_prompt_01.txt, pasted unchanged into a new chat.
Run by: Dilip Kumar Reddy's session - the browser was driven by Claude Code on the team's behalf because members
were unavailable. K Harish is the owner of the analysed topic (CH03), not the person who typed the prompt.
Capture: text of the rendered answer converted to Markdown; code-fence language labels re-attached; bold/italic
markers inside paragraphs may be missing. Content otherwise unchanged.
-->

## 1. Code smells and defects that make CH03 risky

| Location | Smell / defect | Impact on CH03 |
| --- | --- | --- |
| `src/domain/models/Booking.ts:16–19` | Enum values are misleading: `ONE_WAY = "ONE_RIDE"` and `ROUND_TRIP = "RANGE_OF_DATES"`. | API and persistence contracts may be confusing or incompatible when adding ride types. |
| `src/application/services/FareCalculatorService.ts:4–11` | Fare input is an inline parameter object with optional fields and no ride-specific validation. | Invalid combinations of distance, dates and duration can reach pricing logic. |
| `src/infrastructure/services/FareCalculatorService.ts:8–9` | Hard-coded rates and minimum fare. | Pricing changes require source edits and redeployment. |
| `src/infrastructure/services/FareCalculatorService.ts:17–36` | Conditional branches implement every ride type in one class. | Violates the Open/Closed Principle: adding HOURLY or OUTSTATION requires modifying existing fare code. |
| `src/infrastructure/services/FareCalculatorService.ts:21–24` | `!estimatedKm` rejects zero but does not reject negative values, `NaN`, or infinity. | Invalid distance can produce invalid fares; zero-distance handling is implicit. |
| `src/infrastructure/services/FareCalculatorService.ts:28–33` | Inclusive day count uses `Math.ceil` without validating date order or timezone semantics. | Invalid ranges and boundary cases can be mispriced. |
| `src/infrastructure/services/FareCalculatorService.ts:19` | Logs the complete pricing parameters. | Noisy production logs and possible exposure of operational data. |
| `src/application/use_cases/User/BookDriver.ts:52–57` | Fare calculation occurs before driver discovery and does not receive driver availability. | Demand-based pricing cannot be calculated accurately without restructuring dependencies or adding a pricing context. |
| `src/application/use_cases/User/BookDriver.ts:61–99` | Driver matching is embedded in the booking use case; the candidate list is filtered using a separate road-distance threshold. | Pricing and matching become coupled if availability logic is added directly here. The nearby-driver count must have a defined geographic scope. |
| `src/application/use_cases/Driver/UpdateBookingstatus.ts:43–54` | Final fare independently hard-codes `10` Rs/km and adds it to the estimated fare. | The final fare ignores ride type, minimums, hourly/day rates, surcharges and possible double charging. |

Additional defects to address: use an explicit `BookingType` validator, validate positive finite distances and chronological dates, calculate time-dependent pricing in `Asia/Kolkata`, and define whether the 20% scarcity surcharge stacks multiplicatively or additively with the peak surcharge.

## 2. Design patterns to introduce

Use Strategy + a composable Pricing Rule pipeline, supported by a registry and dependency injection.

### Pattern A — Strategy: base fare calculation

Each ride type owns its base-fare formula. The calculator selects a strategy instead of containing `if`/`else` branches.

| Participant role | Class / interface |
| --- | --- |
| Strategy | `RideFareStrategy` |
| Concrete strategy | `OneWayFareStrategy` |
| Concrete strategy | `RoundTripFareStrategy` |
| Concrete strategy | `HourlyFareStrategy` |
| Concrete strategy | `OutstationFareStrategy` |
| Context / facade | `FareCalculatorService` |
| Strategy registry | `FareStrategyRegistry` |

Base fare formulas:

- `ONE_WAY`: `max(estimatedKm × 10, 450)`
- `ROUND_TRIP`: inclusive billable days × ₹1,000
- `HOURLY`: `max(hours, 4) × ₹200`
- `OUTSTATION`: `estimatedKm × 12 + billableDays × ₹300`

Define billable-day rounding explicitly for OUTSTATION, and require an end time or duration for HOURLY.

### Pattern B — Composable Pricing Rules

Each rule independently decides whether it applies and adjusts the current fare. The pricing service applies registered rules in sequence, so adding a rule does not require editing existing strategies or rules.

| Participant role | Class / interface |
| --- | --- |
| Rule contract | `PricingRule` |
| Concrete rule | `PeakHoursPricingRule` |
| Concrete rule | `DriverScarcityPricingRule` |
| Rule executor | `PricingRuleEngine` |
| Pricing context | `FareContext` |
| Composition root | `DependencyContainer` / application DI registration |

Rule behavior:

- `PeakHoursPricingRule`: multiply by `1.25` when the ride starts from 08:00–10:59 or 17:00–20:59 in `Asia/Kolkata`.
- `DriverScarcityPricingRule`: multiply by `1.20` when fewer than three qualifying nearby drivers are available.

The rules compose multiplicatively when both apply, yielding a `1.50×` multiplier. If the business instead intends a combined additive 45% surcharge, the rule contract should reflect that explicitly.

Extensibility boundary: register new strategies and rules through DI or configuration. `FareCalculatorService` and the existing strategies remain unchanged when a new strategy or rule is introduced. The application must also supply a consistent availability snapshot to pricing.

## 3. Effect on existing patterns

| Existing pattern / component | Effect | Reason |
| --- | --- | --- |
| Domain model `Booking` | Extended | Add ride types and the required ride-specific data; preserve existing persisted enum strings unless performing a migration. |
| `IFareCalculatorService` | Modified | Accept a typed `FareContext`, including duration and nearby-driver count. |
| `FareCalculatorService` | Replaced internally | Delegate base fares to registered strategies and adjustments to the rule engine; preserve its public facade where practical. |
| `BookDriver` use case | Modified | Obtain a defined nearby-driver count and pass it into pricing without embedding pricing formulas in the use case. |
| Driver matching / repository | Preserved and extended | Reuse matching logic, exposing a count of qualifying drivers through an appropriate application service. |
| `UpdateBookingstatus` | Modified | Use the same pricing policy for final fare reconciliation rather than hard-coded ₹10/km arithmetic. |
| `tsyringe` dependency injection | Extended | Register strategies and rules through tokens or a registry factory in the composition root. |
| Existing domain/application/infrastructure separation | Preserved | Keep fare policies independent of MongoDB, Socket.IO, Redis, Stripe and Google Maps implementations. |
| Existing `ONE_WAY` and `ROUND_TRIP` policies | Preserved | Move their formulas into concrete strategies and retain their current intended rates and minimums. |

No existing pricing rule needs to be removed. The monolithic conditional implementation is removed, while the service's responsibility as the pricing entry point is preserved.

## 4. Key TypeScript changes

The following illustrates the new and changed parts; unrelated booking and infrastructure code is omitted.

### A. Extend the domain model

`src/domain/models/Booking.ts`

```ts
export enum BookingType {
  ONE_WAY = "ONE_RIDE",           // preserve stored value
  ROUND_TRIP = "RANGE_OF_DATES", // preserve stored value
  HOURLY = "HOURLY",
  OUTSTATION = "OUTSTATION",
}
```

Preserving the existing string values avoids unintentionally breaking persisted bookings and clients that use those values.

### B. Define a shared pricing context and strategy contract

`src/application/services/RideFareStrategy.ts`

```ts
import { BookingType } from "../../domain/models/Booking";

export interface FareContext {
  bookingType: BookingType;
  startDate: Date;
  endDate?: Date;
  estimatedKm?: number;
  durationHours?: number;
  nearbyDriverCount: number;
}

export interface RideFareStrategy {
  readonly bookingType: BookingType;
  calculateBaseFare(context: FareContext): number;
}
```

### C. Implement concrete strategies

`src/infrastructure/services/fare/OneWayFareStrategy.ts`

```ts
@injectable()
export class OneWayFareStrategy implements RideFareStrategy {
  readonly bookingType = BookingType.ONE_WAY;

  calculateBaseFare(context: FareContext): number {
    const km = context.estimatedKm;

    if (km == null || !Number.isFinite(km) || km < 0) {
      throw new Error("A valid estimated distance is required");
    }

    return Math.max(km * 10, 450);
  }
}
```

`RoundTripFareStrategy` retains the current inclusive-day formula, with added validation for chronological dates.

`HourlyFareStrategy`:

```ts
calculateBaseFare(context: FareContext): number {
  const hours = context.durationHours;

  if (hours == null || !Number.isFinite(hours) || hours <= 0) {
    throw new Error("A valid duration is required");
  }

  return Math.max(hours, 4) * 200;
}
```

`OutstationFareStrategy`:

```ts
calculateBaseFare(context: FareContext): number {
  const km = context.estimatedKm;

  if (km == null || !Number.isFinite(km) || km < 0) {
    throw new Error("A valid estimated distance is required");
  }

  const days = getBillableDays(context.startDate, context.endDate);
  return km * 12 + days * 300;
}
```

`getBillableDays` should implement the agreed day-count policy and reject invalid date ranges.

### D. Add independent pricing rules

`src/application/services/PricingRule.ts`

```ts
export interface PricingRule {
  apply(fare: number, context: FareContext): number;
}
```

`PeakHoursPricingRule`:

```ts
@injectable()
export class PeakHoursPricingRule implements PricingRule {
  apply(fare: number, context: FareContext): number {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(context.startDate);

    const hour = Number(parts.find(p => p.type === "hour")!.value);
    const minute = Number(parts.find(p => p.type === "minute")!.value);
    const time = hour * 60 + minute;

    const peak =
      (time >= 480 && time < 660) ||
      (time >= 1020 && time < 1260);

    return peak ? fare * 1.25 : fare;
  }
}
```

`DriverScarcityPricingRule`:

```ts
@injectable()
export class DriverScarcityPricingRule implements PricingRule {
  apply(fare: number, context: FareContext): number {
    return context.nearbyDriverCount < 3
      ? fare * 1.20
      : fare;
  }
}
```

### E. Delegate through the pricing service

`src/infrastructure/services/FareCalculatorService.ts` — replacement structure:

```ts
@injectable()
export class FareCalculatorService
  implements IFareCalculatorService {

  constructor(
    @inject("FareStrategies")
    private readonly strategies: RideFareStrategy[],
    @inject("PricingRules")
    private readonly rules: PricingRule[],
  ) {}

  calculate(context: FareContext): number {
    const strategy = this.strategies.find(
      s => s.bookingType === context.bookingType
    );

    if (!strategy) {
      throw new Error("Unsupported booking type");
    }

    return this.rules.reduce(
      (fare, rule) => rule.apply(fare, context),
      strategy.calculateBaseFare(context)
    );
  }
}
```

Update `IFareCalculatorService` to accept `FareContext`, and register the four strategies and two rules using the corresponding tokens in the application's DI composition root.

Finally, update `BookDriver` to supply the availability count and any required duration, and update `UpdateBookingstatus` to reconcile the final fare through the same pricing policy. Define whether final-distance adjustments replace the estimated distance or add to it; do not blindly add a second per-kilometre charge.

Acceptance criteria: existing fares remain unchanged when no surcharge applies; all four ride types validate their required inputs; both surcharges work independently and together; and adding another ride strategy or pricing rule requires registration, not modification of existing fare calculation code.
