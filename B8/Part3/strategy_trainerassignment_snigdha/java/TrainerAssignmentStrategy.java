import java.util.*;

/** Strategy pattern: trainer selection policy is interchangeable. */
public class TrainerAssignmentStrategy {
    static class Trainer {
        final String name;
        final String specialization;
        final int currentClients;
        final int maxClients;
        final double rating;
        final boolean active;

        Trainer(String name, String specialization, int currentClients,
                int maxClients, double rating, boolean active) {
            this.name = name;
            this.specialization = specialization;
            this.currentClients = currentClients;
            this.maxClients = maxClients;
            this.rating = rating;
            this.active = active;
        }
        boolean eligible() { return active && currentClients < maxClients; }
        public String toString() { return name; }
    }

    // Strategy interface
    interface TrainerAssignmentPolicy {
        Trainer selectTrainer(String memberGoal, List<Trainer> candidates);
    }

    // Concrete strategy 1: match the member's goal to trainer specialization
    static class SpecializationMatchPolicy implements TrainerAssignmentPolicy {
        public Trainer selectTrainer(String memberGoal, List<Trainer> candidates) {
            for (Trainer t : candidates)
                if (t.eligible() && t.specialization.equalsIgnoreCase(memberGoal)) return t;
            return null;
        }
    }

    // Concrete strategy 2: choose the eligible trainer with the lightest workload
    static class LeastLoadedPolicy implements TrainerAssignmentPolicy {
        public Trainer selectTrainer(String memberGoal, List<Trainer> candidates) {
            return candidates.stream().filter(Trainer::eligible)
                    .min(Comparator.comparingInt(t -> t.currentClients)).orElse(null);
        }
    }

    // Concrete strategy 3: choose the highest-rated eligible trainer
    static class HighestRatedPolicy implements TrainerAssignmentPolicy {
        public Trainer selectTrainer(String memberGoal, List<Trainer> candidates) {
            return candidates.stream().filter(Trainer::eligible)
                    .max(Comparator.comparingDouble(t -> t.rating)).orElse(null);
        }
    }

    // Context: uses the selected policy without depending on its concrete class
    static class TrainerAssignmentService {
        private TrainerAssignmentPolicy policy;
        TrainerAssignmentService(TrainerAssignmentPolicy policy) { this.policy = policy; }
        void setPolicy(TrainerAssignmentPolicy policy) { this.policy = policy; }
        Trainer assign(String memberGoal, List<Trainer> candidates) {
            return policy.selectTrainer(memberGoal, candidates);
        }
    }
}
