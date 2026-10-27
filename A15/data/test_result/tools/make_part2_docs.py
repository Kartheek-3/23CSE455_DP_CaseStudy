import json, subprocess, csv, re, os
W, A = "/home/claude/work", "/home/claude/A1"
P2 = A + "/Part2"
met = json.load(open(W + "/logs/metrics.json"))
com = json.load(open(W + "/logs/commits.json"))

def cls_metrics(tag, fname):
    d = "%s/snaps/%s/src/main/java" % (W, tag)
    out = subprocess.run(["python3","-m","lizard","-l","java","--csv",d],capture_output=True,text=True).stdout.splitlines()
    rows = [r for r in csv.reader(out) if r[6].endswith("/" + fname)]
    return (sum(int(r[0]) for r in rows), max(int(r[1]) for r in rows)) if rows else (0, 0)
def names(a, b):
    return subprocess.run("cd %s/app && git diff --name-status %s %s" % (W, a, b), shell=True, capture_output=True, text=True).stdout.strip()
prevtag = {1: "baseline", 2: "change1", 3: "change2"}
cur = {1: "change1", 2: "change2", 3: "change3"}
prevc = {1: "c0", 2: "change1", 3: "change2"}
def mrow(tag, key):
    m = met[tag]
    an, ac = cls_metrics(tag, "AccountService.java")
    return m, an, ac

