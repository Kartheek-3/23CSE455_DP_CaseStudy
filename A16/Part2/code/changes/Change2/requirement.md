# Change2: Add Billing with external payment-provider integration and resilience

## Requirement

Add invoices and payment flow behind PaymentProvider. The default deterministic local provider avoids real charges; activate external-payments profile with PAYMENTS_API_URL and PAYMENTS_API_TOKEN to call an external HTTP provider. Apply timeout, circuit breaker, and PAYMENT_RETRY_REQUIRED fallback.

## Acceptance evidence

- API behavior and persistence are implemented in `../../evolved/`.
- Unit/build results are recorded in `../../../../data/test_result/Change2/` after verification.
- The source-version pattern rows and count deltas are recorded once in the part-level `pattern_evaluation.csv` and `Pattern_count.csv`.
