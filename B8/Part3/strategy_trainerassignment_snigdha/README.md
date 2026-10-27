# Strategy – Trainer Assignment Policy (Java)

## Purpose
This Java example represents the `Strategy – Trainer assignment policy` instance in the project's pattern-evolution CSV. It makes trainer selection rules interchangeable.

## Pattern roles
- **Strategy:** `TrainerAssignmentPolicy`
- **Concrete strategies:** `SpecializationMatchPolicy`, `LeastLoadedPolicy`, `HighestRatedPolicy`
- **Context:** `TrainerAssignmentService`
- **Client:** `TrainerAssignmentTest` (stands in for the assignment route/UI selecting a policy)

## Shared eligibility rule
All strategies only consider trainers who are active and have fewer clients than their maximum. The strategies then apply different selection rules: specialization match, lowest workload, or highest rating.

## Files
- `java/TrainerAssignmentStrategy.java` – pattern implementation.
- `java/TrainerAssignmentTest.java` – executable test runner.

## Run
Requires a JDK (Java 8 or later). From this `java` directory:

```bash
javac TrainerAssignmentStrategy.java TrainerAssignmentTest.java
java TrainerAssignmentTest
```

Expected output:

```text
All TrainerAssignmentStrategy tests passed.
```

## Notes
This is a self-contained Java teaching implementation of the policy structure documented in the source project. It does not connect to the FastAPI backend or database. The CSV also lists availability/conflict eligibility in the wider assignment feature; this small cross-language example focuses on the interchangeable selection policies and shared active/capacity eligibility rule.
