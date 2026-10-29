# CH02 - Transaction events: audit log and high-value alert observers

## Requirement
Business requirement: every completed deposit or withdrawal must be recorded in an audit trail that can be read per account, and transactions of 10,000.00 or more must raise an alert, without the account service depending on the audit/alert code.
- AccountService publishes a TransactionEvent (account id, kind DEPOSIT/WITHDRAWAL, amount, balance after, timestamp) after the balance is saved.
- TransactionAuditLog stores events per account in order; GET /api/v1/accounts/{id}/audit returns them (404 for an unknown account).
- HighValueAlertObserver records and logs events with amount >= 10,000.00.
- Rejected operations (400/404) publish nothing.

## Acceptance criteria and the tests that check them
| ID | Observable expected result | Test |
|---|---|---|
| AC1 | Deposit of 25 on balance 100 publishes one DEPOSIT event with balanceAfter 125 | Change2ObserverTest.ac1DepositPublishesOneEventWithTheResultingBalance |
| AC2 | Withdrawal publishes a WITHDRAWAL event | Change2ObserverTest.ac2WithdrawalPublishesAWithdrawalEvent |
| AC3 | Failed deposit/withdraw/unknown account publish nothing | Change2ObserverTest.ac3FailedOperationsPublishNothing |
| AC4 | Audit trail is per account and chronological | Change2ObserverTest.ac4AuditTrailIsPerAccountAndChronological |
| AC5 | Audit endpoint returns 200 + trail; 404 for an unknown account | Change2ObserverTest.ac5AuditEndpointReturnsTheTrailAndNotFoundForUnknownAccount |
| AC6 | Alert raised at exactly 10000.00, not at 9999.99 | Change2ObserverTest.ac6HighValueTransactionsRaiseAnAlertAtTheThreshold |
| AC7 | AccountService holds no reference to a concrete observer | Change2ObserverTest.ac7AccountServiceKnowsNoConcreteObserver |

## Before and after
- before: commit `6bdf74e` (after Change1)
- after: commit `c755d20`
- patch: `Part2/changes/Change2/Change2.patch`
- changed paths (git diff --name-status):
```
A	src/main/java/br/com/michaelcruz/event/HighValueAlertObserver.java
A	src/main/java/br/com/michaelcruz/event/TransactionAuditLog.java
A	src/main/java/br/com/michaelcruz/event/TransactionEvent.java
A	src/main/java/br/com/michaelcruz/event/TransactionKind.java
M	src/main/java/br/com/michaelcruz/rest/AccountController.java
M	src/main/java/br/com/michaelcruz/service/AccountService.java
A	src/test/java/br/com/michaelcruz/Change2ObserverTest.java
M	src/test/java/br/com/michaelcruz/support/TestApp.java
```

## Implementation and tests
- Run (sandbox harness): `bash data/test_result/harness/run_tests.sh <app-dir> <out-dir> <test classes>`
- Actual result: **30/30** passed - log `Part2/changes/Change2/test_result.txt`
- Quarkus Maven tests were NOT run (Maven Central is blocked from the working environment); tests ran in the sandbox harness described in README.

## Pattern effects
| Instance | Effect | Reason |
|---|---|---|
| Observer: Transaction Audit and Alert Notification | newly_introduced | New event type, two concrete observers; AccountService is the subject (CDI Event). |
| Transaction Script | modified | deposit/withdraw also fire an event. |
| Service Layer | extended | New use case getAuditTrail. |
| Controller | extended | New system operation listAudit. |
| Dependency Injection | extended | Event<TransactionEvent>, TransactionAuditLog injected; two observer beans. |
| Strategy, DAO, DTO, Exception Translation | preserved | No participant changed. |

## Refactoring
- Smell: Preventive: audit and alerting would otherwise be written as direct calls inside depositToAccount/withdraw, giving the service a new dependency (and a new edit) for every reaction (Divergent Change / Shotgun Surgery risk). No existing smell was removed in this change.
- Technique: Replace direct calls with publish/subscribe (introduce Observer through CDI events); the event is an immutable record.
- Behaviour preservation: Tests: all 23 tests of the previous version pass unchanged (30/30 in total); the only edits to existing test code are two additional beans registered in TestApp. Balances and HTTP statuses of deposit/withdraw are unchanged.
- Diff: `Part2/changes/Change2/Change2.patch`

## Before/after metrics (same scope and tool: lizard, `src/main/java`, Java; blank lines and comments excluded)
| Measure | Before | After |
|---|---|---|
| Production NLOC (all files) | 508 | 586 |
| Production files | 21 | 25 |
| Functions | 64 | 70 |
| Max function cyclomatic complexity | 5 | 5 |
| AccountService NLOC / max CCN | 39 / 5 | 45 / 5 |
| Test NLOC | 362 | 460 |
| Tests passed | 23/23 passed | 30/30 |

More or fewer lines alone do not prove a better design; see the report discussion.
