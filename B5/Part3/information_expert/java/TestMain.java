import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public final class TestMain {
    private static String snapshot(List<TripItem> items) {
        StringBuilder result = new StringBuilder();
        for (TripItem item : items) {
            result.append(item.id).append('|').append(item.tripId).append('|').append(item.name)
                .append('|').append(item.confirmationRef).append('|').append(item.inboxId)
                .append('|').append(item.status).append(';');
        }
        return result.toString();
    }
    public static void main(String[] args) throws Exception {
        Path root = Path.of("../../common_specs");
        List<String> cases = Files.readAllLines(root.resolve("information_expert_cases.tsv"), StandardCharsets.UTF_8);
        List<String> expected = Files.readAllLines(root.resolve("information_expert_expected.tsv"), StandardCharsets.UTF_8);
        if (cases.size() != 9 || expected.size() != 9) throw new IllegalStateException("Expected 8 cases");
        for (int index = 1; index < cases.size(); index++) {
            String[] f = cases.get(index).split("\t", -1);
            if (f.length != 10) throw new IllegalStateException("Invalid case field count");
            Trip trip = new Trip(f[2]);
            if (!f[5].equals("~")) trip.items.add(new TripItem(f[5], f[6], f[7], f[8], f[9], "idea"));
            int countBefore = trip.items.size();
            String before = snapshot(trip.items);
            InboxItem inbox = new InboxItem(f[1], f[2], f[3], f[4]);
            String actual = new InboxReviewController().review(inbox, trip, f[0]);
            String action = actual.split("\t", -1)[1];
            boolean stateOk;
            if (action.equals("ERROR")) {
                stateOk = snapshot(trip.items).equals(before);
            } else if (action.equals("CREATED")) {
                TripItem item = trip.items.get(trip.items.size() - 1);
                stateOk = trip.items.size() == countBefore + 1
                    && snapshot(trip.items.subList(0, countBefore)).equals(before)
                    && item.id.equals("item-" + f[0]) && item.tripId.equals(f[2])
                    && item.name.equals(f[3].strip()) && item.status.equals("confirmed")
                    && item.confirmationRef.equals(InboxItem.display(f[4])) && item.inboxId.equals(f[1]);
            } else {
                TripItem item = trip.items.get(0);
                stateOk = trip.items.size() == countBefore && countBefore == 1
                    && item.id.equals(f[5]) && item.tripId.equals(f[6]) && item.name.equals(f[7])
                    && item.status.equals("idea")
                    && item.confirmationRef.equals(f[8].equals("~") ? InboxItem.display(f[4]) : f[8])
                    && item.inboxId.equals(f[9].equals("~") ? f[1] : f[9]);
            }
            if (!actual.equals(expected.get(index)) || !stateOk) {
                System.err.printf("FAIL %s expected=%s actual=%s stateOk=%s%n", f[0], expected.get(index), actual, stateOk);
                System.exit(1);
            }
            System.out.println(actual);
        }
        System.err.println("passed=8/8 failures=0 errors=0 skipped=0");
    }
}
