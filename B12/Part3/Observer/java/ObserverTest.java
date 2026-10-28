// Tests for the Observer cross-language snippet (shared cases).

public class ObserverTest {
    static int passed = 0;
    static int total = 0;

    static void check(String label, long actual, long expected) {
        total++;
        if (actual != expected) {
            throw new AssertionError(label + ": expected " + expected + " got " + actual);
        }
        passed++;
    }

    public static void main(String[] args) {
        AvailabilityObserver avail = new AvailabilityObserver();
        LoggingObserver log = new LoggingObserver();
        OccupancyMonitor monitor = new OccupancyMonitor();
        monitor.attach(avail);
        monitor.attach(log);

        check("notify-return", monitor.notify("occupy:1"), 2);
        check("avail-1", avail.count(), 1);
        check("log-1", log.events.size(), 1);

        monitor.notify("occupy:2");
        check("avail-2", avail.count(), 2);

        monitor.notify("free:1");
        check("avail-free", avail.count(), 1);

        monitor.detach(log);
        monitor.notify("occupy:3");
        check("avail-3", avail.count(), 2);
        check("log-still-3", log.events.size(), 3);
        check("log-contents",
                String.join(",", log.events).equals("occupy:1,occupy:2,free:1") ? 1 : 0, 1);

        System.out.println("OBSERVER_JAVA PASS " + passed + "/" + total);
    }
}
