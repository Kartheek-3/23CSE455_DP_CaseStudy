from pathlib import Path
import sys
from main import MailDeliveryPublisher, MailLogger, MailMessage

COMMON = Path(__file__).resolve().parents[2] / "common_specs"


def process_case(line: str) -> str:
    fields = line.split("\t")
    if len(fields) != 6:
        raise ValueError(f"Invalid fixture row: {line}")
    case_id, register_flag, delivered_flag, message_id, subject, recipient = fields
    if register_flag not in ("YES", "NO") or delivered_flag not in ("YES", "NO"):
        return f"{case_id}\tERROR\tINVALID_FLAG"
    publisher = MailDeliveryPublisher()
    logger = MailLogger()
    if register_flag == "YES":
        publisher.register(logger)
    # O07 is the frozen register -> unregister -> deliver sequence.
    if case_id == "O07":
        publisher.unregister(logger)
    message = MailMessage(message_id, subject, None if recipient == "~" else recipient)
    try:
        publisher.deliver(message, delivered_flag == "YES")
    except ValueError as error:
        return f"{case_id}\tERROR\t{error}"
    if not logger.received:
        return f"{case_id}\tNO_NOTIFICATION"
    logged = logger.received[0]
    return "\t".join((case_id, "LOGGED", logged.message_id, logged.subject, logged.recipient))


def main() -> int:
    cases = (COMMON / "observer_cases.tsv").read_text(encoding="utf-8").splitlines()
    expected = (COMMON / "observer_expected.tsv").read_text(encoding="utf-8").splitlines()
    if len(cases) != 8 or len(expected) != 8:
        raise ValueError("Expected 7 cases and headers")
    failures = 0
    for index, case in enumerate(cases[1:], 1):
        actual = process_case(case)
        print(actual)
        if actual != expected[index]:
            failures += 1
            print(f"FAIL {index} expected={expected[index]} actual={actual}", file=sys.stderr)
    print(f"passed={7-failures}/7 failures={failures} errors=0", file=sys.stderr)
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
