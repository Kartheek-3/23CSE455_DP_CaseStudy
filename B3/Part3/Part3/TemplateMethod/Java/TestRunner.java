
import java.util.Map;

public class TestRunner {
    public static void main(String[] args) {
        Map<String, Object> allowed =
            new CreateJobMutation().mutate(true, "Developer");
        assert allowed.get("success").equals(true);
        assert allowed.get("type").equals("job");
        System.out.println("PASS: Allowed mutation");

        Map<String, Object> updated =
            new UpdateJobMutation().mutate(true, "Engineer");
        assert updated.get("success").equals(true);
        assert updated.get("type").equals("updated_job");
        System.out.println("PASS: Update mutation");

        Map<String, Object> denied =
            new CreateJobMutation().mutate(false, "Denied");
        assert denied.get("success").equals(false);
        assert denied.get("error").equals("Permission denied");
        System.out.println("PASS: Permission denial returns error payload");

        System.out.println("All 3 Template Method tests passed.");
    }
}
