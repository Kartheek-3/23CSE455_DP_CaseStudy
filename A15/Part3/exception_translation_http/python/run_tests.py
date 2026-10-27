import sys
from snippet import AccountService, translate


def execute(script):
    svc = AccountService()
    t = script.split()
    if t[0] == "deposit":
        return translate(lambda: svc.deposit(float(t[1])))
    if t[0] == "find":
        return translate(lambda: svc.find(int(t[1])))
    return translate(svc.boom)


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
