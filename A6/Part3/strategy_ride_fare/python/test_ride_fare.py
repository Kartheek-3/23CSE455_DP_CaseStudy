"""Runs fixtures S1-S8 from Part3/test-cases/strategy_spec.md."""
import sys

from ride_fare import FareCalculator, FareError, Trip

CASES = [
    ("S1", Trip("ONE_WAY", km=30), "450"),
    ("S2", Trip("ONE_WAY", km=60), "600"),
    ("S3", Trip("ROUND_TRIP", days=3), "3000"),
    ("S4", Trip("HOURLY", hours=3), "800"),
    ("S5", Trip("HOURLY", hours=5.5), "1200"),
    ("S6", Trip("OUTSTATION", km=200, days=2), "3000"),
    ("S7", Trip("ONE_WAY", km=0), "error INVALID_INPUT"),
    ("S8", Trip("SHUTTLE", km=10), "error UNKNOWN_RIDE_TYPE"),
]


def main() -> int:
    passed = 0
    for case_id, trip, expected in CASES:
        try:
            actual = str(FareCalculator().calculate(trip))
        except FareError as e:
            actual = f"error {e.code}"
        if actual == expected:
            passed += 1
            print(f"PASS {case_id}")
        else:
            print(f"FAIL {case_id}: expected {expected}, got {actual}")
    print(f"RESULT {passed}/{len(CASES)} passed")
    return 0 if passed == len(CASES) else 1


if __name__ == "__main__":
    sys.exit(main())
