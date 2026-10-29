# Change 1 — Observer Pattern

## Requirement
Introduce an observer mechanism so that job-creation events can notify interested observers without tightly coupling the job creation view to every notification action.

## Implementation
- Added `jobsapp/observers.py`.
- Defined the observer protocol, logging observer, subject, and shared subject instance.
- Connected the subject to `JobCreateAPIView.perform_create`.
- Added observer unit tests.

## Evidence
- `source_changes.patch`
- `CH01_Observer_test_result.txt`

## Scope note
The patch includes changes to `jobsapp/api/views/employer.py`, which is also modified in Change 3. The patch is a comparison against the original baseline, so it can include other edits in that shared file.
