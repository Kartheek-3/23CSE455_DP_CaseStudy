"""Reads the tree, removes the tests with one tag, prunes empty containers and prints the result."""

import sys

from tree_parser import TreeFormatError, parse


def _listed(names):
    return f"({len(names)}): {', '.join(names) if names else 'none'}"


def report(tree_path, tag):
    with open(tree_path, encoding="utf-8") as tree_file:
        root = parse(tree_file.read().splitlines())
    out = "== Tree as read ==\n" + root.render()

    before = root.count_tests()
    removed, pruned = [], []
    root.remove_tests_tagged(tag, removed)
    root.prune_empty(pruned)

    out += f"== Remove tests tagged @{tag} ==\n"
    out += f"tests before: {before}\n"
    out += f"removed {_listed(removed)}\n"
    out += f"pruned {_listed(pruned)}\n"
    out += f"tests after: {root.count_tests()}\n"
    return out + "== Tree after ==\n" + root.render()


def main(argv):
    if len(argv) != 3:
        print("usage: python3 main.py <tree-file> <tag>", file=sys.stderr)
        return 2
    try:
        sys.stdout.write(report(argv[1], argv[2]))
    except (OSError, TreeFormatError) as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
