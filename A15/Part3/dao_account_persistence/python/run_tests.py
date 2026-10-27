import sys
from snippet import AccountService, InMemoryAccountDao, NotFound


def execute(script):
    svc, out = AccountService(InMemoryAccountDao()), ""
    for cmd in script.split(";"):
        t = cmd.split()
        try:
            if t[0] == "save":
                out = str(svc.open(float(t[1])))
            elif t[0] == "find":
                out = "%.2f" % svc.balance_of(int(t[1]))
            else:
                out = ",".join("%.2f" % b for b in svc.balances()) or "-"
        except NotFound:
            out = "NOT_FOUND"
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
