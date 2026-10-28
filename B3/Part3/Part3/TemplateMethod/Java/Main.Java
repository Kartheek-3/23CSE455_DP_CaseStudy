
import java.util.Map;

class PermissionDeniedError extends RuntimeException {
    PermissionDeniedError(String message) {
        super(message);
    }
}

abstract class MutationMixin {
    public final Map<String, Object> mutate(
            boolean allowed, String name) {
        try {
            checkPermissions(allowed);
            return resolveMutation(name);
        } catch (PermissionDeniedError e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    protected void checkPermissions(boolean allowed) {
        if (!allowed) {
            throw new PermissionDeniedError("Permission denied");
        }
    }

    protected abstract Map<String, Object> resolveMutation(String name);
}

class CreateJobMutation extends MutationMixin {
    protected Map<String, Object> resolveMutation(String name) {
        return Map.of("success", true, "type", "job", "name", name);
    }
}

class UpdateJobMutation extends MutationMixin {
    protected Map<String, Object> resolveMutation(String name) {
        return Map.of("success", true, "type", "updated_job", "name", name);
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new CreateJobMutation().mutate(true, "Developer"));
        System.out.println(new UpdateJobMutation().mutate(true, "Engineer"));
        System.out.println(new CreateJobMutation().mutate(false, "Denied"));
    }
}
