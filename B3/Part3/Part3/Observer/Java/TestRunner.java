
import java.util.ArrayList;
import java.util.List;

class TestObserver implements JobObserver {
    private final List<String> receivedJobs = new ArrayList<>();

    @Override
    public void onJobCreated(String jobTitle) {
        receivedJobs.add(jobTitle);
    }

    public List<String> getReceivedJobs() {
        return receivedJobs;
    }
}

public class TestRunner {
    public static void main(String[] args) {
        testSingleObserver();
        testMultipleObservers();
        testNoObservers();
        System.out.println("All Observer tests passed.");
    }

    static void testSingleObserver() {
        JobService service = new JobService();
        TestObserver observer = new TestObserver();

        service.addObserver(observer);
        service.notifyObservers("Python Developer");

        if (observer.getReceivedJobs().size() != 1 ||
            !observer.getReceivedJobs().get(0).equals("Python Developer")) {
            throw new AssertionError("Single observer test failed");
        }

        System.out.println("PASS: Single observer");
    }

    static void testMultipleObservers() {
        JobService service = new JobService();
        TestObserver first = new TestObserver();
        TestObserver second = new TestObserver();

        service.addObserver(first);
        service.addObserver(second);
        service.notifyObservers("Java Developer");

        if (first.getReceivedJobs().size() != 1 ||
            second.getReceivedJobs().size() != 1 ||
            !first.getReceivedJobs().get(0).equals("Java Developer") ||
            !second.getReceivedJobs().get(0).equals("Java Developer")) {
            throw new AssertionError("Multiple observers test failed");
        }

        System.out.println("PASS: Multiple observers");
    }

    static void testNoObservers() {
        JobService service = new JobService();
        service.notifyObservers("Data Engineer");
        System.out.println("PASS: No observers");
    }
}
