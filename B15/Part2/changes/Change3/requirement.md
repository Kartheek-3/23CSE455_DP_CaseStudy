# CH03 — Experiment Workflow Automation

## Requirement
Automate the end-to-end experiment processing pipeline so that after a raw
data upload completes, the system automatically runs validation, geospatial
processing, policy checks, and STAC publication without manual intervention.

## Acceptance Criteria
1. `ExperimentWorkflowPipeline.run(context)` executes `ValidationStep`,
   `ProcessingStep`, `PolicyCheckStep`, and `PublicationStep` in order.
2. Any step returning `StepResult.FAILURE` halts the pipeline and records
   an error in the job record.
3. `WorkflowStatusObserver` instances are notified on each step transition.
4. A completed pipeline creates a version snapshot via `CRUDDataProductVersion`.

## Source Files Changed
| File | Status | Description |
|------|--------|-------------|
| `backend/app/workflow/pipeline.py` | **new** | `WorkflowStep` ABC + concrete steps + `ExperimentWorkflowPipeline` |
| `backend/app/workflow/observers.py` | **new** | `WorkflowStatusObserver` interface + `JobStatusObserver` implementation |
| `backend/app/tasks/post_upload_tasks.py` | **modified** | Trigger `ExperimentWorkflowPipeline.run()` on upload completion |

## Run Command
```bash
python3 -m pytest backend/app/tests/test_workflow.py -v
```

## Test Result
```
PASSED  test_pipeline_runs_all_steps_in_order
PASSED  test_pipeline_halts_on_validation_failure
PASSED  test_observers_notified_on_step_change
PASSED  test_pipeline_creates_version_snapshot
4 passed in 0.51s
```
