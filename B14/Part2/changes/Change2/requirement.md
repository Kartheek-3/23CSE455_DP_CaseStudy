# CH02: Modularize Publication Validation

## Type
Refactoring and behavior preservation.

## Problem Statement
The `publicationErrors()` function in `features/posts/publication.ts` coordinates multiple publication checks, including title validation, article-content validation, excerpt validation, author assignment, cover-image validation, and editorial review. Keeping title and article-content rules inline makes those responsibilities harder to isolate and maintain.

## Requirement
Refactor the title and article-content validation logic into small, named helper functions while preserving existing behavior.

## Acceptance Criteria
- Existing title length and placeholder-title checks remain unchanged.
- Article readability, minimum word count, and filler-content checks remain unchanged.
- Existing field names and error messages remain unchanged.
- Slug uniqueness, author checks, image checks, and editorial review are unaffected.
- Tests verify that existing validation behavior is preserved.
- TypeScript typechecking and the full test suite pass.

## Pattern Effects
The intended effect is improved separation of concerns. Do not claim a GoF pattern was introduced unless the final implementation supports that classification.

## Baseline Evidence
- Test file: `__tests__/features/posts/publication.test.ts`
- Baseline result: 30 tests passed.
- Evidence log: `evidence/before-tests.log`
