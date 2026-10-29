import java.util.*;

/** Simple test runner for TrainerAssignmentStrategy. */
public class TrainerAssignmentTest {
    public static void main(String[] args) {
        List<TrainerAssignmentStrategy.Trainer> trainers = Arrays.asList(
            new TrainerAssignmentStrategy.Trainer("Asha", "Strength", 4, 8, 4.7, true),
            new TrainerAssignmentStrategy.Trainer("Ravi", "Yoga", 2, 8, 4.9, true),
            new TrainerAssignmentStrategy.Trainer("Maya", "Strength", 8, 8, 5.0, true),
            new TrainerAssignmentStrategy.Trainer("John", "Strength", 1, 8, 4.2, false)
        );

        TrainerAssignmentStrategy.TrainerAssignmentService service =
            new TrainerAssignmentStrategy.TrainerAssignmentService(
                new TrainerAssignmentStrategy.SpecializationMatchPolicy());
        TrainerAssignmentStrategy.Trainer selected = service.assign("Strength", trainers);
        check("Asha".equals(selected == null ? null : selected.name),
              "Specialization policy should select Asha");

        service.setPolicy(new TrainerAssignmentStrategy.LeastLoadedPolicy());
        selected = service.assign("Strength", trainers);
        check("Ravi".equals(selected == null ? null : selected.name),
              "Least-loaded policy should select Ravi");

        service.setPolicy(new TrainerAssignmentStrategy.HighestRatedPolicy());
        selected = service.assign("Strength", trainers);
        check("Ravi".equals(selected == null ? null : selected.name),
              "Highest-rated policy should select Ravi");

        System.out.println("All TrainerAssignmentStrategy tests passed.");
    }
    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
