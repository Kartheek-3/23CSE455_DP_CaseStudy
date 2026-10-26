# CH01 — Dataset Versioning

## Requirement
Maintain an immutable, chronologically ordered history of every `DataProduct`
state (metadata, filepath, spatial attributes, provenance) across
photogrammetry re-runs and parameter changes.

## Acceptance Criteria
1. `create_snapshot(db, data_product_id)` inserts a new `DataProductVersion` row.
2. `get_version_history(db, data_product_id)` returns all rows ordered newest-first.
3. `checkout_version(db, version_id)` marks one version as `is_current=True` and
   syncs parent `DataProduct` columns.
4. A self-referential `parent_version_id` FK forms a version DAG.

## Source Files Changed
| File | Status | Description |
|------|--------|-------------|
| `backend/app/models/data_product_version.py` | **new** | `DataProductVersion` SQLAlchemy model |
| `backend/app/crud/crud_data_product_version.py` | **new** | `CRUDDataProductVersion` repository class |
| `backend/app/models/data_product.py` | **modified** | Added `versions` backref |

## Run Command
```bash
python3 -m pytest backend/app/tests/test_versioning.py -v
```

## Test Result
```
PASSED  test_create_snapshot
PASSED  test_get_version_history_newest_first
PASSED  test_checkout_version_sets_is_current
3 passed in 0.42s
```
