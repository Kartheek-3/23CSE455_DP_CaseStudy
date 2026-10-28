# CH02 — Advanced Access-Control Policies (ABAC)

## Requirement
Replace the ad-hoc `if user.is_superuser or project.is_published` guards scattered
across endpoint handlers with a centralised Attribute-Based Access Control (ABAC)
engine that supports role, embargo, and publication-state conditions.

## Acceptance Criteria
1. `SuperuserRule.evaluate(ctx)` returns `ALLOW` when `ctx.user_is_superuser = True`.
2. `ProjectOwnerRule.evaluate(ctx)` returns `ALLOW` when `ctx.user_project_role == Role.OWNER`.
3. `EmbargoPolicyRule.evaluate(ctx)` returns `DENY` before embargo expiry, `ALLOW` after.
4. `RoleBasedRule.evaluate(ctx)` returns `ALLOW` for OWNER/MANAGER; `DENY` for VIEWER on write actions.
5. `AccessPolicyEngine.evaluate_chain(ctx, rules)` short-circuits on first `ALLOW`/`DENY`.

## Source Files Changed
| File | Status | Description |
|------|--------|-------------|
| `backend/app/core/policy_engine.py` | **new** | Full ABAC engine with Strategy + Chain of Responsibility |
| `backend/app/api/deps.py` | **modified** | Added `require_access` dependency that calls engine |

## Run Command
```bash
python3 -m pytest backend/app/tests/test_policy_engine.py -v
```

## Test Result
```
PASSED  test_superuser_bypasses_all
PASSED  test_owner_allowed
PASSED  test_embargo_deny_before_expiry
PASSED  test_embargo_allow_after_expiry
PASSED  test_role_based_viewer_denied_write
PASSED  test_chain_short_circuits_on_allow
6 passed in 0.38s
```
