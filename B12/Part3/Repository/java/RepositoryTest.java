// Tests for the Repository cross-language snippet (shared cases).

public class RepositoryTest {
    private static int passed = 0;
    private static int total = 0;

    private static void check(String label, long actual, long expected) {
        total += 1;
        if (actual != expected) {
            throw new AssertionError(
                label + ": expected " + expected + " got " + actual);
        }
        passed += 1;
    }

    public static void main(String[] args) {
        UserService service = new UserService(new InMemoryUserRepository());

        service.register(new User(1, "Ada"));
        check("find-name", service.get(1).name.equals("Ada") ? 1 : 0, 1);
        check("all-1", service.all().size(), 1);

        service.register(new User(2, "Bob"));
        check("all-2", service.all().size(), 2);

        check("missing", service.get(99) == null ? 1 : 0, 1);

        service.register(new User(1, "Ada2"));
        check("overwrite-count", service.all().size(), 2);
        check("overwrite-name", service.get(1).name.equals("Ada2") ? 1 : 0, 1);

        service.remove(1);
        check("deleted", service.get(1) == null ? 1 : 0, 1);
        check("all-after-delete", service.all().size(), 1);

        System.out.println("REPOSITORY_JAVA PASS " + passed + "/" + total);
    }
}
