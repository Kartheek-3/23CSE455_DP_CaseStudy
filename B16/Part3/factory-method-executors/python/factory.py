"""Factory Method, modelled on JUnit's HierarchicalTestEngine.createExecutorService (instance B2):
execute() is written once in TestEngine; each subclass decides which executor it creates."""
from abc import ABC, abstractmethod


class InputFormatError(Exception):
    pass


class Executor(ABC):
    """Product."""

    @abstractmethod
    def describe(self):
        ...

    @abstractmethod
    def run(self, tests):
        ...


class SameThreadExecutor(Executor):
    def describe(self):
        return "same thread"

    def run(self, tests):
        return [f"[main] {name} -> {outcome}" for name, outcome in tests]


class PooledExecutor(Executor):
    """Hands tests to its workers in turn (deterministic, so the output can be compared)."""

    def __init__(self, workers):
        self.workers = workers

    def describe(self):
        return f"pool of {self.workers} workers"

    def run(self, tests):
        return [f"[worker-{index % self.workers + 1}] {name} -> {outcome}" for index, (name, outcome) in enumerate(tests)]


class TestEngine(ABC):
    """Creator."""

    @abstractmethod
    def name(self):
        ...

    @abstractmethod
    def create_executor(self):
        """The factory method."""

    def execute(self, tests):
        executor = self.create_executor()
        return [f"== {self.name()} ==", f"executor: {executor.describe()}"] + executor.run(tests)


class SameThreadEngine(TestEngine):
    def name(self):
        return "same-thread engine"

    def create_executor(self):
        return SameThreadExecutor()


class PooledEngine(TestEngine):
    def name(self):
        return "pooled engine"

    def create_executor(self):
        return PooledExecutor(2)


def parse(lines):
    tests = []
    for number, line in enumerate(lines, start=1):
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        if len(fields) != 2:
            raise InputFormatError(f"line {number}: expected '<test> PASS|FAIL'")
        if fields[1] not in ("PASS", "FAIL"):
            raise InputFormatError(f"line {number}: outcome must be PASS or FAIL, got '{fields[1]}'")
        tests.append((fields[0], fields[1]))
    return tests


def report(path):
    with open(path, encoding="utf-8") as f:
        tests = parse(f.read().splitlines())
    out = []
    for engine in (SameThreadEngine(), PooledEngine()):
        out.extend(engine.execute(tests))
    return "\n".join(out) + "\n"