DOC = {
1: dict(title="CH01 - Account-type policies (overdraft for checking, exact-balance withdrawal)",
 req="""Business requirement: deposit bonus and withdrawal limits must depend on the account type, and a checking account may go into overdraft.
- Savings (CONTA_POUPANCA): deposits still receive the 0.5 bonus; withdrawal allowed only while amount <= balance (the original code rejected a withdrawal of exactly the balance - this boundary is changed on purpose).
- Checking (CONTA_CORRENTE): no bonus; withdrawal allowed while balance - amount >= -500.00 (overdraft limit).
- Amounts <= 0 are still rejected with HTTP 400; unknown accounts still 404.""",
 ac=[("AC1","Checking with balance 100: withdraw 600 succeeds, balance becomes -500","Change1PolicyTest.ac1CheckingMayOverdrawUpToTheLimit"),
     ("AC2","Checking with balance 100: withdraw 600.01 -> 400, balance unchanged","Change1PolicyTest.ac2CheckingCannotOverdrawBeyondTheLimit"),
     ("AC3","Savings with balance 100: withdraw 100.01 -> 400, balance unchanged","Change1PolicyTest.ac3SavingsCannotOverdraw"),
     ("AC4","Savings with balance 100: withdraw 100 succeeds, balance 0","Change1PolicyTest.ac4SavingsMayWithdrawExactlyTheBalance"),
     ("AC5","Deposit of 5 gives +5.5 on savings and +5 on checking","Change1PolicyTest.ac5SavingsDepositBonusIsPreservedAndCheckingHasNone"),
     ("AC6","Withdrawal of 0 or negative -> 400 for both types","Change1PolicyTest.ac6NonPositiveWithdrawalStillRejectedForBothTypes"),
     ("AC7","Resolver returns the matching strategy; missing type -> 400; strategies interchangeable","Change1PolicyTest.resolverReturnsTheMatchingStrategyAndRejectsMissingType / policiesAreInterchangeableBehindTheInterface")],
 effects=[("Strategy: Account Type Policy","newly_introduced","Replaces the baseline conditional that was rejected as a Strategy candidate (AccountService savings-bonus if)."),
          ("Transaction Script: Account Deposit and Withdrawal Script","modified","Still procedural, but its type-specific rules are delegated to the strategy."),
          ("Service Layer: Banking Use-Case Service Layer","modified","New collaborator policyResolver."),
          ("Dependency Injection: CDI Field Injection Wiring","extended","New bean AccountPolicyResolver and injection point."),
          ("DAO, DTO, Controller, Exception Translation","preserved","No participant changed.")],
 smell="Conditional on a type code with a magic number: AccountService.depositToAccount tested account.getType() == CONTA_POUPANCA and added the literal 0.5; the withdrawal rule balance > amount was one hard-coded rule for every type, so adding the overdraft would have added more type conditionals in two methods.",
 tech="Replace Conditional with Polymorphism (Replace Type Code with Strategy): extract interface AccountPolicy, move each branch into SavingsAccountPolicy / CheckingAccountPolicy, select through AccountPolicyResolver; Replace Magic Number with Constant (DEPOSIT_BONUS, OVERDRAFT_LIMIT).",
 pres="Tests: 14 of the 15 original characterization tests pass unchanged. The one that pinned the old boundary (withdrawOfExactlyTheBalanceIsRejectedInBaseline) was changed on purpose to withdrawOfExactlyTheBalanceIsAllowedAfterCh01 because AC4 changes that behaviour; savings deposit bonus, error codes and messages are covered by unchanged tests."),
2: dict(title="CH02 - Transaction events: audit log and high-value alert observers",
 req="""Business requirement: every completed deposit or withdrawal must be recorded in an audit trail that can be read per account, and transactions of 10,000.00 or more must raise an alert, without the account service depending on the audit/alert code.
- AccountService publishes a TransactionEvent (account id, kind DEPOSIT/WITHDRAWAL, amount, balance after, timestamp) after the balance is saved.
- TransactionAuditLog stores events per account in order; GET /api/v1/accounts/{id}/audit returns them (404 for an unknown account).
- HighValueAlertObserver records and logs events with amount >= 10,000.00.
- Rejected operations (400/404) publish nothing.""",
 ac=[("AC1","Deposit of 25 on balance 100 publishes one DEPOSIT event with balanceAfter 125","Change2ObserverTest.ac1DepositPublishesOneEventWithTheResultingBalance"),
     ("AC2","Withdrawal publishes a WITHDRAWAL event","Change2ObserverTest.ac2WithdrawalPublishesAWithdrawalEvent"),
     ("AC3","Failed deposit/withdraw/unknown account publish nothing","Change2ObserverTest.ac3FailedOperationsPublishNothing"),
     ("AC4","Audit trail is per account and chronological","Change2ObserverTest.ac4AuditTrailIsPerAccountAndChronological"),
     ("AC5","Audit endpoint returns 200 + trail; 404 for an unknown account","Change2ObserverTest.ac5AuditEndpointReturnsTheTrailAndNotFoundForUnknownAccount"),
     ("AC6","Alert raised at exactly 10000.00, not at 9999.99","Change2ObserverTest.ac6HighValueTransactionsRaiseAnAlertAtTheThreshold"),
     ("AC7","AccountService holds no reference to a concrete observer","Change2ObserverTest.ac7AccountServiceKnowsNoConcreteObserver")],
 effects=[("Observer: Transaction Audit and Alert Notification","newly_introduced","New event type, two concrete observers; AccountService is the subject (CDI Event)."),
          ("Transaction Script","modified","deposit/withdraw also fire an event."),
          ("Service Layer","extended","New use case getAuditTrail."),
          ("Controller","extended","New system operation listAudit."),
          ("Dependency Injection","extended","Event<TransactionEvent>, TransactionAuditLog injected; two observer beans."),
          ("Strategy, DAO, DTO, Exception Translation","preserved","No participant changed.")],
 smell="Preventive: audit and alerting would otherwise be written as direct calls inside depositToAccount/withdraw, giving the service a new dependency (and a new edit) for every reaction (Divergent Change / Shotgun Surgery risk). No existing smell was removed in this change.",
 tech="Replace direct calls with publish/subscribe (introduce Observer through CDI events); the event is an immutable record.",
 pres="Tests: all 23 tests of the previous version pass unchanged (30/30 in total); the only edits to existing test code are two additional beans registered in TestApp. Balances and HTTP statuses of deposit/withdraw are unchanged."),
3: dict(title="CH03 - Atomic funds transfer; business rules move into Account",
 req="""Business requirement: customers can transfer money between two accounts atomically.
- POST /api/v1/accounts/transfer with fromAccountId, toAccountId, amount.
- The source account applies its own policy (overdraft for checking, none for savings); the target is credited without the savings deposit bonus.
- Same account, missing ids and amount <= 0 -> 400; unknown account -> 404; insufficient funds -> 400. In every failure neither account changes.
- The operation is one transaction (service-level @Transactional) and publishes TRANSFER_OUT and TRANSFER_IN events.
Refactoring that enables it: the deposit/withdraw rules move from AccountService into the Account entity so that deposit, withdraw and transfer share one implementation.""",
 ac=[("AC1","Transfer 30 from checking(100) to savings(50): 70 and 80 (no bonus)","Change3TransferTest.ac1TransferMovesTheAmountWithoutDepositBonus"),
     ("AC2","Insufficient funds on savings source -> 400, both balances unchanged","Change3TransferTest.ac2InsufficientFundsChangesNeitherAccount"),
     ("AC3","Checking source may use its overdraft (-500 / 650)","Change3TransferTest.ac3CheckingSourceMayUseItsOverdraft"),
     ("AC4","Same account, amount <= 0, missing id -> 400, nothing changes","Change3TransferTest.ac4SameAccountAndNonPositiveAmountAndMissingIdsAreBadRequests"),
     ("AC5","Unknown source or target -> 404, nothing changes","Change3TransferTest.ac5UnknownAccountIsNotFoundAndNothingChanges"),
     ("AC6","TRANSFER_OUT and TRANSFER_IN events with the new balances","Change3TransferTest.ac6TransferPublishesOutAndInEvents"),
     ("AC7","Account enforces deposit/withdraw/credit rules by itself","Change3TransferTest.ac7AccountEnforcesItsOwnRulesWithoutTheService")],
 effects=[("Transaction Script: Account Deposit and Withdrawal Script","replaced","Rules moved into Account; remaining service methods are plain orchestration/CRUD."),
          ("Domain Model: Account Balance Domain Model","newly_introduced","Replaces the script; Account.deposit/withdraw/credit hold the rules."),
          ("Strategy","modified","Context moves from AccountService to Account."),
          ("Observer","modified","Publishing centralised in AccountService.publish; new transfer event kinds."),
          ("Service Layer","modified","New transfer use case; deposit/withdraw/transfer are service-level transactions."),
          ("DTO","extended","TransferDTO."),("Controller","extended","transfer operation."),
          ("Exception Translation","extended","Account and transfer raise BadRequestException; loadAccount raises NotFoundException."),
          ("DAO, Dependency Injection","preserved","No participant changed.")],
 smell="Anemic Domain Model / Feature Envy: AccountService read and wrote Account.balance and applied all rules while Account only had accessors; the deposit and withdraw procedures also duplicated the load-validate-save-publish shape, and contained an unreachable else-branch (AccountDAO.findById never returns an empty Optional - it throws NotFoundException - so `optionalAccount != null && isPresent()` was always true).",
 tech="Move Method (rules to Account), Extract Method (loadAccount, publish), Remove Dead Code / Replace Optional-null checks with orElseThrow.",
 pres="Tests: all 30 tests of the previous version pass unchanged (37/37 in total) - same balances, same statuses, same messages for deposit and withdraw. Not covered by any test: rollback of a failed transfer inside a real database transaction (requires Quarkus + a database; see README)."),
}

