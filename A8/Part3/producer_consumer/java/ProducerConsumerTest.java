public class ProducerConsumerTest {

    private static int passed = 0;
    private static int failed = 0;

    private static void check(
            String testName,
            String expected,
            String actual
    ) {
        if (expected == null ? actual == null : expected.equals(actual)) {
            System.out.println("PASS: " + testName);
            passed++;
        } else {
            System.out.println(
                    "FAIL: " + testName
                            + " | expected=" + expected
                            + " | actual=" + actual
            );
            failed++;
        }
    }

    public static void main(String[] args) {

        java.util.Queue<ProducerConsumer.Job> queue =
                new java.util.LinkedList<>();

        ProducerConsumer.Producer producer =
                new ProducerConsumer.Producer(queue);

        ProducerConsumer.Consumer consumer =
                new ProducerConsumer.Consumer(queue);

        producer.enqueue(
                new ProducerConsumer.Job(
                        "SENDGRID",
                        "alice@example.com",
                        "Welcome"
                )
        );

        producer.enqueue(
                new ProducerConsumer.Job(
                        "MAILTRAP",
                        "bob@example.com",
                        "Reset: 1234"
                )
        );

        producer.enqueue(
                new ProducerConsumer.Job(
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

        System.out.println();

        System.out.println(
                "RESULT: "
                        + passed
                        + " passed, "
                        + failed
                        + " failed"
        );

        System.exit(failed > 0 ? 1 : 0);
    }
}