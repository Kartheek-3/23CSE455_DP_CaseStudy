import unittest
from pathlib import Path

from decorator import InputFormatError, LoggingInvocation, TestInvocation, TimeoutInvocation, report

DATA = Path(__file__).resolve().parent.parent / "test-data"


class DecoratorTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "invocations.txt"), expected)

    def test_decorators_stack_in_any_order(self):
        log = []
        # Logging inside the timeout sees the raw outcome; the timeout still decides the final result.
        result = TimeoutInvocation(LoggingInvocation(TestInvocation("div", 250, "PASS"), log), 100).proceed()
        self.assertEqual(log, ["[log] calling div", "[log] div -> PASS"])
        self.assertEqual(result, "TIMEOUT (250 ms > 100 ms limit)")

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(InputFormatError) as raised:
            report(DATA / "invalid-invocations.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
