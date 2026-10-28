import java.util.HashSet;
import java.util.Set;

public class RoleGuardFactory {

    public interface Guard {
        boolean isAuthorized(String userRole);
    }

    public static Guard createGuard(String... allowedRoles) {
        Set<String> roles = new HashSet<>();

        for (String role : allowedRoles) {
            roles.add(role);
        }

        return userRole -> {
            if (userRole == null) {
                return false;
            }

            return roles.contains(userRole);
        };
    }
}