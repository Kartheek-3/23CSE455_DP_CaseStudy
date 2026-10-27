# Change 1 — Dynamic parking-slot allocation (Strategy)

Status: implemented and tested.

- `requirement/README.md` — requirement and how it was met.
- `diff/change1.diff` — unified diff against the baseline (`src/`).
- `test_result/jest_change1.txt` — real Jest output.

Selected policy is chosen at request time; the allocation logic itself is composed
from interchangeable strategy objects.

Command: `npx jest --testPathPatterns "allocation"` → 1 suite, 8 tests passed.
