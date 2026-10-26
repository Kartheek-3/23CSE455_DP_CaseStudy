# CH01: Refactor AI Provider Selection

## Type
Refactoring and behavior preservation.

## Problem Statement
The `features/ai-assistant/llmService.ts` file contains repeated conditional logic for selecting Claude, OpenAI, and Gemini. Model-to-provider selection also relies on model-name prefixes in multiple functions. This duplication makes future provider changes harder to maintain and increases the risk of inconsistent behavior.

## Requirement
Refactor the existing AI provider-selection logic to reduce duplication and improve maintainability while preserving existing provider-specific operations and their behavior.

## Acceptance Criteria
- Supported providers continue to work.
- Existing model IDs and legacy Gemini model handling remain compatible.
- Streaming, blog generation, chat-title generation, and API-key validation retain their existing behavior.
- Automated tests cover the refactored selection logic.
- TypeScript typechecking succeeds.
- The full test suite passes, or any failures are investigated and documented.
- Before-and-after code changes, test results, and pattern effects are recorded.

## Expected Pattern Evolution
The existing implicit Strategy implementation may become more consistent through centralized selection logic. Any claim that the Strategy pattern was extended or improved must be supported by the final implementation.

## Baseline Evidence
- Focused test file: `__tests__/ai-assistant/llmService.test.ts`
- Baseline result: 20 tests passed.
- Evidence log: `evidence/before-tests.log`
