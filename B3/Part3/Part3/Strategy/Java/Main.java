
import java.util.Map;

interface PermissionStrategy {
    boolean hasPermission(Map<String, Object> user, Map<String, Object> job);
}

class IsEmployer implements PermissionStrategy {
    public boolean hasPermission(Map<String, Object> user, Map<String, Object> job) {
        return user != null && "employer".equals(user.get("role"));
    }
}

class IsEmployee implements PermissionStrategy {
    public boolean hasPermission(Map<String, Object> user, Map<String, Object> job) {
        return user != null && "employee".equals(user.get("role"));
    }
}

class IsJobCreator implements PermissionStrategy {
    public boolean hasPermission(Map<String, Object> user, Map<String, Object> job) {
        return user != null && job != null
            && user.get("id").equals(job.get("owner_id"));
    }
}

class PermissionChecker {
    static boolean check(PermissionStrategy strategy,
                         Map<String, Object> user,
                         Map<String, Object> job) {
        return strategy.hasPermission(user, job);
    }
}

public class Main {
    static Map<String, Object> user(int id, String role) {
        return Map.of("id", id, "role", role);
    }

    static Map<String, Object> job(int id, int ownerId) {
        return Map.of("id", id, "owner_id", ownerId);
    }

    public static void main(String[] args) {
        var employer = user(1, "employer");
        var employee = user(2, "employee");
        var posting = job(101, 1);

        System.out.println("Employer permission: "
            + PermissionChecker.check(new IsEmployer(), employer, null));
        System.out.println("Employee permission: "
            + PermissionChecker.check(new IsEmployee(), employee, null));
        System.out.println("Job creator permission: "
            + PermissionChecker.check(new IsJobCreator(), employer, posting));
    }
}
