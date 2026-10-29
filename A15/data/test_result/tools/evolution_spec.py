import copy
from patterns_spec import *

POL = "domain/policy/"
APOL, SPOL, CPOL, RES = POL+"AccountPolicy.java", POL+"SavingsAccountPolicy.java", POL+"CheckingAccountPolicy.java", POL+"AccountPolicyResolver.java"
EVT, EKIND, AUD, ALR = "event/TransactionEvent.java", "event/TransactionKind.java", "event/TransactionAuditLog.java", "event/HighValueAlertObserver.java"
TDTO2 = "persistence/dto/TransferDTO.java"

def by(lst, key): return next(i for i in lst if i["key"] == key)
def add(i, *roles): i["roles"] = i["roles"] + list(roles)
def drop(i, *pairs): i["roles"] = [r for r in i["roles"] if (r[0], r[1]) not in set(pairs)]
def st(i, status, desc, evidence=None):
    i["status"], i["change"] = status, desc
    if evidence: i["evidence"] = evidence

STRAT = dict(key="STRAT", vrole="ConcreteStrategy", name="Account Type Policy", pattern="Strategy", ptype="Behavioral (GoF)",
  origin="application (student-added in CH01)", variant="ConcreteStrategy",
  problem="Deposit bonus and withdrawal limits differ per account type and must be selectable without conditionals in the caller.",
  roles=[("Strategy","AccountPolicy",APOL),("ConcreteStrategy","SavingsAccountPolicy",SPOL),("ConcreteStrategy","CheckingAccountPolicy",CPOL),
         ("Context","AccountService",AS),("ContextOperation","AccountService.depositToAccount",AS),("ContextOperation","AccountService.withdraw",AS),
         ("StrategySelector","AccountPolicyResolver",RES),("StrategySelector","AccountPolicyResolver.forType",RES)],
  evidence="AccountService.depositToAccount/withdraw obtain the policy from AccountPolicyResolver.forType(account.getType()) and call bonusOnDeposit/allowsWithdrawal on the AccountPolicy interface; SavingsAccountPolicy and CheckingAccountPolicy implement it with different rules (Change1PolicyTest ac1-ac6, policiesAreInterchangeableBehindTheInterface).")

OBS = dict(key="OBS", vrole="ConcreteObserver", name="Transaction Audit and Alert Notification", pattern="Observer", ptype="Behavioral (GoF, via CDI events)",
  origin="application (student-added in CH02) over framework CDI events", variant="ConcreteObserver",
  problem="Record and flag every completed deposit/withdrawal without the account service knowing who reacts.",
  roles=[("Subject","AccountService",AS),("SubjectChannel","AccountService.transactionEvents",AS),
         ("NotifyPoint","AccountService.depositToAccount",AS),("NotifyPoint","AccountService.withdraw",AS),
         ("Event","TransactionEvent",EVT),("Observer","(not separately declared - CDI @Observes TransactionEvent contract)",None),
         ("ConcreteObserver","TransactionAuditLog",AUD),("ConcreteObserver","HighValueAlertObserver",ALR),
         ("ObserverCallback","TransactionAuditLog.onTransaction",AUD),("ObserverCallback","HighValueAlertObserver.onTransaction",ALR)],
  external=["Observer"],
  evidence="AccountService fires TransactionEvent through Event<TransactionEvent>; TransactionAuditLog.onTransaction and HighValueAlertObserver.onTransaction are @Observes callbacks; both observers react to the same event (Change2ObserverTest ac1-ac7); the subject holds no reference to HighValueAlertObserver (ac7).")

DM = dict(key="DM", vrole="DomainObject", name="Account Balance Domain Model", pattern="Domain Model", ptype="Enterprise (Fowler PoEAA)",
  origin="application (student-added in CH03; replaces Account Deposit and Withdrawal Script)", variant="DomainObject",
  problem="Keep the balance rules together with the data they protect so that every use case (deposit, withdraw, transfer) shares them.",
  roles=[("DomainObject","Account",ACC),("DomainOperation","Account.deposit",ACC),("DomainOperation","Account.withdraw",ACC),("DomainOperation","Account.credit",ACC),
         ("PolicyCollaborator","AccountPolicy",APOL),
         ("Orchestrator","AccountService.depositToAccount",AS),("Orchestrator","AccountService.withdraw",AS),("Orchestrator","AccountService.transfer",AS)],
  evidence="Account.deposit/withdraw/credit validate and change the balance and consult the AccountPolicy; AccountService methods only load, call the domain method, persist and publish (Change3TransferTest ac7 exercises Account without the service).")

