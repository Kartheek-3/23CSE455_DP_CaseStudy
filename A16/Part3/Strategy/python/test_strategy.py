import unittest

from strategy_example import results


class StrategyTest(unittest.TestCase):
    def test_discount_policies(self):
        self.assertEqual(results(), (9000, 8000))


if __name__ == "__main__":
    unittest.main()
