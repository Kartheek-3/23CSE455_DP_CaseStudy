const {
    Job,
    Producer,
    Consumer
} = require("./producerConsumer");

let passed = 0;
let failed = 0;

function check(testName, expected, actual) {
    if (expected === actual) {
        console.log(`PASS: ${testName}`);
        passed++;
    } else {
        console.log(
            `FAIL: ${testName}` +
            ` | expected=${expected}` +
            ` | actual=${actual}`
        );
        failed++;
    }
}

const queue = [];

const producer = new Producer(queue);
const consumer = new Consumer(queue);

producer.enqueue(
    new Job(
        "SENDGRID",
        "alice@example.com",
        "Welcome"
    )
);

producer.enqueue(
    new Job(
        "MAILTRAP",
        "bob@example.com",
        "Reset: 1234"
    )
);

producer.enqueue(
    new Job(
        "SENDGRID",
        "charlie@example.com",
        "Flight confirmed"
    )
);

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
    null,
    consumer.processNext()
);

console.log();
console.log(`RESULT: ${passed} passed, ${failed} failed`);

process.exitCode = failed > 0 ? 1 : 0;