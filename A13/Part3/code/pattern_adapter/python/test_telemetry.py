import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from telemetry import SentryTelemetryAdapter, TelemetryRegistry


class FakeSentry:
    def __init__(self, log):
        self.log = log

    def capture_message(self, message, options):
        text = "sentry.captureMessage(%s,level=%s" % (message, options["level"])
        if "user.id" in options:
            text += ",user.id=" + options["user.id"]
        self.log.append(text + ")")

    def start_span(self, options, fn):
        self.log.append("sentry.startSpan(%s)" % options["name"])
        return fn()

    def close(self, timeout):
        self.log.append("sentry.close(%d)" % timeout)


def run(text):
    log = []
    registry = None
    for command in text.split(";"):
        parts = command.split(" ", 2)
        if parts[0] == "adapters":
            registry = TelemetryRegistry([SentryTelemetryAdapter(FakeSentry(log)) for _ in range(int(parts[1]))])
        elif parts[0] == "msg":
            registry.capture_message(parts[2], None if parts[1] == "-" else parts[1])
        elif parts[0] == "span":
            value = parts[2]

            def fn():
                if value.startswith("!"):
                    raise RuntimeError(value[1:])
                return value
            try:
                log.append("result=" + registry.start_span(parts[1], fn))
            except RuntimeError as e:
                log.append("ERR:" + str(e))
        elif parts[0] == "shutdown":
            registry.shutdown()
    return "~".join(log)

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
