# CH02: Bill payment and atomic internal posting

## Acceptance criteria

Authenticated payer selects an allowed configured biller. A valid request produces a debit and credit with one reference and TransactionType=BillPayment. Invalid ownership, absent/self destination, invalid amount/type and SQL failure must not leave partial changes.

## Pattern effect

Atomic internal payment is a new Service Layer instance. The legacy Transfer posting instance remains for other callers; its internal-controller client is removed.

## Refactoring

Extract Service and Replace Duplicated Orchestration: replace two separate CreateMoneyTransferAsync calls with one transaction-bound ExecuteAsync used by the original internal route and the new bill route.

## Tests

Successful Transfer and BillPayment cases, ownership, missing/self accounts, invalid precision/type/description, notification failure, and SQL trigger-induced rollback are covered.

Final-snapshot suite: 26/26 passed. Original suite: 129/129 before and 129/129 after. See `data/test_result/` from team root. Intermediate snapshot full test runs are not claimed.

Before: after_change1. After: after_change2. See exact `diff.patch` and SHA-256 `snapshot.json`; patches are ordered.
