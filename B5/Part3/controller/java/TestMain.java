import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public final class TestMain {
    public static void main(String[] args) throws Exception {
        Path root = Path.of("../../common_specs");
        List<String> cases = Files.readAllLines(root.resolve("controller_cases.tsv"), StandardCharsets.UTF_8);
        List<String> expected = Files.readAllLines(root.resolve("controller_expected.tsv"), StandardCharsets.UTF_8);
        if (cases.size() != 9 || expected.size() != 9) throw new IllegalStateException("Fixture count is not eight");
        int passed = 0;
        for (int i = 1; i < cases.size(); ++i) {
            String[] fields = cases.get(i).split("\t", -1);
            if (fields.length != 6) throw new IllegalStateException("Bad case columns");
            Account account = new Account(fields[1], fields[2]);
            TripStore store = new TripStore();
            CoverTaskQueue queue = new CoverTaskQueue();
            TripCreationController controller = new TripCreationController(account, store, queue);
            String actual = controller.create(fields[0], fields[3], fields[4], fields[5]);
            String wanted = expected.get(i);
            boolean success = actual.split("\t", -1)[1].equals("CREATED");
            boolean stateOK = success
                ? store.trips.size() == 1 && account.memberships.size() == 1 && queue.tripIds.size() == 1
                  && account.memberships.get(0).tripId.equals(store.trips.get(0).id)
                  && account.memberships.get(0).role.equals("owner")
                  && account.memberships.get(0).travelerId.equals(fields[2])
                  && queue.tripIds.get(0).equals(store.trips.get(0).id)
                : store.trips.isEmpty() && account.memberships.isEmpty() && queue.tripIds.isEmpty();
            if (!actual.equals(wanted) || !stateOK) {
                System.err.printf("FAIL %s wanted=%s actual=%s stateOK=%s%n", fields[0], wanted, actual, stateOK);
                System.exit(1);
            }
            System.out.println(actual);
            passed++;
        }
        System.err.printf("passed=%d/8 failures=0 errors=0 skipped=0%n", passed);
    }
}
