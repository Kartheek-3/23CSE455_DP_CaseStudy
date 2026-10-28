import sys
from snippet import Account, PolicyResolver, NoPolicy


def execute(script):
    kind, op, balance, amount = script.split()
    try:
        account = Account(float(balance), PolicyResolver().for_type(kind))
    except NoPolicy:
        return "NO_POLICY"
    if op == "deposit":
        account.deposit(float(amount))
        return "%.2f" % account.balance
    return "ALLOWED" if account.withdraw(float(amount)) else "DENIED"


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
