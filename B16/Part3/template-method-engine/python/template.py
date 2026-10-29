"""Template Method, modelled on JUnit's HierarchicalTestEngine.execute (instance B1): execute() fixes
the order of the steps; subclasses supply run_test() and may override the before/after hooks."""
from abc import ABC, abstractmethod


class InputFormatError(Exception):
    pass


class TestEngine(ABC):
    def execute(self, tests):
        """The template method. Subclasses are not meant to override it."""
        lines = [f"{self.name()}: start ({len(tests)} tests)"]
        passed = 0
        for name, outcome in tests:
            self.before_each(name, lines)
            result = self.run_test(name, outcome)
            lines.append(f"  run {name} -> {result}")
            self.after_each(name, lines)
            passed += result == "PASS"
        lines.append(f"{self.name()}: done {passed} passed, {len(tests) - passed} failed")
        return lines

    @abstractmethod
    def name(self):
        ...

    @abstractmethod
    def run_test(self, name, outcome):
        """Primitive operation."""

    def before_each(self, name, lines):
        """Hook: does nothing unless overridden."""

    def after_each(self, name, lines):
        """Hook: does nothing unless overridden."""


class SimpleEngine(TestEngine):
    def name(self):
        return "simple"

    def run_test(self, name, outcome):
        return outcome


class LifecycleEngine(TestEngine):
    def name(self):
        return "lifecycle"

    def run_test(self, name, outcome):
        return outcome

    def before_each(self, name, lines):
        lines.append(f"  beforeEach {name}")

    def after_each(self, name, lines):
        lines.append(f"  afterEach {name}")


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
    for engine in (SimpleEngine(), LifecycleEngine()):
        out.append(f"== {engine.name()} ==")
        out.extend(engine.execute(tests))
    return "\n".join(out) + "\n"
