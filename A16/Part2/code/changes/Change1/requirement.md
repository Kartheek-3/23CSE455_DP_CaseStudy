# Change1: Extend appointment workflow with Doctor, Laboratory and Pharmacy services

## Requirement

Add Doctor profiles and require appointment doctor validation; add independent Laboratory and Pharmacy order resources linked by patient and appointment IDs. Register services in Eureka, route them through Gateway, preserve per-service repositories and storage.

## Acceptance evidence

- API behavior and persistence are implemented in `../../evolved/`.
- Unit/build results are recorded in `../../../../data/test_result/Change1/` after verification.
- The source-version pattern rows and count deltas are recorded once in the part-level `pattern_evaluation.csv` and `Pattern_count.csv`.
