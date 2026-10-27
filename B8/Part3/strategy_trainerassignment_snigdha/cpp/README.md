# Strategy Pattern – Trainer Assignment (C++)

## Pattern roles
- **Strategy:** `TrainerAssignmentPolicy` (abstract base class)
- **Concrete strategies:** `SpecializationMatchPolicy`, `LeastLoadedPolicy`, `HighestRatedPolicy`
- **Context:** `TrainerAssignmentService`
- **Data model:** `Trainer`

Every strategy considers only active trainers who have not reached `maxClients`.

## Compile and run
Requires a C++17 compiler such as g++.

```bash
g++ -std=c++17 -Wall -Wextra TrainerAssignmentTest.cpp -o trainer_test
./trainer_test
```

On Windows PowerShell, run `.	rainer_test.exe` after compiling.

## Note
Standalone educational code; it does not access the Gym Management System database or API.
