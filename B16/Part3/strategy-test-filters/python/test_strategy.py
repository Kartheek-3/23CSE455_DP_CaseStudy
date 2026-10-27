import unittest
from pathlib import Path

from strategy import InputFormatError, Test, TestFilter, TestSelector, parse, report

DATA = Path(__file__).resolve().parent.parent / "test-data"


class StrategyTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "tests.txt"), expected)

    def test_new_strategy_plugs_in_without_changing_the_selector(self):
        class SingleTag(TestFilter):  # a strategy the selector has never seen
            def includes(self, test):
                return len(test.tags) == 1

            def describe(self):
                return "single-tag"

        tests = parse((DATA / "tests.txt").read_text(encoding="utf-8").splitlines())
        names = [t.name for t in TestSelector(SingleTag()).select(tests)]
        self.assertEqual(names, ["CalcTests#add", "CalcTests#sub", "StringTests#concat",
                                 "StringTests#upper", "SlowTests#bigSum"])

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(InputFormatError) as raised:
            report(DATA / "invalid-tests.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
