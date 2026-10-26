# CH01 - Dynamic pricing

Acceptance criteria: base pricing returns the listed rent; peak months 4, 5, and 12 add 20%; occupancy >= 0.80 adds 10%; leases >= 12 months subtract 5%; combined rules are additive and results round to two decimals; invalid contexts fail.

Refactoring: Extract Strategy. `PricingStrategy` separates the stable quote workflow from volatile pricing rules. `PricingContext` replaces a growing parameter list. Evidence is in `dynamic_pricing.patch`, the evolved suite, and the four-language Strategy fixtures.

Integration: `AppServiceProvider` binds `PricingStrategy` to `DynamicPricing`, and `RentReceiptController` uses `PricingService` when dynamic pricing is requested. Commit: `7e9bd9ded113e91cca10e727a7eeff29c88d0ed8`.

Effect: one new Strategy instance, **Dynamic Rent Pricing**.
