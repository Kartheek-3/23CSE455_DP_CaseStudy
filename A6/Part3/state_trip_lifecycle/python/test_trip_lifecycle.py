"""Runs fixtures T1-T8 from Part3/test-cases/state_spec.md."""
import sys

from trip_lifecycle import InvalidTransition, Trip

CASES = [
    ("T1", ["accept", "complete"], "COMPLETED", 0),
    ("T2", ["cancel"], "CANCELLED", 0),
    ("T3", ["accept", "cancel"], "CANCELLED", 0),
    ("T4", ["expire"], "EXPIRED", 0),
    ("T5", ["complete"], "PENDING", 1),
    ("T6", ["accept", "complete", "cancel"], "COMPLETED", 1),
    ("T7", ["accept", "reject"], "REJECTED", 0),
    ("T8", ["expire", "accept", "cancel"], "EXPIRED", 2),
]


def main() -> int:
    passed = 0
    for case_id, events, expected_state, expected_errors in CASES:
        trip = Trip()
        errors = 0
        for event in events:
            try:
                trip.apply(event)
            except InvalidTransition:
                errors += 1
        if trip.status == expected_state and errors == expected_errors:
            passed += 1
            print(f"PASS {case_id}")
        else:
            print(f"FAIL {case_id}: got {trip.status}/{errors}")
    print(f"RESULT {passed}/{len(CASES)} passed")
    return 0 if passed == len(CASES) else 1


if __name__ == "__main__":
    sys.exit(main())
