import java.util.LinkedList;
import java.util.Queue;

public class ProducerConsumer {

    public static class Job {
        private final String type;
        private final String recipient;
        private final String payload;

        public Job(String type, String recipient, String payload) {
            this.type = type;
            this.recipient = recipient;
            this.payload = payload;
        }

        public String getType() {
            return type;
        }

        public String getRecipient() {
            return recipient;
        }

        public String getPayload() {
            return payload;
        }
    }

    public static class Producer {
        private final Queue<Job> queue;

        public Producer(Queue<Job> queue) {
            this.queue = queue;
        }

        public void enqueue(Job job) {
            queue.add(job);
        }
    }

    public static class Consumer {
        private final Queue<Job> queue;

        public Consumer(Queue<Job> queue) {
            this.queue = queue;
        }

        public String processNext() {
            Job job = queue.poll();

            if (job == null) {
                return null;
            }

            if ("SENDGRID".equals(job.getType())) {
                return "SENDGRID email processed for " + job.getRecipient();
            }

            if ("MAILTRAP".equals(job.getType())) {
                return "MAILTRAP email processed for " + job.getRecipient();
            }

            return null;
        }
    }
}