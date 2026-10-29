# Change 2 — Strategy Pattern

## Requirement
Encapsulate recruiter authorization in a reusable permission class and expose a recruiter-specific GraphQL query.

## Implementation
- Added or updated `IsRecruiter` in `jobsapp/graphql/permissions.py`.
- Added the recruiter jobs field and resolver in `jobsapp/graphql/queries.py`.
- Added permission and GraphQL query tests.

## Evidence
- `source_changes.patch`
- `CH02_permission_test_result.txt`
- `CH02_GraphQL_permission_test_result.txt`
- `CH02_GraphQL_integration_test_result.txt`

## Classification note
This case study classifies the recruiter authorization policy as Strategy. In the report, explain the actual implementation and avoid claiming multiple interchangeable concrete strategies exist unless the code demonstrates them.
