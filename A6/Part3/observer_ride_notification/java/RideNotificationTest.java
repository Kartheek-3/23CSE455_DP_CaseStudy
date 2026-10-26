import java.util.List;
import java.util.function.BooleanSupplier;

/** Runs fixtures O1-O6 from Part3/test-cases/observer_spec.md. */
public final class RideNotificationTest {
    private static int passed = 0;
    private static int total = 0;

    private static void check(String id, BooleanSupplier body) {
        total++;
        if (body.getAsBoolean()) {
            passed++;
            System.out.println("PASS " + id);
        } else {
            System.out.println("FAIL " + id);
        }
    }

    private static RideNotification.Event ev(String type, String booking) {
        return new RideNotification.Event(type, booking);
    }

    public static void main(String[] args) {
        check("O1", () -> {
            var hub = new RideNotification.NotificationHub();
            var d1 = new RideNotification.RecordingObserver();
            var d2 = new RideNotification.RecordingObserver();
            hub.subscribe("d1", d1);
            hub.subscribe("d2", d2);
            int n = hub.broadcast(List.of("d1", "d2", "d3"), ev("booking:new", "B1"));
            return n == 2 && d1.received.size() == 1 && d2.received.size() == 1;
        });
        check("O2", () -> {
            var hub = new RideNotification.NotificationHub();
            var d1 = new RideNotification.RecordingObserver();
            hub.subscribe("d1", d1);
            hub.subscribe("d2", new RideNotification.RecordingObserver());
            hub.unsubscribe("d1");
            int n = hub.broadcast(List.of("d1", "d2"), ev("booking:new", "B2"));
            return n == 1 && d1.received.isEmpty();
        });
        check("O3", () -> !new RideNotification.NotificationHub().notify("r1", ev("booking:confirmation", "B3")));
        check("O4", () -> {
            var hub = new RideNotification.NotificationHub();
            var a = new RideNotification.RecordingObserver();
            var b = new RideNotification.RecordingObserver();
            hub.subscribe("d1", a);
            hub.subscribe("d1", b);
            boolean ok = hub.notify("d1", ev("cancel:booking", "B4"));
            return ok && a.received.isEmpty() && b.received.size() == 1;
        });
        check("O5", () -> {
            var hub = new RideNotification.NotificationHub();
            var d2 = new RideNotification.RecordingObserver();
            hub.subscribe("d2", d2);
            hub.notify("d2", ev("booking:new", "B5"));
            hub.notify("d2", ev("cancel:booking", "B5"));
            return d2.received.stream().map(RideNotification.Event::type).toList()
                .equals(List.of("booking:new", "cancel:booking"));
        });
        check("O6", () -> {
            var hub = new RideNotification.NotificationHub();
            hub.subscribe("r1", new RideNotification.RecordingObserver());
            boolean ok = hub.notify("r1", ev("booking:confirmation", "B6"));
            return ok && hub.broadcast(List.of(), ev("booking:new", "B7")) == 0;
        });
        System.out.println("RESULT " + passed + "/" + total + " passed");
        if (passed != total) System.exit(1);
    }
}
