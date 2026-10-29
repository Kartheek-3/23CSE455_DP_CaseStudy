
import java.util.Map;

public class TestRunner {
    static Map<String, Object> user(int id, String role) {
        return Map.of("id", id, "role", role);
    }

    static Map<String, Object> job(int id, int ownerId) {
        return Map.of("id", id, "owner_id", ownerId);
    }

    static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    public static void main(String[] args) {
        var employer = user(1, "employer");
        var employee = user(2, "employee");
        var otherEmployer = user(3, "employer");
        var posting = job(101, 1);

        check(new IsEmployer().hasPermission(employer, null), "Employer allowed");
        check(!new IsEmployer().hasPermission(employee, null), "Employee denied");
        System.out.println("PASS: Employer permission");

        check(new IsEmployee().hasPermission(employee, null), "Employee allowed");
        check(!new IsEmployee().hasPermission(employer, null), "Employer denied");
        System.out.println("PASS: Employee permission");

        check(new IsJobCreator().hasPermission(employer, posting), "Owner allowed");
        check(!new IsJobCreator().hasPermission(otherEmployer, posting), "Non-owner denied");
        check(!new IsJobCreator().hasPermission(employer, null), "Missing job denied");
        System.out.println("PASS: Job creator permission");

        System.out.println("All Strategy tests passed.");
    }
}
