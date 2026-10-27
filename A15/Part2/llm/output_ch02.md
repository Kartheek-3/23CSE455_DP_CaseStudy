# Member 2 - raw model output for CH02 (design notes; the generated code is the patch)

Generated code (verbatim diff): Part2/changes/Change2/Change2.patch  (commits 6bdf74e -> c755d20)

## Design
Business requirement: every completed deposit or withdrawal must be recorded in an audit trail that can be read per account, and transactions of 10,000.00 or more must raise an alert, without the account service depending on the audit/alert code.

## Pattern effects
- Observer: Transaction Audit and Alert Notification: **newly_introduced** - New event type, two concrete observers; AccountService is the subject (CDI Event).
- Transaction Script: **modified** - deposit/withdraw also fire an event.
- Service Layer: **extended** - New use case getAuditTrail.
- Controller: **extended** - New system operation listAudit.
- Dependency Injection: **extended** - Event<TransactionEvent>, TransactionAuditLog injected; two observer beans.
- Strategy, DAO, DTO, Exception Translation: **preserved** - No participant changed.

## Refactoring
- Smell: Preventive: audit and alerting would otherwise be written as direct calls inside depositToAccount/withdraw, giving the service a new dependency (and a new edit) for every reaction (Divergent Change / Shotgun Surgery risk). No existing smell was removed in this change.
- Technique: Replace direct calls with publish/subscribe (introduce Observer through CDI events); the event is an immutable record.

## Not verified
- Anything that needs the real Quarkus runtime or a database (HTTP wiring, JPA mapping, transaction rollback).
