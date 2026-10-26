"""Composite pattern: one abstract TestNode, a TestCase leaf and a TestContainer composite."""

from abc import ABC, abstractmethod


class TestNode(ABC):
    """Component, modelled on JUnit's TestDescriptor: containers and tests share this interface."""

    def __init__(self, name):
        self.name = name

    @abstractmethod
    def count_tests(self):
        """Number of tests in this subtree (a test counts itself)."""

    @abstractmethod
    def has_tag(self, tag):
        """True only for a test that carries the tag; containers have no tags."""

    @abstractmethod
    def remove_tests_tagged(self, tag, removed):
        """Remove every test below this node that has the tag, appending its name to ``removed``."""

    @abstractmethod
    def prune_empty(self, pruned):
        """Remove every container below this node that has no tests left, children first."""

    @abstractmethod
    def render(self, depth=0):
        """Return this subtree as indented text."""


class TestCase(TestNode):
    """Leaf: a single test method with optional tags."""

    def __init__(self, name, tags=()):
        super().__init__(name)
        self.tags = tuple(tags)

    def count_tests(self):
        return 1

    def has_tag(self, tag):
        return tag in self.tags

    def remove_tests_tagged(self, tag, removed):
        pass  # a leaf has nothing below it; its parent decides whether to remove it

    def prune_empty(self, pruned):
        pass

    def render(self, depth=0):
        tags = "".join(f" @{tag}" for tag in self.tags)
        return f"{'  ' * depth}test {self.name}{tags}\n"


class TestContainer(TestNode):
    """Composite: an engine or a test class, holding child nodes of either kind."""

    def __init__(self, kind, name):
        super().__init__(name)
        self.kind = kind
        self.children = []

    def add_child(self, child):
        self.children.append(child)

    def count_tests(self):
        return sum(child.count_tests() for child in self.children)

    def has_tag(self, tag):
        return False

    def remove_tests_tagged(self, tag, removed):
        kept = []
        for child in self.children:
            if child.has_tag(tag):
                removed.append(child.name)
            else:
                child.remove_tests_tagged(tag, removed)
                kept.append(child)
        self.children = kept

    def prune_empty(self, pruned):
        kept = []
        for child in self.children:
            child.prune_empty(pruned)
            if child.count_tests() == 0:
                pruned.append(child.name)
            else:
                kept.append(child)
        self.children = kept

    def render(self, depth=0):
        tests = self.count_tests()
        noun = "test" if tests == 1 else "tests"
        header = f"{'  ' * depth}{self.kind} {self.name} ({tests} {noun})\n"
        return header + "".join(child.render(depth + 1) for child in self.children)
