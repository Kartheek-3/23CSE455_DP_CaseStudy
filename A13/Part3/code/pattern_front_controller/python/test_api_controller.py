import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from api_controller import ApiController, Endpoint


def build():
    tokens = {"t-alice": "alice", "t-bob": "bob"}
    controller = ApiController(lambda token: tokens.get(token))
    controller.register(Endpoint("ping", False, lambda body, user: "pong"))
    controller.register(Endpoint("notes/create", True, lambda body, user: "created %s by %s" % (body, user)))
    controller.register(Endpoint("i", True, lambda body, user: user))
    return controller


def run(text):
    controller = build()
    out = []
    for command in text.split(";"):
        parts = command.split(" ", 3)
        response = controller.handle(parts[1], parts[2], parts[3] if len(parts) > 3 else "")
        out.append("%d %s" % (response.status, response.text))
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
