# Pattern selection and Part 2 reconciliation

## Why these two patterns?
1. **Strategy** is a confirmed GoF Behavioral pattern in Part1 and has direct relevance to Part2 Change 1 (provider inference centralization).
2. **Observer** is a confirmed GoF Behavioral pattern in Part1 and offers a second clear, independent collaboration suitable for equivalent event tests.
3. **RBAC** was intentionally excluded to meet the user's instruction to compare only two patterns.

## Part 2 changes
- **CH01 (AI provider selection):** The implementation record says `inferProviderFromModel()` was added and `generateBlogPost()` was updated to use it; it explicitly notes not every provider-selection branch was refactored. This is related to Strategy's provider selection, but is not by itself proof that the Strategy collaboration's participants changed.
- **CH02 (publication validation):** Named validation helpers were extracted. No GoF pattern was claimed; unrelated to selected Strategy and Observer instances.
- **CH03 (generated-post JSON parsing):** Shared parsing was extracted to `parseGeneratedPostJson()`. This is a refactoring of duplicated parsing logic, not a new pattern claim for this comparison.
- The uploaded Part2 folder contains implementation notes and test logs. The included `code/features/ai-assistant/llmService.ts` source snapshot still shows the original provider-selection branches and does not contain the named CH01/CH03 helpers. Therefore, this Part3 uses Part1's verified baseline behavior and describes Part2 changes from the uploaded evidence without pretending those changes are present in the copied source. If Part2 source changes are merged into the code folder, update this note and re-verify the selected source paths.

## Source mapping
- Strategy: `Part1/patterns.csv`; original source path `code/features/ai-assistant/llmService.ts`, baseline commit `90ec6565877053ee0e93e9f09dcc7c7213aa4832`.
- Observer: `Part1/patterns.csv`; original source paths `code/features/auth/context/AuthProvider.tsx`, `code/features/auth/context/AuthContext.tsx`, and `code/features/auth/hooks/useSession.ts`.
