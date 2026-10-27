import sys
from snippet import Container, Service, RealDao, FakeDao, MissingDependency


def execute(script):
    c = Container()
    c.register("Service", Service())
    out = ""
    for cmd in script.split(";"):
        t = cmd.split()
        try:
            if t[0] == "register":
                c.register("Dao", RealDao() if t[1] == "real" else FakeDao())
                out = "registered"
            elif t[0] == "wire":
                c.wire()
                out = "wired"
            else:
                out = c.get("Service").describe()
        except MissingDependency as e:
            out = "MISSING:" + str(e)
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
