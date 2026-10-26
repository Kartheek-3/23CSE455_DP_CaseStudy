"""Null Object, modelled on JUnit's EngineExecutionListener.NOOP (instance C7): when nobody listens,
the runner gets a listener that does nothing, so it never has to check for None."""


class InputFormatError(Exception):
    pass


class TestListener:
    def test_finished(self, name, outcome):
        raise NotImplementedError


class NoOpListener(TestListener):
    """The null object: a real listener whose methods do nothing."""

    def test_finished(self, name, outcome):
        pass


NOOP = NoOpListener()


class ConsoleListener(TestListener):
    def __init__(self, lines):
        self.lines = lines

    def test_finished(self, name, outcome):
        self.lines.append(f"listener: {name} {outcome}")


class TestRunner:
    def __init__(self, listener=NOOP):
        self.listener = listener

    def run(self, tests):
        passed = 0
        for name, outcome in tests:
            self.listener.test_finished(name, outcome)  # no "if listener is not None" anywhere
            passed += outcome == "PASS"
        return f"result: {passed} passed, {len(tests) - passed} failed"


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
    out = ["== with a console listener =="]
    out.append(TestRunner(ConsoleListener(out)).run(tests))
    out.append("== with no listener (null object) ==")
    out.append(TestRunner().run(tests))
    return "\n".join(out) + "\n"
