import java.util.List;

/** Runs fixtures T1-T8 from Part3/test-cases/state_spec.md. */
public final class TripLifecycleTest {
    private static int passed = 0;
    private static int total = 0;

    private static void check(String id, List<String> events, String expectedState, int expectedErrors) {
        total++;
        TripLifecycle.Trip trip = new TripLifecycle.Trip();
        int errors = 0;
        for (String e : events) {
            try {
                trip.apply(e);
            } catch (TripLifecycle.InvalidTransition ex) {
                errors++;
            }
        }
        if (trip.status().equals(expectedState) && errors == expectedErrors) {
            passed++;
            System.out.println("PASS " + id);
        } else {
            System.out.println("FAIL " + id + ": got " + trip.status() + "/" + errors);
        }
    }

    public static void main(String[] args) {
        check("T1", List.of("accept", "complete"), "COMPLETED", 0);
        check("T2", List.of("cancel"), "CANCELLED", 0);
        check("T3", List.of("accept", "cancel"), "CANCELLED", 0);
        check("T4", List.of("expire"), "EXPIRED", 0);
        check("T5", List.of("complete"), "PENDING", 1);
        check("T6", List.of("accept", "complete", "cancel"), "COMPLETED", 1);
        check("T7", List.of("accept", "reject"), "REJECTED", 0);
        check("T8", List.of("expire", "accept", "cancel"), "EXPIRED", 2);
        System.out.println("RESULT " + passed + "/" + total + " passed");
        if (passed != total) System.exit(1);
    }
}
