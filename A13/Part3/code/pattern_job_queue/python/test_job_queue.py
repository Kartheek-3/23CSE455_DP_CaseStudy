import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from job_queue import JobQueue, DeliverService, DeliverProcessor


class FakeTransport:
    def __init__(self):
        self.tried = set()

    def send(self, url, body):
        host = url.split("/")[2]
        if host.endswith(".down"):
            raise RuntimeError("unreachable")
        if host.endswith(".flaky") and url not in self.tried:
            self.tried.add(url)
            raise RuntimeError("timeout")


def run(text):
    queue, blocked = JobQueue(), set()
    service = DeliverService(queue)
    processor = DeliverProcessor(blocked, FakeTransport())
    out = []
    for command in text.split(";"):
        parts = command.split(" ", 2)
        if parts[0] == "add":
            service.deliver(parts[1], parts[2])
        elif parts[0] == "block":
            blocked.add(parts[1])
        elif parts[0] == "run":
            for r in queue.run(processor.process):
                out.append("%d:%s:%s@%d" % (r.id, r.label, r.result, r.attempts))
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
