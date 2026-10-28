"""Read identical shared cases and expectations; do not embed expected answers."""
import csv
import sys
from pathlib import Path
from main import QuoteEvaluator

FIXTURES = Path(__file__).resolve().parents[2] / "common_specs"


def main():
    with (FIXTURES / "strategy_cases.tsv").open(encoding="utf-8", newline="") as f:
        cases = list(csv.DictReader(f, delimiter="\t"))
    with (FIXTURES / "strategy_expected.tsv").open(encoding="utf-8") as f:
        expected = [line.rstrip("\r\n") for line in f.readlines()[1:]]
    evaluator = QuoteEvaluator()
    passed = 0
    for i, case in enumerate(cases):
        actual = evaluator.evaluate(case["case_id"], case["policy_code"],
                                    case["seconds_until_start"], case["amount_cents"], case["currency"])
        print(actual)
        if i < len(expected) and actual == expected[i]:
            passed += 1
        else:
            print(f"FAIL {case['case_id']}: expected={expected[i] if i < len(expected) else 'MISSING'} actual={actual}", file=sys.stderr)
    failures = len(cases) - passed + max(0, len(expected) - len(cases))
    sys.stdout.flush()
    print(f"RESULT: passed={passed}/{len(cases)} failures={failures} errors=0", file=sys.stderr)
    return 0 if failures == 0 and len(cases) == 15 else 1


if __name__ == "__main__":
    sys.exit(main())