hdr = "Quarkus Maven tests were NOT run (Maven Central is blocked from the working environment); tests ran in the sandbox harness described in README."
for n in (1, 2, 3):
    d = DOC[n]; a_tag = prevtag[n]; b_tag = cur[n]
    mb, anb, acb = mrow(a_tag, "a"); ma, ana, aca = mrow(b_tag, "b")
    bt = "not_run in sandbox (stale GreetingResourceTest targets a non-existent /hello endpoint - by inspection it would fail under Maven); 15/15 after adding characterization tests on identical production code" if n == 1 else met[a_tag]["tests"] + " passed"
    lines = ["# %s" % d["title"], "", "## Requirement", d["req"], "", "## Acceptance criteria and the tests that check them", "| ID | Observable expected result | Test |", "|---|---|---|"]
    lines += ["| %s | %s | %s |" % t for t in d["ac"]]
    lines += ["", "## Before and after", "- before: commit `%s` (%s)" % (com[str(n)][0], "baseline production code + characterization tests" if n == 1 else "after Change%d" % (n - 1)),
              "- after: commit `%s`" % com[str(n)][1],
              "- patch: `Part2/changes/Change%d/Change%d.patch`" % (n, n),
              "- changed paths (git diff --name-status):", "```", names(prevc[n], b_tag), "```", "",
              "## Implementation and tests", "- Run (sandbox harness): `bash data/test_result/harness/run_tests.sh <app-dir> <out-dir> <test classes>`",
              "- Actual result: **%s** passed - log `Part2/changes/Change%d/test_result.txt`" % (met[b_tag]["tests"], n), "- " + hdr, "",
              "## Pattern effects", "| Instance | Effect | Reason |", "|---|---|---|"]
    lines += ["| %s | %s | %s |" % e for e in d["effects"]]
    lines += ["", "## Refactoring", "- Smell: " + d["smell"], "- Technique: " + d["tech"], "- Behaviour preservation: " + d["pres"], "- Diff: `Part2/changes/Change%d/Change%d.patch`" % (n, n), "",
              "## Before/after metrics (same scope and tool: lizard, `src/main/java`, Java; blank lines and comments excluded)",
              "| Measure | Before | After |", "|---|---|---|",
              "| Production NLOC (all files) | %s | %s |" % (mb["total_nloc"], ma["total_nloc"]),
              "| Production files | %s | %s |" % (mb["files"], ma["files"]),
              "| Functions | %s | %s |" % (mb["funcs"], ma["funcs"]),
              "| Max function cyclomatic complexity | %s | %s |" % (mb["max_ccn"], ma["max_ccn"]),
              "| AccountService NLOC / max CCN | %s / %s | %s / %s |" % (anb, acb, ana, aca),
              "| Test NLOC | %s | %s |" % (mb["test_nloc"] if n > 1 else "21 (stale template tests, not runnable)", ma["test_nloc"]),
              "| Tests passed | %s | %s |" % (bt, met[b_tag]["tests"]),
              "", "More or fewer lines alone do not prove a better design; see the report discussion."]
    open("%s/changes/Change%d/requirement.md" % (P2, n), "w", encoding="utf-8").write("\n".join(lines) + "\n")
print("ok")
