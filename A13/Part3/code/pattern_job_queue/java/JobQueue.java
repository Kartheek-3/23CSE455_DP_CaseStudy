import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.Set;
import java.util.function.Function;

record Job(int id, String label, String to, String body) {}

record JobResult(int id, String label, String result, int attempts) {}

interface Transport {
    void send(String to, String body);
}

public class JobQueue {
    private final Queue<Job> jobs = new LinkedList<>();
    private final int maxAttempts;
    private int nextId = 1;

    public JobQueue(int maxAttempts) {
        this.maxAttempts = maxAttempts;
    }

    public int add(String label, String to, String body) {
        Job job = new Job(nextId++, label, to, body);
        jobs.add(job);
        return job.id();
    }

    /** The worker: takes jobs in FIFO order and retries a failing job up to maxAttempts times. */
    public List<JobResult> run(Function<Job, String> processor) {
        List<JobResult> results = new ArrayList<>();
        while (!jobs.isEmpty()) {
            Job job = jobs.poll();
            String result = null;
            int attempts = 0;
            while (result == null && attempts < maxAttempts) {
                attempts++;
                try {
                    result = processor.apply(job);
                } catch (RuntimeException e) {
                    // failed attempt, try again
                }
            }
            results.add(new JobResult(job.id(), job.label(), result == null ? "failed" : result, attempts));
        }
        return results;
    }
}

class DeliverService {
    private final JobQueue queue;

    DeliverService(JobQueue queue) {
        this.queue = queue;
    }

    int deliver(String to, String body) {
        String label = to.replace("https://", "").replace("/inbox", "");
        return queue.add(label, to, body);
    }
}

class DeliverProcessor {
    private final Set<String> blockedHosts;
    private final Transport transport;

    DeliverProcessor(Set<String> blockedHosts, Transport transport) {
        this.blockedHosts = blockedHosts;
        this.transport = transport;
    }

    String process(Job job) {
        String host = job.to().split("/")[2];
        if (blockedHosts.contains(host)) return "skip (blocked)";
        transport.send(job.to(), job.body());
        return "delivered";
    }
}
