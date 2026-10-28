# CH03 - Atomic funds transfer; business rules move into Account

## Requirement
Business requirement: customers can transfer money between two accounts atomically.
- POST /api/v1/accounts/transfer with fromAccountId, toAccountId, amount.
- The source account applies its own policy (overdraft for checking, none for savings); the target is credited without the savings deposit bonus.
- Same account, missing ids and amount <= 0 -> 400; unknown account -> 404; insufficient funds -> 400. In every failure neither account changes.
- The operation is one transaction (service-level @Transactional) and publishes TRANSFER_OUT and TRANSFER_IN events.
Refactoring that enables it: the deposit/withdraw rules move from AccountService into the Account entity so that deposit, withdraw and transfer share one implementation.

## Acceptance criteria and the tests that check them
| ID | Observable expected result | Test |
|---|---|---|
| AC1 | Transfer 30 from checking(100) to savings(50): 70 and 80 (no bonus) | Change3TransferTest.ac1TransferMovesTheAmountWithoutDepositBonus |
| AC2 | Insufficient funds on savings source -> 400, both balances unchanged | Change3TransferTest.ac2InsufficientFundsChangesNeitherAccount |
| AC3 | Checking source may use its overdraft (-500 / 650) | Change3TransferTest.ac3CheckingSourceMayUseItsOverdraft |
| AC4 | Same account, amount <= 0, missing id -> 400, nothing changes | Change3TransferTest.ac4SameAccountAndNonPositiveAmountAndMissingIdsAreBadRequests |
| AC5 | Unknown source or target -> 404, nothing changes | Change3TransferTest.ac5UnknownAccountIsNotFoundAndNothingChanges |
| AC6 | TRANSFER_OUT and TRANSFER_IN events with the new balances | Change3TransferTest.ac6TransferPublishesOutAndInEvents |
| AC7 | Account enforces deposit/withdraw/credit rules by itself | Change3TransferTest.ac7AccountEnforcesItsOwnRulesWithoutTheService |

## Before and after
- before: commit `c755d20` (after Change2)
- after: commit `b8de930`
- patch: `Part2/changes/Change3/Change3.patch`
- changed paths (git diff --name-status):
```
M	src/main/java/br/com/michaelcruz/event/TransactionKind.java
A	src/main/java/br/com/michaelcruz/persistence/dto/TransferDTO.java
M	src/main/java/br/com/michaelcruz/persistence/model/Account.java
M	src/main/java/br/com/michaelcruz/rest/AccountController.java
M	src/main/java/br/com/michaelcruz/service/AccountService.java
A	src/test/java/br/com/michaelcruz/Change3TransferTest.java
```

## Implementation and tests
- Run (sandbox harness): `bash data/test_result/harness/run_tests.sh <app-dir> <out-dir> <test classes>`
- Actual result: **37/37** passed - log `Part2/changes/Change3/test_result.txt`
- Quarkus Maven tests were NOT run (Maven Central is blocked from the working environment); tests ran in the sandbox harness described in README.

## Pattern effects
| Instance | Effect | Reason |
|---|---|---|
| Transaction Script: Account Deposit and Withdrawal Script | replaced | Rules moved into Account; remaining service methods are plain orchestration/CRUD. |
| Domain Model: Account Balance Domain Model | newly_introduced | Replaces the script; Account.deposit/withdraw/credit hold the rules. |
| Strategy | modified | Context moves from AccountService to Account. |
| Observer | modified | Publishing centralised in AccountService.publish; new transfer event kinds. |
| Service Layer | modified | New transfer use case; deposit/withdraw/transfer are service-level transactions. |
| DTO | extended | TransferDTO. |
| Controller | extended | transfer operation. |
| Exception Translation | extended | Account and transfer raise BadRequestException; loadAccount raises NotFoundException. |
| DAO, Dependency Injection | preserved | No participant changed. |

## Refactoring
- Smell: Anemic Domain Model / Feature Envy: AccountService read and wrote Account.balance and applied all rules while Account only had accessors; the deposit and withdraw procedures also duplicated the load-validate-save-publish shape, and contained an unreachable else-branch (AccountDAO.findById never returns an empty Optional - it throws NotFoundException - so `optionalAccount != null && isPresent()` was always true).
- Technique: Move Method (rules to Account), Extract Method (loadAccount, publish), Remove Dead Code / Replace Optional-null checks with orElseThrow.
- Behaviour preservation: Tests: all 30 tests of the previous version pass unchanged (37/37 in total) - same balances, same statuses, same messages for deposit and withdraw. Not covered by any test: rollback of a failed transfer inside a real database transaction (requires Quarkus + a database; see README).
- Diff: `Part2/changes/Change3/Change3.patch`

## Before/after metrics (same scope and tool: lizard, `src/main/java`, Java; blank lines and comments excluded)
| Measure | Before | After |
|---|---|---|
| Production NLOC (all files) | 586 | 638 |
| Production files | 25 | 26 |
| Functions | 70 | 83 |
| Max function cyclomatic complexity | 5 | 5 |
| AccountService NLOC / max CCN | 45 / 5 | 50 / 5 |
| Test NLOC | 460 | 555 |
| Tests passed | 30/30 passed | 37/37 |

More or fewer lines alone do not prove a better design; see the report discussion.
