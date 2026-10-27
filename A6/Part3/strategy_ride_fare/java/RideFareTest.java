/** Runs fixtures S1-S8 from Part3/test-cases/strategy_spec.md. */
public final class RideFareTest {
    private static int passed = 0;
    private static int total = 0;

    private static void check(String id, RideFare.Trip trip, String expected) {
        total++;
        String actual;
        try {
            actual = Long.toString(new RideFare.FareCalculator().calculate(trip));
        } catch (RideFare.FareException e) {
            actual = "error " + e.code;
        }
        if (actual.equals(expected)) {
            passed++;
            System.out.println("PASS " + id);
        } else {
            System.out.println("FAIL " + id + ": expected " + expected + ", got " + actual);
        }
    }

    public static void main(String[] args) {
        check("S1", new RideFare.Trip("ONE_WAY", 30, 0, 0), "450");
        check("S2", new RideFare.Trip("ONE_WAY", 60, 0, 0), "600");
        check("S3", new RideFare.Trip("ROUND_TRIP", 0, 3, 0), "3000");
        check("S4", new RideFare.Trip("HOURLY", 0, 0, 3), "800");
        check("S5", new RideFare.Trip("HOURLY", 0, 0, 5.5), "1200");
        check("S6", new RideFare.Trip("OUTSTATION", 200, 2, 0), "3000");
        check("S7", new RideFare.Trip("ONE_WAY", 0, 0, 0), "error INVALID_INPUT");
        check("S8", new RideFare.Trip("SHUTTLE", 10, 0, 0), "error UNKNOWN_RIDE_TYPE");
        System.out.println("RESULT " + passed + "/" + total + " passed");
        if (passed != total) System.exit(1);
    }
}
