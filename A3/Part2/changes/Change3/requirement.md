# CH03: Configurable high-value rule

## Acceptance criteria

Internal and bill payments are rejected above the inclusive configured limit. A limit equal to the amount passes; zero/negative configuration is invalid. Existing balance and positive-amount checks still apply.

## Pattern effect

Chain of Responsibility is newly introduced; atomic service is extended by injection. No claim of global fraud-engine coverage.

## Refactoring

Extract linked risk handlers and inject ITransferRule at the composition root. A failed rule short-circuits before downstream handlers and before balance mutation.

## Tests

Threshold boundary, threshold breach, insufficient funds, zero/negative amounts, invalid configuration and short-circuit behavior are covered.

Final-snapshot suite: 26/26 passed. Original suite: 129/129 before and 129/129 after. See `data/test_result/` from team root. Intermediate snapshot full test runs are not claimed.

Before: after_change2. After: after_change3. See exact `diff.patch` and SHA-256 `snapshot.json`; patches are ordered.
