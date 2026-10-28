# Member 1 - raw model output for CH01 (design notes; the generated code is the patch)

Generated code (verbatim diff): Part2/changes/Change1/Change1.patch  (commits c9d7097 -> 6bdf74e)

## Design
Business requirement: deposit bonus and withdrawal limits must depend on the account type, and a checking account may go into overdraft.

## Pattern effects
- Strategy: Account Type Policy: **newly_introduced** - Replaces the baseline conditional that was rejected as a Strategy candidate (AccountService savings-bonus if).
- Transaction Script: Account Deposit and Withdrawal Script: **modified** - Still procedural, but its type-specific rules are delegated to the strategy.
- Service Layer: Banking Use-Case Service Layer: **modified** - New collaborator policyResolver.
- Dependency Injection: CDI Field Injection Wiring: **extended** - New bean AccountPolicyResolver and injection point.
- DAO, DTO, Controller, Exception Translation: **preserved** - No participant changed.

## Refactoring
- Smell: Conditional on a type code with a magic number: AccountService.depositToAccount tested account.getType() == CONTA_POUPANCA and added the literal 0.5; the withdrawal rule balance > amount was one hard-coded rule for every type, so adding the overdraft would have added more type conditionals in two methods.
- Technique: Replace Conditional with Polymorphism (Replace Type Code with Strategy): extract interface AccountPolicy, move each branch into SavingsAccountPolicy / CheckingAccountPolicy, select through AccountPolicyResolver; Replace Magic Number with Constant (DEPOSIT_BONUS, OVERDRAFT_LIMIT).

## Not verified
- Anything that needs the real Quarkus runtime or a database (HTTP wiring, JPA mapping, transaction rollback).
