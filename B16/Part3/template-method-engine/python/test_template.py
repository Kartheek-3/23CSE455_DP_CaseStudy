import unittest
from pathlib import Path

from template import InputFormatError, TestEngine, report

DATA = Path(__file__).resolve().parent.parent / "test-data"


class TemplateMethodTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "tests.txt"), expected)

    def test_new_engine_gets_the_whole_skeleton_from_one_primitive(self):
        class AlwaysPass(TestEngine):
            def name(self):
                return "always-pass"

            def run_test(self, name, outcome):
                return "PASS"

        self.assertEqual(AlwaysPass().execute([("a", "FAIL")]),
                         ["always-pass: start (1 tests)", "  run a -> PASS", "always-pass: done 1 passed, 0 failed"])

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(InputFormatError) as raised:
            report(DATA / "invalid-tests.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
