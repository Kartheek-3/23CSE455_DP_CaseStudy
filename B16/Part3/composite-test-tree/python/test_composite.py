import unittest
from pathlib import Path

from main import report
from nodes import TestCase, TestContainer
from tree_parser import TreeFormatError

DATA = Path(__file__).resolve().parent.parent / "test-data"


class CompositeTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "tree.txt", "slow"), expected)

    def test_leaf_and_container_answer_count_tests_the_same_way(self):
        engine = TestContainer("engine", "e")
        cls = TestContainer("class", "C")
        cls.add_child(TestCase("a"))
        cls.add_child(TestCase("b", ["x"]))
        engine.add_child(cls)
        self.assertEqual([node.count_tests() for node in (TestCase("t"), cls, engine)], [1, 2, 2])

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(TreeFormatError) as raised:
            report(DATA / "invalid-tree.txt", "slow")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
