# CH02 — Implementation Record

## Summary
Extracted title validation and article word-count validation from `publicationErrors()` into two named helper functions in `features/posts/publication.ts`.

## Files Changed
- `features/posts/publication.ts`

## Refactoring
- Added `validatePublicationTitle()` for title-length and placeholder-title checks.
- Added `validatePublicationContent()` for the minimum readable article word-count check.
- Kept existing validation messages and surrounding checks unchanged.
- No new GoF design pattern is claimed.

## Verification
- Baseline publication tests: 30 passed.
- After-refactoring publication tests: 30 passed.
- TypeScript typecheck: passed.
- Full test suite after refactoring: 88 test files passed; 1,022 tests passed.

## Evidence
- `evidence/before-tests.log`
- `evidence/after-tests.log`
- `evidence/after-full-tests.log`

## Git
- Branch: `part2/ch02-publishing-workflow`
- Commit: `7be15fb`
- Message: `refactor: extract publication validation helpers`

## Scope Note
This change extracts two validation responsibilities without intentionally changing publication behavior. The existing tests passed, but passing tests alone does not prove every possible input behaves identically.
