# Change 2 — Billing, external payment adapter and resilience

## Before / after

Before, there was no invoice service or payment integration. After, Billing stores invoices and delegates payment through the `PaymentProvider` interface. The local profile uses a deterministic simulated provider; the `external-payments` profile uses an HTTP adapter configured with environment variables. A 2-second connect timeout/5-second request timeout limits provider calls. A custom CLOSED/OPEN/HALF_OPEN breaker opens after two failures; Billing records `PAYMENT_RETRY_REQUIRED` as its fallback when the provider or circuit fails.

## Source areas

`billing-service/src/main/java/com/infosys/billingservice/` (Invoice entity/repository/controller/service; PaymentProvider, HttpPaymentProvider, SimulatedPaymentProvider, PaymentCircuitBreaker and configuration); `hospital-gateway/src/main/resources/application.properties`; root `pom.xml`.

## Verification

`BillingServiceTest` covers success and retry-required fallback; `HttpPaymentProviderTest` covers a local HTTP provider success and 503 response; `PaymentCircuitBreakerTest` covers opening, rejection while open and recovery after cooldown. Integration smoke creates an invoice and pays it through the local adapter. No real payment was sent.
