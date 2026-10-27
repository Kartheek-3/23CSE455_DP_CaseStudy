# Change 3: Refactor JSON Parsing in AI Blog Generation

## Objective
Remove duplicated JSON response parsing and error-handling logic from the AI blog-generation functions.

## Code Smell
Duplicated code: `generateBlogPost()` and `generateBlogPostHeadless()` independently cleaned JSON responses, parsed them, and handled invalid JSON errors.

## Refactoring
Extracted a shared `parseGeneratedPostJson(rawJson: string): GeneratedPostData` helper in `features/ai-assistant/llmService.ts`.

Both generation functions now call this helper where shared parsing is appropriate. Provider-specific response handling remains in the respective functions.

## Behavior Preservation
The refactoring preserves JSON parsing, removal of Markdown code fences where applicable, and the existing invalid-JSON error behavior.

## Validation
- Focused test file: `__tests__/ai-assistant/llmService.test.ts`
- Focused tests: 20 passed
- Full test suite: 1,022 tests passed across 88 test files
- TypeScript check: passed
- `git diff --check`: passed

## Source File
`features/ai-assistant/llmService.ts`

## Evidence
- `evidence/after-tests.log`
- `full-after-tests.log`
