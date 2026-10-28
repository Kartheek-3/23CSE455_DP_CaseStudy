// Tests for the Layered Architecture cross-language snippet (shared cases).

public class LayeredArchitectureTest {
    private static int passed = 0;
    private static int total = 0;

    private static void check(String label, Object actual, Object expected) {
        total += 1;
        if (!actual.equals(expected)) {
            throw new AssertionError(
                label + ": expected " + expected + " got " + actual);
        }
        passed += 1;
    }

    public static void main(String[] args) {
        ReservationRepository repository = new ReservationRepository();
        ParkingService service = new ParkingService(repository);
        ParkingController controller = new ParkingController(service);

        check("valid-response", controller.postReservation(1, "ABC"), "OK:1:ABC");
        check("count-1", repository.count(), 1);

        check("invalid-response", controller.postReservation(0, "ZZZ"), "ERR:invalid-slot");
        check("count-still-1", repository.count(), 1);

        check("second-response", controller.postReservation(2, "XYZ"), "OK:2:XYZ");
        check("count-2", repository.count(), 2);

        check("find-by-plate", repository.findByPlate("ABC").slotId, 1);
        check("negative-response", controller.postReservation(-5, "QQ"), "ERR:invalid-slot");

        System.out.println("LAYERED_ARCHITECTURE_JAVA PASS " + passed + "/" + total);
    }
}
