import unittest

from adapter_example import result


class AdapterTest(unittest.TestCase):
    def test_normalizes_legacy_response(self):
        self.assertEqual(result().as_line(),
                         "status=APPROVED,amount_cents=2599,reference=legacy-25.99")


if __name__ == "__main__":
    unittest.main()
