# Change 3 — State Pattern

## Requirement
Represent applicant status behavior as explicit states and validate status transitions instead of embedding all transition rules directly in the API view.

## Implementation
- Added `jobsapp/application_states.py`.
- Added the abstract application state and Pending, Accepted, and Rejected states.
- Added `ApplicationStateFactory`.
- Integrated state resolution and transition validation into `UpdateApplicantStatusAPIView`.
- Added state-transition tests.

## Evidence
- `source_changes.patch`
- `CH03_State_test_result.txt`

## Scope note
The patch includes `jobsapp/api/views/employer.py`, a shared file also changed in Change 1. It is a baseline-to-current comparison and can therefore include edits associated with both changes.
