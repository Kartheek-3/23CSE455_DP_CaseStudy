import unittest
from pathlib import Path

from factory import InputFormatError, PooledExecutor, TestEngine, report

DATA = Path(__file__).resolve().parent.parent / "test-data"


class FactoryMethodTest(unittest.TestCase):
    def test_report_matches_expected_output(self):
        expected = (DATA / "expected-output.txt").read_text(encoding="utf-8")
        self.assertEqual(report(DATA / "tests.txt"), expected)

    def test_subclass_changes_only_the_created_product(self):
        class ThreeWorkerEngine(TestEngine):
            def name(self):
                return "three"

            def create_executor(self):
                return PooledExecutor(3)

        lines = ThreeWorkerEngine().execute([("a", "PASS"), ("b", "PASS"), ("c", "PASS"), ("d", "FAIL")])
        self.assertEqual(lines, ["== three ==", "executor: pool of 3 workers", "[worker-1] a -> PASS",
                                 "[worker-2] b -> PASS", "[worker-3] c -> PASS", "[worker-1] d -> FAIL"])

    def test_invalid_input_is_rejected_with_expected_error(self):
        expected = (DATA / "expected-error.txt").read_text(encoding="utf-8").strip()
        with self.assertRaises(InputFormatError) as raised:
            report(DATA / "invalid-tests.txt")
        self.assertEqual(str(raised.exception), expected)


if __name__ == "__main__":
    unittest.main()