def make_versions():
    v0 = copy.deepcopy(V0)
    for i in v0: i["status"], i["change"] = "baseline", "Original code."
    # ---- after CH01
    v1 = copy.deepcopy(v0)
    for i in v1: st(i, "preserved", "No change in this version.")
    sl = by(v1,"SL"); add(sl, ("Collaborator","AccountService.policyResolver",AS)); st(sl,"modified","AccountService gains the injected collaborator policyResolver; use-case operations unchanged.")
    ts = by(v1,"TS"); st(ts,"modified","deposit/withdraw keep their procedural shape, but the inline savings-bonus branch and balance>amount test are replaced by calls to the AccountPolicy strategy.",
        "AccountService.depositToAccount/withdraw still load the account, check amount > 0, update and save in one procedure; the account-type rules now come from AccountPolicy (bonusOnDeposit, allowsWithdrawal). Account is still anemic.")
    di = by(v1,"DI"); add(di, ("InjectionPoint","AccountService.policyResolver",AS), ("ManagedBean","AccountPolicyResolver",RES)); st(di,"extended","New injection point AccountService.policyResolver and new managed bean AccountPolicyResolver.")
    v1.append(copy.deepcopy(STRAT)); st(by(v1,"STRAT"),"newly_introduced","Replaces the rejected baseline conditional (AccountService savings-bonus if): new AccountPolicy interface, Savings/Checking concrete strategies and AccountPolicyResolver; AccountService is the Context.")
    # ---- after CH02
    v2 = copy.deepcopy(v1)
    for i in v2: st(i, "preserved", "No change in this version.")
    sl = by(v2,"SL"); add(sl, ("Operation","AccountService.getAuditTrail",AS),("Collaborator","AccountService.transactionEvents",AS),("Collaborator","AccountService.auditLog",AS)); st(sl,"extended","New use case getAuditTrail and collaborators transactionEvents / auditLog.")
    ts = by(v2,"TS"); st(ts,"modified","depositToAccount/withdraw additionally fire a TransactionEvent after saving.")
    ct = by(v2,"CTRL"); add(ct, ("SystemOperation","AccountController.listAudit",AC)); st(ct,"extended","New system operation listAudit (GET /{accountId}/audit).")
    di = by(v2,"DI"); add(di, ("InjectionPoint","AccountService.transactionEvents",AS),("InjectionPoint","AccountService.auditLog",AS),("ManagedBean","TransactionAuditLog",AUD),("ManagedBean","HighValueAlertObserver",ALR)); st(di,"extended","Event<TransactionEvent> and TransactionAuditLog injected; two new observer beans.")
    v2.append(copy.deepcopy(OBS)); st(by(v2,"OBS"),"newly_introduced","New TransactionEvent, TransactionAuditLog and HighValueAlertObserver observe deposits/withdrawals published by AccountService.")
    # ---- after CH03
    v3 = copy.deepcopy(v2)
    for i in v3: st(i, "preserved", "No change in this version.")
    ts = by(v3,"TS"); st(ts,"replaced","Deposit/withdraw rules moved from AccountService into Account (see Account Balance Domain Model). The remaining AccountService.createAccount and UserService.createUser are plain delegation without business rules, so the Transaction Script pattern no longer applies.",
        "AccountService.depositToAccount/withdraw no longer contain rules (they load, call Account.deposit/withdraw, persist, publish). Replaced by the Account Balance Domain Model; excluded from the version totals.")
    sl = by(v3,"SL"); add(sl, ("Operation","AccountService.transfer",AS)); st(sl,"modified","New transfer use case; deposit/withdraw/transfer are now service-level @Transactional units and thin orchestrations.")
    dto = by(v3,"DTO"); add(dto, ("DataTransferObject","TransferDTO",TDTO2),("Consumer","AccountController.transfer",AC)); st(dto,"extended","TransferDTO added and consumed by AccountController.transfer.")
    ct = by(v3,"CTRL"); add(ct, ("SystemOperation","AccountController.transfer",AC)); st(ct,"extended","New system operation transfer (POST /transfer).")
    et = by(v3,"ET")
    drop(et, ("Raiser","AccountService.depositToAccount"),("Raiser","AccountService.withdraw"))
    add(et, ("Raiser","AccountService.transfer",AS),("Raiser","AccountService.loadAccount",AS),("Raiser","Account.deposit",ACC),("Raiser","Account.withdraw",ACC),("Raiser","Account.credit",ACC))
    st(et,"extended","Business-rule failures are now raised by Account and AccountService.transfer; NotFound by AccountService.loadAccount.")
    stt = by(v3,"STRAT")
    drop(stt, ("Context","AccountService"),("ContextOperation","AccountService.depositToAccount"),("ContextOperation","AccountService.withdraw"))
    add(stt, ("Context","Account",ACC),("ContextOperation","Account.deposit",ACC),("ContextOperation","Account.withdraw",ACC),
        ("ContextClient","AccountService.depositToAccount",AS),("ContextClient","AccountService.withdraw",AS),("ContextClient","AccountService.transfer",AS))
    st(stt,"modified","The Context moves from AccountService to Account: the strategy is passed into Account.deposit/withdraw; AccountService only selects it via the resolver.")
    ob = by(v3,"OBS")
    drop(ob, ("NotifyPoint","AccountService.depositToAccount"),("NotifyPoint","AccountService.withdraw"))
    add(ob, ("NotifyPoint","AccountService.publish",AS)); st(ob,"modified","Publishing centralised in AccountService.publish, also used by transfer (TRANSFER_OUT / TRANSFER_IN); new TransactionKind values.")
    v3.append(copy.deepcopy(DM)); st(by(v3,"DM"),"newly_introduced","Account gains deposit/withdraw/credit behaviour; replaces the Account Deposit and Withdrawal Script.")
    return [("Original code", v0), ("After Change1", v1), ("After Change2", v2), ("After Change3", v3)]
