# P03 — Controller (GRASP): frozen common fixtures

Source-confirmed instance: **Trip Creation Coordination**. The exact eight scenario cases are in `controller_cases.tsv`, and the one canonical set of expected result lines is in `controller_expected.tsv`. Every Java, Python, JavaScript and C++ runner reads both files at runtime. Do not change either fixture to make an implementation pass.

## Layout

`controller_cases.tsv` header: `case_id`, `user_id`, `owner_traveler_id`, `title`, `start_date`, `end_date`.

`controller_expected.tsv` header: `case_id`, `status`, `trip_id_or_error`, `normalized_title`, `owner_traveler_id`, `owner_role`, `cover_task`. A successful data row has seven TSV fields; an error data row has three. `~` marks absent input. Whitespace inside a title is significant until it is trimmed by the domain workflow. Each fixture case is processed with a fresh in-memory Account, TripStore and CoverTaskQueue.

## Frozen cases

- C01: 2026-11-16 to 2026-11-18 → trip-C01 with owner membership and queued cover task.
- C02: missing user → `ERROR UNAUTHENTICATED`.
- C03: missing owner traveler → `ERROR MISSING_OWNER`.
- C04: blank/whitespace title → `ERROR MISSING_TITLE`.
- C05: 2026-02-30 → `ERROR INVALID_DATE`.
- C06: end before start → `ERROR INVALID_DATE_RANGE`.
- C07: same-day trip → success with one of each side effect.
- C08: source title has exactly two surrounding spaces: `  City Break  ` → stored title `City Break`.

All output is UTF-8 TSV. Success: `case_id CREATED trip-<case_id> trimmed_title owner_traveler_id owner COVER_QUEUED`; failure: `case_id ERROR error_code`.

## Immutable fixture checksums (SHA-256)

- `controller_cases.tsv`: `89d26a4cf16f1fdc84b1f279c637197d622f7a1f42a279153adccd86481040f2`
- `controller_expected.tsv`: `55dc3248a0b492f4ee297bbf23eeffdc9422bae8bdf0a5e507ac165cb72544f5`

## Atomicity contract

The controller must complete all validation before mutating any in-memory collaborator. On success exactly one Trip is added to TripStore, one owner TripMember is recorded in Account, and exactly one trip ID is queued with CoverTaskQueue. On any of the defined validation errors no collaborator is mutated. This intentionally models only the core GRASP Controller responsibility, not database transaction failure handling.
