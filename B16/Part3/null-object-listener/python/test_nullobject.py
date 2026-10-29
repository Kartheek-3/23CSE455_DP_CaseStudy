import unittest
from pathlib import Path

from nullobject import NOOP, InputFormatError, TestRunner, report

DATA = Path(__file__).resolve().parent.parent / "test-data"


class NullObjectTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "tests.txt"), expected)

    def test_runner_without_listener_uses_the_null_object(self):
        runner = TestRunner()
        self.assertIs(runner.listener, NOOP)
        self.assertEqual(runner.run([("a", "PASS"), ("b", "FAIL")]), "result: 1 passed, 1 failed")

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(InputFormatError) as raised:
            report(DATA / "invalid-tests.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
