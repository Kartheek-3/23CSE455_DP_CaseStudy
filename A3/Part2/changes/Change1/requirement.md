# CH01: Recovery-code second factor

## Acceptance criteria

Existing login keeps the password step and pending two-factor identity. User can choose an authenticator or one-time recovery code. Codes may be regenerated only after password confirmation on the authorized settings page.

## Pattern effect

Strategy is newly introduced; all six baseline collaborations remain.

## Refactoring

Extract Strategy from the direct authenticator call. Identity remains responsible for credential and token handling.

## Tests

Authenticator normalization, provider delegation, empty/failed code behavior and real Identity one-time redemption/replacement are covered by native tests.

Final-snapshot suite: 26/26 passed. Original suite: 129/129 before and 129/129 after. See `data/test_result/` from team root. Intermediate snapshot full test runs are not claimed.

Before: pinned upstream baseline. After: after_change1. See exact `diff.patch` and SHA-256 `snapshot.json`; patches are ordered.
