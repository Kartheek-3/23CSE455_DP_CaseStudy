# Change3: Add Notification service and workflow notifications

## Requirement

Record notification deliveries for appointment confirmation/cancellation and payment outcomes. Keep notifications best-effort so notification downtime does not undo appointment or invoice state. The local sender is a deterministic logging adapter; real transport can be added behind NotificationSender.

## Acceptance evidence

- API behavior and persistence are implemented in `../../evolved/`.
- Unit/build results are recorded in `../../../../data/test_result/Change3/` after verification.
- The source-version pattern rows and count deltas are recorded once in the part-level `pattern_evaluation.csv` and `Pattern_count.csv`.
