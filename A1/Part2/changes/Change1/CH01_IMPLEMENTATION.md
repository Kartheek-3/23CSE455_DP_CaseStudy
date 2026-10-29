# CH01 implementation handoff

CH01 is implemented and validated at feature level. **39 Django tests and 9 JavaScript tests pass.** Normal Django checks complete with one pre-existing settings warning. This is not a clean dependency-environment certification: the preserved baseline requirements contain conflicts, and Firebase credentials are absent. CH02 and CH03 have not been implemented.

## Baseline and delivered files

Repository: https://github.com/HarshavardhanVemali/campus-food-ordering

Confirmed baseline: `83998629e633594037cfa25e583542f9f6f0f968`.

`baseline.tar.gz` is the unmodified archive fetched for this exact commit. `working/` is the separate modified application, including its original assets, migrations and requirements. All 170 baseline files were compared byte-for-byte with the archive. `evidence/provenance.json` records the archive URL and hash; `evidence/baseline-files.sha256.json` records the individual baseline hashes.

Exactly four application files differ:

| File | Change |
| --- | --- |
| `canteenapp/delivery_assignment.py` | Added: Strategy interface, two policies, eligibility query and assignment context/service. |
| `canteenapp/views.py` | Modified: policy dispatch, validation, guarded assignment, existing notification, assignment-page CSRF cookie, optional eligible-personnel filtering. |
| `canteenapp/templates/adminassignorder.html` | Modified: policy selector, selected-order submission, filtered dropdown, validation and error handling. |
| `canteenapp/test_delivery_assignment.py` | Added: 39 Django test methods, several with additional subcases. |

`CH01.diff` is the unified diff against the confirmed baseline. A read-only `git apply --check` against the pristine baseline returned exit 0. `evidence/changed-files.json` provides before/after hashes. No model, migration, production setting, dependency pin, consumer, signal or route was changed. The original placeholder `canteenapp/tests.py` is unchanged.

The Java, Python, JavaScript and C++ demonstrations remain in their existing location, unchanged. All four hashes matched the pre-change snapshot; they were neither incorporated into this implementation nor counted as CH01 tests. See `evidence/preservation-check.log`.

## Genuine Strategy collaboration

`DeliveryAssignmentPolicy.select(candidates, *, email=None)` is the stable abstraction. `ManualAssignmentPolicy` and `LeastWorkloadAssignmentPolicy` implement it. `DeliveryAssignmentService` receives a policy object and delegates selection through that abstraction; its shared responsibility is order validation and persistence. The view selects a registered policy by name. A test also injects a third policy into the context to verify delegation independently of the registry.

### Eligibility and selection rules

Both policies consider only actual `DeliveryPerson` rows satisfying all of:

- `is_active=True`;
- `role='delivery_person'`;
- `is_superuser=False`;
- the existing `canteenapp.is_deliveryperson` permission, directly or through a group.

This uses the baseline registration and delivery-login conventions. Active account status is **not** a claim of physical availability, shift attendance, location or capacity. No availability, priority, distance or capacity field is introduced.

**Manual** remains the default if `policy` is absent. It selects the supplied `delivery_personnel` email from the eligible candidate set. It intentionally honors the administrator's choice even when another person has a lower workload.

**Least workload** counts each candidate's assigned orders with `delivery_type='delivery'` and status other than `delivered` or `cancelled`. All nonterminal statuses, including unfamiliar values, count conservatively. Pickup/dining and terminal historical orders do not count. Each order is counted once even if permission joins produce duplicates. The candidate with the lowest count wins; ties use ascending primary key. A stale manual email is ignored for this policy. This gives a deterministic workload proxy using existing data, not an estimate of delivery time or individual capacity.

### Shared order and request behavior

An assignable order must exist, have `delivery_type='delivery'`, `status='confirmed'`, `customer_status='confirmed'`, and no assigned delivery person. These conditions follow the existing assignment queue, with an additional guard against overwriting an assignment. Requests outside this workflow are now rejected, including attempts to revive a terminal order or reassign an already assigned order.

Within a transaction, the service reads the order, delegates selection, and performs a conditional update of `delivery_person`, `status='shipped'` and `updated_at`. The conditional write repeats the eligibility conditions. It deliberately limits persistence to the assignment transition; it does not recalculate prices or edit payment data. It uses `QuerySet.update`, rather than invoking unrelated `Order.save()` behaviors. No new schema is required.

Responses retain the `success` field. Successful responses additionally identify the policy and selected email:

- 200: assignment succeeded;
- 400: malformed/non-object JSON, invalid identifiers, unknown policy or invalid/ineligible manual selection;
- 404: order absent;
- 409: stale/ineligible order or no eligible automatic candidates;
- 503: database operational failure; reload before retrying.

Existing successful manual payloads remain supported:

```json
{"order_id":"EXISTING_ORDER_ID","delivery_personnel":"driver@example.test"}
```

Automatic assignment uses:

```json
{"order_id":"EXISTING_ORDER_ID","policy":"least_workload"}
```

Existing administrator authorization, POST-only restriction and CSRF protection remain in place. Notifications retain the baseline group and event type (`delivery_person_<id>`, `new_order`) and are scheduled after commit. Notification exceptions are logged and do not turn a persisted assignment into a misleading failed response. This does not establish that the existing delivery consumer receives that event.

### UI integration

