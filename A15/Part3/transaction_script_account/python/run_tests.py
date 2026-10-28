import sys
from snippet import AccountScripts, BadRequest, NotFound


def execute(script):
    scripts, out = AccountScripts(), ""
    for cmd in script.split(";"):
        t = cmd.split()
        try:
            if t[0] == "open":
                out = str(scripts.open(t[1], float(t[2])))
            elif t[0] == "deposit":
                out = "%.2f" % scripts.deposit(int(t[1]), float(t[2]))
            else:
                out = "%.2f" % scripts.withdraw(int(t[1]), float(t[2]))
        except BadRequest:
            out = "BAD_REQUEST"
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
