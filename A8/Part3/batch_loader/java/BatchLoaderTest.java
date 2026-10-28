import java.util.List;

public class BatchLoaderTest {

    private static int passed = 0;
    private static int failed = 0;

    private static void check(String testName, String expected, String actual) {
        if (expected.equals(actual)) {
            System.out.println("PASS: " + testName);
            passed++;
        } else {
            System.out.println(
                    "FAIL: " + testName
                            + " | expected=" + expected
                            + " | actual=" + actual
            );
            failed++;
        }
    }

    private static String nameOf(BatchLoader.Ticket<User> ticket) {
        return ticket.get() == null ? "null" : ticket.get().name();
    }

    public static void main(String[] args) {
        UserRepository repo = new UserRepository(List.of(
                new User("u1", "Alice"),
                new User("u2", "Bob"),
                new User("u3", "Carol")
        ));
        BatchLoader<String, User> loader = new BatchLoader<>(UserBatch.create(repo));

        BatchLoader.Ticket<User> first = loader.load("u2");
        BatchLoader.Ticket<User> second = loader.load("u1");
        BatchLoader.Ticket<User> duplicate = loader.load("u2");
        BatchLoader.Ticket<User> missing = loader.load("u9");
        loader.dispatch();

        check("Four load requests trigger one repository query", "1", String.valueOf(repo.queries.size()));
        check("Repository receives unique keys in first-seen order", "u2,u1,u9", repo.queries.get(0));
        check("u2 resolves to Bob", "Bob", nameOf(first));
        check("u1 resolves to Alice", "Alice", nameOf(second));
        check("Duplicate u2 request resolves to Bob", "Bob", nameOf(duplicate));
        check("Missing u9 resolves to null", "null", nameOf(missing));

        BatchLoader.Ticket<User> cached = loader.load("u2");
        loader.dispatch();
        check("Repeated u2 load is served from cache without a new query", "1:Bob", repo.queries.size() + ":" + nameOf(cached));

        System.out.println();
        System.out.println("RESULT: " + passed + " passed, " + failed + " failed");

        System.exit(failed > 0 ? 1 : 0);
    }
}
