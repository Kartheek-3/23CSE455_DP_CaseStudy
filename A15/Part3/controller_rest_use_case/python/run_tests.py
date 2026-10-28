import sys
from snippet import AccountController


class Recorder:                                 # test double standing in for the service layer
    def __init__(self):
        self.log = []

    def create(self, user_id, kind, balance):
        self.log.append("create(%d,%s,%.2f)" % (user_id, kind, balance))

    def deposit(self, account_id, amount):
        self.log.append("deposit(%d,%.2f)" % (account_id, amount))

    def withdraw(self, account_id, amount):
        self.log.append("withdraw(%d,%.2f)" % (account_id, amount))

    def list_all(self):
        self.log.append("list()")
        return [1, 2, 3]


def execute(script):
    rec = Recorder()
    ctl = AccountController(rec)
    t = script.split()
    if t[0] == "create":
        r = ctl.create(int(t[1]), t[2], float(t[3]))
    elif t[0] == "deposit":
        r = ctl.deposit(int(t[1]), float(t[2]))
    elif t[0] == "withdraw":
        r = ctl.withdraw(int(t[1]), float(t[2]))
    else:
        r = ctl.list()
    return ",".join(rec.log) + "|" + str(r.status) + " " + r.message


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
