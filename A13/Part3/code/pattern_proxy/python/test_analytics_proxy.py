import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from analytics_proxy import AnalyticsProxy, RealAnalytics


def run(text):
    proxy = AnalyticsProxy()
    out = []
    for command in text.split(";"):
        parts = command.split(" ", 1)
        try:
            if parts[0] == "set":
                proxy.set_analytics(RealAnalytics())
            else:
                out.append(getattr(proxy, parts[0])(parts[1]))
        except RuntimeError as e:
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
