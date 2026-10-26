import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from nirax import Router, Route


ROUTES = [Route("/", "home", False), Route("/notes/:id", "note-detail", False),
          Route("/settings", "settings", True), Route("/search", "search", False)]


def describe(res):
    text = res.component
    for key in sorted(res.params):
        text += " %s=%s" % (key, res.params[key])
    if res.query:
        text += " query=" + res.query
    if res.hash:
        text += " hash=" + res.hash
    return text + (" popup" if res.popup else "")


def run(text):
    logged_in, router, changes, out = False, None, [0], []
    for command in text.split(";"):
        parts = command.split(" ")
        if parts[0] == "login":
            logged_in = parts[1] == "on"
        elif parts[0] == "nav":
            if router is None:
                router = Router(ROUTES, logged_in, "notfound")
                router.on_change(lambda res: changes.__setitem__(0, changes[0] + 1))
            out.append(describe(router.navigate(parts[1])))
    out.append("changes=%d" % changes[0])
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
