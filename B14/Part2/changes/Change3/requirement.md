# CH03: Refactor AI Response JSON Parsing

## Type
Refactoring and behavior preservation.

## Problem Statement
The AI blog-generation functions independently clean and parse JSON responses and handle invalid JSON. This duplicates parsing logic and makes future maintenance harder.

## Requirement
Extract shared JSON response parsing into a reusable helper while preserving existing parsing behavior and error handling.

## Acceptance Criteria
- Both applicable blog-generation functions use the shared parser.
- Markdown code-fence removal is preserved where applicable.
- Invalid JSON continues to produce the existing error behavior.
- Provider-specific response handling remains unchanged.
- Automated tests cover the shared parsing behavior.
- TypeScript typechecking succeeds.
- Focused and full test results are recorded.
- Before-and-after code evidence and pattern effects are documented.

## Pattern Effects
The refactoring centralizes a shared responsibility. Do not claim a GoF pattern was introduced unless the implementation supports that classification.

## Source File
features/ai-assistant/llmService.ts

## Baseline Evidence
- Focused test file: __tests__/ai-assistant/llmService.test.ts
- Record the verified baseline test result and commit before final submission.
