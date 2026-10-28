"""Wires the listeners to the runner and prints the summary, the log and any listener failures."""

import sys

from listeners import BrokenListener, CompositeTestExecutionListener, LoggingListener, SummaryListener
from runner import EventFormatError, EventRunner


def report(events_path):
    summary = SummaryListener()
    log = LoggingListener()

    listeners = CompositeTestExecutionListener()
    listeners.register(summary)
    listeners.register(BrokenListener())
    listeners.register(log)

    with open(events_path, encoding="utf-8") as events:
        EventRunner(listeners).run(events.read().splitlines())

    return (
        "== Summary ==\n" + summary.render()
        + "== Log ==\n" + log.render()
        + f"== Listener failures ({len(listeners.failures)}) ==\n"
        + "".join(failure + "\n" for failure in listeners.failures)
    )


def main(argv):
    if len(argv) != 2:
        print("usage: python3 main.py <events-file>", file=sys.stderr)
        return 2
    try:
        sys.stdout.write(report(argv[1]))
    except (OSError, EventFormatError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
