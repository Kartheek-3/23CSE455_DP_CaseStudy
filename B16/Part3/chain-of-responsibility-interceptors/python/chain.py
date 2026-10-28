"""Chain of Responsibility, modelled on JUnit's InvocationInterceptorChain (instance D9): each
interceptor either handles the invocation itself or passes it on to the next one; the last link
calls the test."""
from abc import ABC, abstractmethod


class InputFormatError(Exception):
    pass


LIMIT_MS = 100


class Invocation:
    def __init__(self, name, duration_ms, outcome, disabled):
        self.name, self.duration_ms, self.outcome, self.disabled = name, duration_ms, outcome, disabled
        self.trace = []


class Interceptor(ABC):
    """Handler."""

    @abstractmethod
    def label(self):
        ...

    @abstractmethod
    def intercept(self, invocation, proceed):
        """Return a result, either by calling proceed() or without it (ends the chain)."""


class LoggingInterceptor(Interceptor):
    def label(self):
        return "logging"

    def intercept(self, invocation, proceed):
        return proceed()


class DisabledInterceptor(Interceptor):
    def label(self):
        return "disabled"

    def intercept(self, invocation, proceed):
        if invocation.disabled:
            return "SKIPPED (disabled)"
        return proceed()


class TimeoutInterceptor(Interceptor):
    def label(self):
        return "timeout"

    def intercept(self, invocation, proceed):
        result = proceed()
        if invocation.duration_ms > LIMIT_MS:
            return f"TIMEOUT ({invocation.duration_ms} ms > {LIMIT_MS} ms limit)"
        return result


def run_chain(interceptors, invocation):
    """Builds the chain: link i calls interceptor i with a proceed() that runs link i + 1."""

    def link(index):
        if index == len(interceptors):
            invocation.trace.append("invocation")
            return invocation.outcome
        interceptor = interceptors[index]
        invocation.trace.append(interceptor.label())
        return interceptor.intercept(invocation, lambda: link(index + 1))

    return link(0)


def parse(lines):
    invocations = []
    for number, line in enumerate(lines, start=1):
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        if len(fields) not in (3, 4):
            raise InputFormatError(f"line {number}: expected '<test> <duration-ms> PASS|FAIL [disabled]'")
        if not fields[1].isdigit():
            raise InputFormatError(f"line {number}: duration must be a whole number of milliseconds, got '{fields[1]}'")
        if fields[2] not in ("PASS", "FAIL"):
            raise InputFormatError(f"line {number}: outcome must be PASS or FAIL, got '{fields[2]}'")
        if len(fields) == 4 and fields[3] != "disabled":
            raise InputFormatError(f"line {number}: unknown flag '{fields[3]}'")
        invocations.append(Invocation(fields[0], int(fields[1]), fields[2], len(fields) == 4))
    return invocations


CHAIN = [LoggingInterceptor(), DisabledInterceptor(), TimeoutInterceptor()]


def report(path):
    with open(path, encoding="utf-8") as f:
        invocations = parse(f.read().splitlines())
    out = []
    for invocation in invocations:
        result = run_chain(CHAIN, invocation)
        out.append(f"{invocation.name} -> {result}  [{' > '.join(invocation.trace)}]")
    return "\n".join(out) + "\n"
