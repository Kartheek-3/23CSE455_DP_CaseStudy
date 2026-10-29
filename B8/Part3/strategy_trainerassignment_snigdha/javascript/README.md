# Strategy Pattern – Trainer Assignment (JavaScript)

## Pattern roles
- **Strategy:** `TrainerAssignmentPolicy`
- **Concrete strategies:** `SpecializationMatchPolicy`, `LeastLoadedPolicy`, `HighestRatedPolicy`
- **Context:** `TrainerAssignmentService`
- **Data model:** `Trainer`

All strategies filter out inactive trainers and trainers at capacity.

## Run tests
Requires Node.js 18+; no npm packages are required.

```bash
node trainerAssignment.test.js
```

Run the command from this `javascript` folder.

## Note
Standalone educational code; it does not connect to the Gym Management System API or database.
