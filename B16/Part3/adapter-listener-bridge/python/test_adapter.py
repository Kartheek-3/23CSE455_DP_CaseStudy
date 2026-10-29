import unittest
from pathlib import Path

from adapter import InputFormatError, ListenerAdapter, TestListener, report

DATA = Path(__file__).resolve().parent.parent / "test-data"


class AdapterTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "events.txt"), expected)

    def test_adapter_converts_engine_calls_into_client_calls(self):
        received = []

        class Recorder(TestListener):
            def test_finished(self, identifier, status):
                received.append((identifier.display_name, identifier.is_test, identifier.parent_name, status))

        ListenerAdapter(Recorder()).execution_finished("[engine:e]/[class:CalcTests]/[method:add]", "FAILED")
        self.assertEqual(received, [("add", True, "CalcTests", "FAILED")])

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(InputFormatError) as raised:
            report(DATA / "invalid-events.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
