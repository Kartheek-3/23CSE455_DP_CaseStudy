"""Builds the tree from an indented text file (two spaces per level)."""

from nodes import TestCase, TestContainer

KINDS = ("engine", "class", "test")


class TreeFormatError(ValueError):
    def __init__(self, message, line_number=None):
        super().__init__(message if line_number is None else f"line {line_number}: {message}")


def parse(lines):
    root = None
    path = []  # path[d] is the last node seen at depth d

    for line_number, line in enumerate(lines, start=1):
        text = line.strip()
        if not text or text.startswith("#"):
            continue

        def fail(message):
            raise TreeFormatError(message, line_number)

        indent = len(line) - len(line.lstrip(" "))
        if indent % 2:
            fail("indentation must be a multiple of 2 spaces")
        kind, *rest = text.split()
        if kind not in KINDS:
            fail(f"unknown kind '{kind}'")
        if not rest:
            fail("missing name")
        name, *tag_fields = rest
        if any(not field.startswith("@") or field == "@" for field in tag_fields):
            fail("tags must look like @name")
        tags = [field[1:] for field in tag_fields]
        if tags and kind != "test":
            fail("only tests can have tags")

        depth = indent // 2
        if root is None:
            if depth != 0 or kind != "engine":
                fail("the first node must be an engine at the top level")
            root = TestContainer(kind, name)
            path = [root]
            continue
        if depth == 0 or kind == "engine":
            fail("only one engine is allowed, at the top level")
        if depth > len(path):
            fail("indented too far")
        parent = path[depth - 1]
        if not isinstance(parent, TestContainer):
            fail("a test cannot have children")
        node = TestCase(name, tags) if kind == "test" else TestContainer(kind, name)
        parent.add_child(node)
        path = path[:depth] + [node]

    if root is None:
        raise TreeFormatError("no engine found")
    return root
