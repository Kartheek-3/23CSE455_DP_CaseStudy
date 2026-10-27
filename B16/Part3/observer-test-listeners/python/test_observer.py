import unittest
from pathlib import Path

from listeners import BrokenListener, CompositeTestExecutionListener
from main import report
from runner import EventFormatError

DATA = Path(__file__).resolve().parent.parent / "test-data"


class ObserverTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "events.txt"), expected)

    def test_throwing_listener_does_not_stop_the_next_one(self):
        seen = []

        class Recorder:  # no base class needed: duck typing
            def execution_started(self, test_id):
                seen.append(test_id)

        listeners = CompositeTestExecutionListener()
        listeners.register(BrokenListener())
        listeners.register(Recorder())
        listeners.execution_started("T#a")
        self.assertEqual(seen, ["T#a"])
        self.assertEqual(len(listeners.failures), 1)

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(EventFormatError) as raised:
            report(DATA / "invalid-events.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