Manual selection is the initial option. Automatic mode disables the manual dropdown and explains the workload/tie rules. The dropdown requests only eligible candidates using an optional query parameter; the general personnel-management listing retains its existing behavior.

Submission uses `ordersData[currentOrderIndex]`, fixing the assignment path's previous reliance on a duplicated `orderid` DOM identifier that could select the first row. The assignment page now issues a CSRF cookie for a fresh session. The button prevents duplicate pending submissions, restores itself after errors, and displays server validation messages. Network/invalid-response errors instruct the administrator to reload before retrying because a server-side assignment might already have committed.

## Actual validation

Environment: Python 3.12.14, Django 6.0.4, Channels 4.3.2, SQLite 3.53.1, baseline InMemoryChannelLayer. `evidence/environment-freeze.txt` records the complete installed package set.

From `CH01/working`, with the validation virtual environment at `CH01/venv`:

| Executed command | Result | Evidence |
| --- | --- | --- |
| `../venv/bin/python manage.py check` | Exit 0; one existing allauth settings deprecation warning. | `evidence/check-default-final.log` |
| `../venv/bin/python manage.py test canteenapp.test_delivery_assignment --verbosity 2 --noinput` | Exit 0; **39 tests, OK**, 0.294 seconds reported by Django. | `evidence/tests-default-final.log` |
| `../venv/bin/python manage.py makemigrations --check --dry-run` | Exit 0; **No changes detected**. | `evidence/migrations-check.log` |
| `node ch01/verification/test_assignment_ui.cjs` (workspace root) | Exit 0; **9 tests pass**. | `evidence/ui-tests.log` |
| `ch01/venv/bin/python -m pip check` (workspace root) | Exit 1; six unresolved baseline dependency conflicts. | `evidence/pip-check-final.log` |

The final Django run uses **normal `canteen.settings` and normal project URLs**. It does not use the interim scoped test settings or replace the assignment implementation. Tests use real Django models/migrations, an isolated test database, actual authorization/CSRF behavior, and the InMemoryChannelLayer. Individual tests mock notification/database failures to test error behavior; a separate test verifies the preserved channel event with the real in-memory layer.

Coverage includes policy registration and delegation, manual compatibility, unequal loads, zero/nonzero ties, all nonterminal statuses, ignored terminal/non-delivery work, eligibility exclusions, group permissions, duplicate permission paths, no candidates, missing/invalid inputs, stale/terminal orders, repeat assignment, authorization, CSRF rejection and valid CSRF submission, queue removal after assignment, template rendering, and notification/database failures.

The JavaScript tests execute the actual template script under Node with DOM/network doubles. They cover selected-order submission, both payloads, toggling, missing selections, server/network/non-JSON errors and repeated clicks. They are **not a browser rendering or live browser end-to-end test**. No such browser result is claimed.

Earlier failed attempts are retained separately. One test expectation initially targeted the wrong Django logger and was corrected. A later CSRF-flow test exposed the missing cookie and drove the assignment-page fix. Interim `ch01_test_settings.py`/`ch01_test_urls.py` isolated Daphne and PhonePe startup while resolving environment issues; they are not required for the final passing command.

## Environment recovery and remaining limitations

The normal requirements installation failed first on the absent default-index PhonePe package, then on missing `pg_config` for the source-built PostgreSQL adapter. A SQLite-oriented validation list retained every other exact baseline pin, including `psycopg2-binary==2.9.12`. Normal resolution of that list still failed because the baseline pins conflict.

For validation only, those preserved pins were installed with `--no-deps`; missing transitive/legacy support packages were installed separately and are pinned in `verification/requirements-validation-extras.txt`. PhonePe **1.1.0**, not a replacement version, came from its published package repository. Cryptography was ultimately constrained to the range required by the baseline PyOpenSSL package, and legacy PayU import support was supplied by setuptools 80.9.0. Production `requirements.txt` was never edited. See `verification/commands.md`, all installation logs, and the final freeze for exact provenance. This workaround is not a recommended production dependency solution.

Unresolved items:

1. `pip check` still reports PhonePe's four conflicts with APScheduler/dataclasses-json/requests/urllib3, dataclasses-json versus marshmallow, and grpcio-status versus protobuf. A clean, consistently resolved deployment environment remains blocked until the team approves dependency repair or supplies its compatible locked environment. No baseline pin was silently upgraded or downgraded.
2. Firebase initialization reports the missing service-account file. Assignment tests pass without it; Firebase/push delivery was not validated. The existing event/consumer mismatch is outside CH01: this endpoint publishes to `delivery_person_<id>` with `new_order`, while the active delivery consumer uses `delivery_group` and `delivery_new_order`.
3. The existing allauth setting and legacy `pkg_resources` use produce deprecation warnings. They are unchanged.
4. SQLite ignores row-level `select_for_update`. The conditional write prevents stale overwrite, but parallel transactions can return a database-lock error, and workload balancing is a snapshot policy, not a global concurrency/fairness guarantee. Concurrent administrator load and real shift availability were not validated. A 503 instructs the client to reload/retry.
5. Visual/browser acceptance and real external-service notification checks remain outstanding. The implementation includes UI controls and tested request behavior, not evidence of those unperformed checks.

**Handoff decision:** CH01 source and feature tests are complete for review. Preserve this patch and its independent execution evidence. Resolve the environment/acceptance limitations before treating the whole application as deployment-ready; no CH02 or CH03 work is included.
