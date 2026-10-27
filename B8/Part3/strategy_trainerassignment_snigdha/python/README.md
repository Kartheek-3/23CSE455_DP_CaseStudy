# Strategy Pattern – Trainer Assignment (Python)

## Purpose
The Strategy pattern lets the application change how it selects a trainer without changing the assignment service.

## Pattern roles
- **Strategy:** `TrainerAssignmentPolicy`
- **Concrete strategies:** `SpecializationMatchPolicy`, `LeastLoadedPolicy`, `HighestRatedPolicy`
- **Context:** `TrainerAssignmentService`
- **Data model:** `Trainer`

All policies share the same eligibility rule: a trainer must be active and have capacity.

## Run tests
Requires Python 3.8+; no third-party packages are needed.

```bash
python -m unittest -v
```

Run the command from this `python` folder.

## Note
This is a standalone educational implementation. It demonstrates policy selection and does not connect to the Gym Management System database or API.
