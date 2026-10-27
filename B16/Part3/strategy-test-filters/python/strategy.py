"""Strategy, modelled on JUnit's PostDiscoveryFilter (instance A3): the selector applies whichever
filter strategy it is given and never knows which one it is."""
from abc import ABC, abstractmethod


class InputFormatError(Exception):
    pass


class TestFilter(ABC):
    """Strategy: decides whether one test is selected."""

    @abstractmethod
    def includes(self, test):
        ...

    @abstractmethod
    def describe(self):
        ...


class IncludeTag(TestFilter):
    def __init__(self, tag):
        self.tag = tag

    def includes(self, test):
        return self.tag in test.tags

    def describe(self):
        return f"include-tag {self.tag}"


class ExcludeTag(TestFilter):
    def __init__(self, tag):
        self.tag = tag

    def includes(self, test):
        return self.tag not in test.tags

    def describe(self):
        return f"exclude-tag {self.tag}"


class NameContains(TestFilter):
    def __init__(self, text):
        self.text = text

    def includes(self, test):
        return self.text in test.name

    def describe(self):
        return f"name-contains {self.text}"


class Test:
    def __init__(self, name, tags):
        self.name = name
        self.tags = tags


class TestSelector:
    """Context: holds one strategy and applies it to every test."""

    def __init__(self, test_filter):
        self.test_filter = test_filter

    def select(self, tests):
        return [test for test in tests if self.test_filter.includes(test)]


def parse(lines):
    tests = []
    for number, line in enumerate(lines, start=1):
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        name = fields[0]
        class_name, hash_sign, method = name.partition("#")
        if not hash_sign or not class_name or not method:
            raise InputFormatError(f"line {number}: test name must look like Class#method, got '{name}'")
        tests.append(Test(name, fields[1:]))
    return tests


STRATEGIES = [IncludeTag("fast"), ExcludeTag("flaky"), NameContains("String")]


def report(path):
    with open(path, encoding="utf-8") as f:
        tests = parse(f.read().splitlines())
    out = []
    for strategy in STRATEGIES:
        selected = TestSelector(strategy).select(tests)
        out.append(f"== {strategy.describe()} ==")
        out.extend(test.name for test in selected)
        out.append(f"selected {len(selected)} of {len(tests)}")
    return "\n".join(out) + "\n"
