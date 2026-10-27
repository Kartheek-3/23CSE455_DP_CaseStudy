"""Decorator, modelled on JUnit's timeout invocation wrappers (instance D10): TimeoutInvocation and
LoggingInvocation wrap any Invocation, add behaviour around proceed() and keep the same interface."""
from abc import ABC, abstractmethod


class InputFormatError(Exception):
    pass


LIMIT_MS = 100


class Invocation(ABC):
    """Component."""

    @abstractmethod
    def name(self):
        ...

    @abstractmethod
    def duration_ms(self):
        ...

    @abstractmethod
    def proceed(self):
        ...


class TestInvocation(Invocation):
    """Concrete component: the test method itself (its duration is given, not measured)."""

    def __init__(self, name, duration_ms, outcome):
        self._name, self._duration_ms, self._outcome = name, duration_ms, outcome

    def name(self):
        return self._name

    def duration_ms(self):
        return self._duration_ms

    def proceed(self):
        return self._outcome


class InvocationDecorator(Invocation):
    def __init__(self, inner):
        self.inner = inner

    def name(self):
        return self.inner.name()

    def duration_ms(self):
        return self.inner.duration_ms()

    def proceed(self):
        return self.inner.proceed()


class TimeoutInvocation(InvocationDecorator):
    def __init__(self, inner, limit_ms):
        super().__init__(inner)
        self.limit_ms = limit_ms

    def proceed(self):
        result = self.inner.proceed()
        if self.duration_ms() > self.limit_ms:
            return f"TIMEOUT ({self.duration_ms()} ms > {self.limit_ms} ms limit)"
        return result


class LoggingInvocation(InvocationDecorator):
    def __init__(self, inner, log):
        super().__init__(inner)
        self.log = log

    def proceed(self):
        self.log.append(f"[log] calling {self.name()}")
        result = self.inner.proceed()
        self.log.append(f"[log] {self.name()} -> {result}")
        return result


def parse(lines):
    invocations = []
    for number, line in enumerate(lines, start=1):
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        if len(fields) != 3:
            raise InputFormatError(f"line {number}: expected '<test> <duration-ms> PASS|FAIL'")
        name, duration, outcome = fields
        if not duration.isdigit():
            raise InputFormatError(f"line {number}: duration must be a whole number of milliseconds, got '{duration}'")
        if outcome not in ("PASS", "FAIL"):
            raise InputFormatError(f"line {number}: outcome must be PASS or FAIL, got '{outcome}'")
        invocations.append(TestInvocation(name, int(duration), outcome))
    return invocations


def report(path):
    with open(path, encoding="utf-8") as f:
        invocations = parse(f.read().splitlines())
    log, counts = [], {"PASS": 0, "FAIL": 0, "TIMEOUT": 0}
    for invocation in invocations:
        result = LoggingInvocation(TimeoutInvocation(invocation, LIMIT_MS), log).proceed()
        counts[result.split()[0]] += 1
    summary = ["== Summary =="] + [f"{key} {value}" for key, value in counts.items()]
    return "\n".join(log + summary) + "\n"
