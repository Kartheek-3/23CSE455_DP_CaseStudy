#include <deque>
#include <iostream>
#include <string>

#include "producer_consumer.cpp"

int passed = 0;
int failed = 0;

void check(
    const std::string& testName,
    const std::string& expected,
    const std::string& actual
) {
    if (expected == actual) {
        std::cout << "PASS: " << testName << '\n';
        passed++;
    } else {
        std::cout
            << "FAIL: " << testName
            << " | expected=" << expected
            << " | actual=" << actual
            << '\n';
        failed++;
    }
}

int main() {
    std::deque<Job> queue;

    Producer producer(queue);
    Consumer consumer(queue);

    producer.enqueue({
        "SENDGRID",
        "alice@example.com",
        "Welcome"
    });

    producer.enqueue({
        "MAILTRAP",
        "bob@example.com",
        "Reset: 1234"
    });

    producer.enqueue({
        "SENDGRID",
        "charlie@example.com",
        "Flight confirmed"
    });

    check(
        "First job is processed by SENDGRID",
        "SENDGRID email processed for alice@example.com",
        consumer.processNext()
    );

    check(
        "Second job is processed by MAILTRAP",
        "MAILTRAP email processed for bob@example.com",
        consumer.processNext()
    );

    check(
        "Third job is processed by SENDGRID",
        "SENDGRID email processed for charlie@example.com",
        consumer.processNext()
    );

    check(
        "Queue is empty after processing all jobs",
        "",
        consumer.processNext()
    );

    std::cout << '\n';

    std::cout
        << "RESULT: "
        << passed
        << " passed, "
        << failed
        << " failed"
        << '\n';

    return failed > 0 ? 1 : 0;
}