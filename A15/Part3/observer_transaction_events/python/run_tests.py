import sys
from snippet import AccountService, AuditLog, EventPublisher, HighValueAlert, BadRequest


def execute(script):
    publisher, audit, alert = EventPublisher(), AuditLog(), HighValueAlert()
    publisher.subscribe(audit)
    publisher.subscribe(alert)
    svc, out = AccountService(publisher), ""
    for cmd in script.split(";"):
        t = cmd.split()
        try:
            if t[0] == "deposit":
                svc.deposit(int(t[1]), float(t[2]))
                out = "ok"
            elif t[0] == "withdraw":
                svc.withdraw(int(t[1]), float(t[2]))
                out = "ok"
            elif t[0] == "audit":
                out = audit.text(int(t[1]))
            else:
                out = alert.text()
        except BadRequest:
            out = "BAD_REQUEST"
    return out


def main(path):
    passed = total = 0
    for line in open(path, encoding="utf-8"):
        line = line.rstrip("\n")
        if not line.strip() or line.startswith("#"):
            continue
        script, expected = line.split(" => ", 1)
        total += 1
        got = execute(script)
        if got == expected:
            passed += 1
            print("PASS case%d" % total)
        else:
            print("FAIL case%d expected=%s got=%s" % (total, expected, got))
    print("RESULT passed=%d total=%d" % (passed, total))
    sys.exit(0 if passed == total else 1)


main(sys.argv[1])
