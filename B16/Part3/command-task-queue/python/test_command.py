import unittest
from pathlib import Path

from command import InputFormatError, RunTestCommand, TaskExecutor, report

DATA = Path(__file__).resolve().parent.parent / "test-data"


class CommandTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "tasks.txt"), expected)

    def test_commands_run_only_when_the_invoker_runs_them(self):
        executor = TaskExecutor()
        executor.submit(RunTestCommand("a", "PASS"))
        self.assertEqual(executor.results, [])          # queued, not executed yet
        lines, executed = executor.run_all()
        self.assertEqual((lines, executed, executor.results), (["#1 test a -> PASS"], 1, ["PASS"]))

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(InputFormatError) as raised:
            report(DATA / "invalid-tasks.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
