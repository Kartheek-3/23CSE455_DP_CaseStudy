import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from logging_factory import create_logging_backend


def run(text):
    fmt = {"-": None, "<empty>": ""}.get(text, text)
    try:
        backend = create_logging_backend(fmt)
        return backend.name + ":" + backend.write("info", "hi")
    except ValueError as e:
        return "ERR:" + str(e)

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
