import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from event_bus import Broker, GlobalEventService


def run(text):
    broker = Broker()
    events = GlobalEventService(broker)
    out, handlers = [], {}

    def handler_for(name):
        return lambda channel, message: out.append("%s<-%s:%s" % (name, channel, message))

    for command in text.split(";"):
        parts = command.split(" ", 3)
        if parts[0] == "sub":
            handler = handlers.setdefault((parts[1], parts[2]), handler_for(parts[1]))
            broker.subscribe(parts[2], handler)
        elif parts[0] == "unsub":
            broker.unsubscribe(parts[2], handlers[(parts[1], parts[2])])
        elif parts[0] == "main":
            if events.publish_main_stream(parts[1], parts[2], parts[3]) == 0:
                out.append("dropped:mainStream:" + parts[1])
        elif parts[0] == "broadcast":
            if events.publish_broadcast_stream(parts[1], parts[2]) == 0:
                out.append("dropped:broadcast")
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
