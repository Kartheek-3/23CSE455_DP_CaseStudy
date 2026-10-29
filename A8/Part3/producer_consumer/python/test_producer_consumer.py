from collections import deque

from producer_consumer import Consumer, Job, Producer


passed = 0
failed = 0


def check(test_name, expected, actual):
    global passed, failed

    if expected == actual:
        print(f"PASS: {test_name}")
        passed += 1
    else:
        print(
            f"FAIL: {test_name}"
            f" | expected={expected}"
            f" | actual={actual}"
        )
        failed += 1


def main():
    queue = deque()

    producer = Producer(queue)
    consumer = Consumer(queue)

    producer.enqueue(
        Job(
            "SENDGRID",
            "alice@example.com",
            "Welcome",
        )
    )

    producer.enqueue(
        Job(
            "MAILTRAP",
            "bob@example.com",
            "Reset: 1234",
        )
    )

    producer.enqueue(
        Job(
            "SENDGRID",
            "charlie@example.com",
            "Flight confirmed",
        )
    )

    check(
        "First job is processed by SENDGRID",
        "SENDGRID email processed for alice@example.com",
        consumer.process_next(),
    )

    check(
        "Second job is processed by MAILTRAP",
        "MAILTRAP email processed for bob@example.com",
        consumer.process_next(),
    )

    check(
        "Third job is processed by SENDGRID",
        "SENDGRID email processed for charlie@example.com",
        consumer.process_next(),
    )

    check(
        "Queue is empty after processing all jobs",
        None,
        consumer.process_next(),
    )

    print()
    print(f"RESULT: {passed} passed, {failed} failed")

    return 1 if failed > 0 else 0


if __name__ == "__main__":
    raise SystemExit(main())