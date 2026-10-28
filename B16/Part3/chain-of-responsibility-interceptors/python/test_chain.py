import unittest
from pathlib import Path

from chain import DisabledInterceptor, InputFormatError, Invocation, LoggingInterceptor, report, run_chain

DATA = Path(__file__).resolve().parent.parent / "test-data"


class ChainTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "invocations.txt"), expected)

    def test_a_handler_can_stop_the_chain_before_later_links(self):
        invocation = Invocation("div", 10, "PASS", disabled=True)
        result = run_chain([DisabledInterceptor(), LoggingInterceptor()], invocation)
        self.assertEqual((result, invocation.trace), ("SKIPPED (disabled)", ["disabled"]))

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(InputFormatError) as raised:
            report(DATA / "invalid-invocations.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
