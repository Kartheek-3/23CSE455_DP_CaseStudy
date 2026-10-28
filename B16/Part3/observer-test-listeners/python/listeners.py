"""Observer side: the listener base class, the composite that notifies each one, and three listeners."""

from collections import Counter
from enum import Enum


class Status(Enum):
    SUCCESSFUL = "SUCCESSFUL"
    FAILED = "FAILED"
    ABORTED = "ABORTED"


class TestExecutionListener:
    """Base class with no-op callbacks, like JUnit's TestExecutionListener defaults.

    Inheriting is optional: the composite only calls these methods, so any object
    that has them works (duck typing).
    """

    def execution_started(self, test_id):
        pass

    def execution_skipped(self, test_id, reason):
        pass

    def execution_finished(self, test_id, status):
        pass


class CompositeTestExecutionListener(TestExecutionListener):
    """Forwards each event to every registered listener.

    Like JUnit's CompositeTestExecutionListener.notifyEach, a listener that raises
    is recorded in ``failures`` and the remaining listeners still get the event.
    """

    def __init__(self):
        self._listeners = []
        self.failures = []

    def register(self, listener):
        self._listeners.append(listener)

    def execution_started(self, test_id):
        self._notify_each(f"started {test_id}", lambda l: l.execution_started(test_id))

    def execution_skipped(self, test_id, reason):
        self._notify_each(f"skipped {test_id}", lambda l: l.execution_skipped(test_id, reason))

    def execution_finished(self, test_id, status):
        self._notify_each(f"finished {test_id}", lambda l: l.execution_finished(test_id, status))

    def _notify_each(self, event, call):
        for listener in self._listeners:
            try:
                call(listener)
            except Exception as error:
                self.failures.append(f"{type(listener).__name__} failed on {event}: {error}")


class SummaryListener(TestExecutionListener):
    """Counts results per status."""

    def __init__(self):
        self._counts = Counter()

    def execution_skipped(self, test_id, reason):
        self._counts["SKIPPED"] += 1

    def execution_finished(self, test_id, status):
        self._counts[status.value] += 1

    def render(self):
        names = [status.value for status in Status] + ["SKIPPED"]
        lines = [f"total: {sum(self._counts.values())}"]
        lines += [f"{name}: {self._counts[name]}" for name in names]
        return "".join(line + "\n" for line in lines)


class LoggingListener(TestExecutionListener):
    """Writes one log line per event."""

    def __init__(self):
        self._lines = []

    def execution_started(self, test_id):
        self._lines.append(f"started {test_id}")

    def execution_skipped(self, test_id, reason):
        self._lines.append(f"skipped {test_id} ({reason})")

    def execution_finished(self, test_id, status):
        self._lines.append(f"finished {test_id} {status.value}")

    def render(self):
        return "".join(f"{number}. {line}\n" for number, line in enumerate(self._lines, start=1))


class BrokenListener(TestExecutionListener):
    """Raises on every event, to show the others are not affected."""

    def execution_started(self, test_id):
        raise RuntimeError("listener is broken")

    def execution_skipped(self, test_id, reason):
        raise RuntimeError("listener is broken")

    def execution_finished(self, test_id, status):
        raise RuntimeError("listener is broken")
