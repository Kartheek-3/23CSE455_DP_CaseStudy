# Part 2 proposal — three evolution changes

The original baseline lacks Doctor, Pharmacy, Laboratory, Billing and Notification modules. The user has explicitly authorized adding Doctor, Pharmacy, Laboratory and Billing as new Part 2 features. Notification was also requested in the original task. This proposal groups them into three reviewable changes. The service-failure scenario is covered by explicit dependency failure handling; the external integration is a payment provider boundary with a local deterministic test double so the study does not depend on real credentials or a live payment account. No real payment will be taken.

## Change 1 — Extend appointment workflow with Doctor, Laboratory and Pharmacy services

Add a Doctor service and link appointments to a validated doctor. Add separate Laboratory and Pharmacy services for lab requests and medication orders, connected to patient/appointment IDs by API contracts rather than shared database tables. Register services with Eureka and expose them via Gateway. This provides a realistic evolution of the existing appointment/patient flow and demonstrates service discovery, gateway routing, repositories and synchronous service communication.

## Change 2 — Add Billing with external payment-provider integration and resilience

Add a Billing service that records invoices for appointments and clinical orders. Integrate through a `PaymentProvider` boundary to an external payment API, with a deterministic local fake for tests. Add timeout and circuit-breaker/fallback behavior and test provider success, timeout and unavailable states. Keep payment credentials out of source and report artifacts. This satisfies the external integration and service failure/resilience scenarios.

## Change 3 — Add Notification service and workflow notifications

Add a Notification service and notify users on appointment confirmation/cancellation and billing/payment outcomes. Begin with an injectable email/notification gateway abstraction and local recording fake; keep transport credentials external. Make delivery failure non-fatal to the clinical transaction, with a bounded retry or failure record and tests.

## Implementation and evidence plan

Each change will have a before/after architecture, source diff, focused unit/integration checks, failure cases, pattern inventory delta, refactoring notes and agreed simple metrics. Keep each change independently reviewable. Before coding, confirm this grouping and the use of local external-service fakes; adjust if the instructor requires a different provider or notification channel.
