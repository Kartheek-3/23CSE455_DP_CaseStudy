import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from repository import UsersRepository, UserService, EntityNotFound


def show(entity):
    return "{" + ",".join("%s=%s" % (k, entity[k]) for k in sorted(entity)) + "}"


def run(text):
    service = UserService(UsersRepository())
    out = []
    for command in text.split(";"):
        parts = command.split(" ")
        try:
            if parts[0] == "insert":
                out.append(show(service.register(parts[1])))
            elif parts[0] == "find":
                found = service.find_by_name(parts[1])
                out.append("none" if found is None else show(found))
            elif parts[0] == "findorfail":
                out.append(show(service.get_by_name(parts[1])))
            elif parts[0] == "count":
                out.append(str(service.count()))
        except EntityNotFound as e:
            out.append("ERR:" + str(e))
    return "~".join(out)

def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        cases = [l.rstrip("\n").split("|", 2) for l in f if l.strip() and not l.startswith("#")]
    passed = 0
    for name, text, expected in cases:
        got = run(text)
        ok = got == expected
        passed += ok
        print(("PASS " if ok else "FAIL ") + name + ("" if ok else ": expected [%s] got [%s]" % (expected, got)))
    print("passed %d/%d" % (passed, len(cases)))
    sys.exit(0 if passed == len(cases) else 1)


if __name__ == "__main__":
    main()
