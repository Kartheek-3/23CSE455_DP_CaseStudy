# Dynamic-pricing output

`PricingStrategy` defines the algorithm. `BasePricing` and `DynamicPricing` implement it, while `PricingService` delegates to the injected strategy. `PricingContext` validates month, occupancy, and duration. `AppServiceProvider` binds the interface and `RentReceiptController` uses the service for dynamic receipt pricing. The same rules and fixtures are reused in the four-language Strategy implementations.
