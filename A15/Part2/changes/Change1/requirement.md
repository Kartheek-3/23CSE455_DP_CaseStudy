# CH01 - Account-type policies (overdraft for checking, exact-balance withdrawal)

## Requirement
Business requirement: deposit bonus and withdrawal limits must depend on the account type, and a checking account may go into overdraft.
- Savings (CONTA_POUPANCA): deposits still receive the 0.5 bonus; withdrawal allowed only while amount <= balance (the original code rejected a withdrawal of exactly the balance - this boundary is changed on purpose).
- Checking (CONTA_CORRENTE): no bonus; withdrawal allowed while balance - amount >= -500.00 (overdraft limit).
- Amounts <= 0 are still rejected with HTTP 400; unknown accounts still 404.

## Acceptance criteria and the tests that check them
| ID | Observable expected result | Test |
|---|---|---|
| AC1 | Checking with balance 100: withdraw 600 succeeds, balance becomes -500 | Change1PolicyTest.ac1CheckingMayOverdrawUpToTheLimit |
| AC2 | Checking with balance 100: withdraw 600.01 -> 400, balance unchanged | Change1PolicyTest.ac2CheckingCannotOverdrawBeyondTheLimit |
| AC3 | Savings with balance 100: withdraw 100.01 -> 400, balance unchanged | Change1PolicyTest.ac3SavingsCannotOverdraw |
| AC4 | Savings with balance 100: withdraw 100 succeeds, balance 0 | Change1PolicyTest.ac4SavingsMayWithdrawExactlyTheBalance |
| AC5 | Deposit of 5 gives +5.5 on savings and +5 on checking | Change1PolicyTest.ac5SavingsDepositBonusIsPreservedAndCheckingHasNone |
| AC6 | Withdrawal of 0 or negative -> 400 for both types | Change1PolicyTest.ac6NonPositiveWithdrawalStillRejectedForBothTypes |
| AC7 | Resolver returns the matching strategy; missing type -> 400; strategies interchangeable | Change1PolicyTest.resolverReturnsTheMatchingStrategyAndRejectsMissingType / policiesAreInterchangeableBehindTheInterface |

## Before and after
- before: commit `c9d7097` (baseline production code + characterization tests)
- after: commit `6bdf74e`
- patch: `Part2/changes/Change1/Change1.patch`
- changed paths (git diff --name-status):
```
A	src/main/java/br/com/michaelcruz/domain/policy/AccountPolicy.java
A	src/main/java/br/com/michaelcruz/domain/policy/AccountPolicyResolver.java
A	src/main/java/br/com/michaelcruz/domain/policy/CheckingAccountPolicy.java
A	src/main/java/br/com/michaelcruz/domain/policy/SavingsAccountPolicy.java
M	src/main/java/br/com/michaelcruz/service/AccountService.java
M	src/test/java/br/com/michaelcruz/BaselineBehaviourTest.java
A	src/test/java/br/com/michaelcruz/Change1PolicyTest.java
M	src/test/java/br/com/michaelcruz/support/TestApp.java
```

## Implementation and tests
- Run (sandbox harness): `bash data/test_result/harness/run_tests.sh <app-dir> <out-dir> <test classes>`
- Actual result: **23/23** passed - log `Part2/changes/Change1/test_result.txt`
- Quarkus Maven tests were NOT run (Maven Central is blocked from the working environment); tests ran in the sandbox harness described in README.

## Pattern effects
| Instance | Effect | Reason |
|---|---|---|
| Strategy: Account Type Policy | newly_introduced | Replaces the baseline conditional that was rejected as a Strategy candidate (AccountService savings-bonus if). |
| Transaction Script: Account Deposit and Withdrawal Script | modified | Still procedural, but its type-specific rules are delegated to the strategy. |
| Service Layer: Banking Use-Case Service Layer | modified | New collaborator policyResolver. |
| Dependency Injection: CDI Field Injection Wiring | extended | New bean AccountPolicyResolver and injection point. |
| DAO, DTO, Controller, Exception Translation | preserved | No participant changed. |

## Refactoring
- Smell: Conditional on a type code with a magic number: AccountService.depositToAccount tested account.getType() == CONTA_POUPANCA and added the literal 0.5; the withdrawal rule balance > amount was one hard-coded rule for every type, so adding the overdraft would have added more type conditionals in two methods.
- Technique: Replace Conditional with Polymorphism (Replace Type Code with Strategy): extract interface AccountPolicy, move each branch into SavingsAccountPolicy / CheckingAccountPolicy, select through AccountPolicyResolver; Replace Magic Number with Constant (DEPOSIT_BONUS, OVERDRAFT_LIMIT).
- Behaviour preservation: Tests: 14 of the 15 original characterization tests pass unchanged. The one that pinned the old boundary (withdrawOfExactlyTheBalanceIsRejectedInBaseline) was changed on purpose to withdrawOfExactlyTheBalanceIsAllowedAfterCh01 because AC4 changes that behaviour; savings deposit bonus, error codes and messages are covered by unchanged tests.
- Diff: `Part2/changes/Change1/Change1.patch`

## Before/after metrics (same scope and tool: lizard, `src/main/java`, Java; blank lines and comments excluded)
| Measure | Before | After |
|---|---|---|
| Production NLOC (all files) | 458 | 508 |
| Production files | 17 | 21 |
| Functions | 58 | 64 |
| Max function cyclomatic complexity | 5 | 5 |
| AccountService NLOC / max CCN | 41 / 5 | 39 / 5 |
| Test NLOC | 21 (stale template tests, not runnable) | 362 |
| Tests passed | not_run in sandbox (stale GreetingResourceTest targets a non-existent /hello endpoint - by inspection it would fail under Maven); 15/15 after adding characterization tests on identical production code | 23/23 |

More or fewer lines alone do not prove a better design; see the report discussion.
