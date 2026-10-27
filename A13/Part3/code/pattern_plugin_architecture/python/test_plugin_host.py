import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from plugin_host import PluginHost


def plugin_setup(name):
    def setup(add_handler):
        if name == "upper":
            add_handler("note_view_interruptor", lambda t: t.upper())
        elif name == "exclaim":
            add_handler("note_view_interruptor", lambda t: t + "!")
        elif name == "share":
            add_handler("note_action", lambda t: "Share")
        elif name == "bad":
            add_handler("note_view_interruptor", lambda t: t + "?")
            raise RuntimeError("boom")
    return setup


def run(text):
    host, out = PluginHost(), []
    for command in text.split(";"):
        parts = command.split(" ")
        try:
            if parts[0] == "install":
                host.install(parts[1], plugin_setup(parts[1]))
            elif parts[0] == "abort":
                host.abort(parts[1])
            elif parts[0] == "view":
                value = parts[1]
                for fn in host.get_handlers("note_view_interruptor"):
                    value = fn(value)
                out.append(value)
            elif parts[0] == "actions":
                out.append(",".join(fn("") for fn in host.get_handlers("note_action")))
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
