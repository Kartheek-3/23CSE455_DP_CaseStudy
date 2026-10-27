import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from preferences_manager import PreferencesManager


def run(text):
    manager = PreferencesManager()
    out, listeners = [], {}

    def make(name):
        def listener(event):
            if name == "boom":
                raise RuntimeError("listener failed")
            out.append("%s:%s=%s(oldValue=%s)" % (name, event.key, event.value, event.old_value))
        return listener

    for command in text.split(";"):
        parts = command.split(" ")
        try:
            if parts[0] == "on":
                listeners[parts[1]] = make(parts[1])
                manager.on(listeners[parts[1]])
            elif parts[0] == "off":
                manager.off(listeners.get(parts[1]))
            elif parts[0] == "commit":
                manager.commit(parts[1], parts[2])
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
