# Member 3 - raw model output for CH03 (design notes; the generated code is the patch)

Generated code (verbatim diff): Part2/changes/Change3/Change3.patch  (commits c755d20 -> b8de930)

## Design
Business requirement: customers can transfer money between two accounts atomically.

## Pattern effects
- Transaction Script: Account Deposit and Withdrawal Script: **replaced** - Rules moved into Account; remaining service methods are plain orchestration/CRUD.
- Domain Model: Account Balance Domain Model: **newly_introduced** - Replaces the script; Account.deposit/withdraw/credit hold the rules.
- Strategy: **modified** - Context moves from AccountService to Account.
- Observer: **modified** - Publishing centralised in AccountService.publish; new transfer event kinds.
- Service Layer: **modified** - New transfer use case; deposit/withdraw/transfer are service-level transactions.
- DTO: **extended** - TransferDTO.
- Controller: **extended** - transfer operation.
- Exception Translation: **extended** - Account and transfer raise BadRequestException; loadAccount raises NotFoundException.
- DAO, Dependency Injection: **preserved** - No participant changed.

## Refactoring
- Smell: Anemic Domain Model / Feature Envy: AccountService read and wrote Account.balance and applied all rules while Account only had accessors; the deposit and withdraw procedures also duplicated the load-validate-save-publish shape, and contained an unreachable else-branch (AccountDAO.findById never returns an empty Optional - it throws NotFoundException - so `optionalAccount != null && isPresent()` was always true).
- Technique: Move Method (rules to Account), Extract Method (loadAccount, publish), Remove Dead Code / Replace Optional-null checks with orElseThrow.

## Not verified
- Anything that needs the real Quarkus runtime or a database (HTTP wiring, JPA mapping, transaction rollback).
