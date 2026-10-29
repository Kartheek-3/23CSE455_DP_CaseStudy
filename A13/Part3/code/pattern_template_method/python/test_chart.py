import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chart import Chart, UsersChart, NotesChart


class FaultyChart(Chart):
    def tick_major(self, group):
        raise RuntimeError("source unavailable")

    def tick_minor(self, group):
        return {}


def run(text):
    name, kind = text.split(" ")
    chart = {"users": UsersChart, "notes": NotesChart, "faulty": FaultyChart}[name]()
    try:
        columns = chart.tick(kind == "major")
    except RuntimeError as e:
        return "ERR:" + str(e)
    return ",".join("%s=%d" % (k, columns[k]) for k in sorted(columns)) or "none"

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
