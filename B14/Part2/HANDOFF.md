# Part 2 handoff — Team B14

## What is present in the repository

- `Part2_prompt.txt`: the original master prompt (retained as the record of the intended scope).
- `changes/Change1`, `Change2`, `Change3`: requirements, implementation notes and test logs.
- `pattern_evolution.csv` and `Pattern_count.csv`: source-based pattern records and counts using the Part 1 schemas.
- `diagrams/pattern-evolution.mmd`: editable diagram source.
- `code/README.md`: map to the actual source commits and explains that `B14/code/` is the original baseline copy.
- `llm.csv`: Part 2 AI-use record; it distinguishes available verification evidence from raw outputs that were not archived.
- `changes/*/evidence/*.patch`: GitHub commit diff archives for each refactor and the separate recommendations feature.

## Actual application commits

Application repository: https://github.com/nivedita-rmsh/nextjs-blog-cms

| Change | Branch | Commit | Actual scope |
|---|---|---|---|
| AI provider inference refactor | `part2/ch01-provider-refactor` | `e7dfd1c` | Extract `inferProviderFromModel()` and use it in blog generation |
| Publication validation refactor | `part2/ch02-publishing-workflow` | `7be15fb` | Extract title and content validation helpers |
| Shared AI JSON parser refactor | `part2/ch03-json-parsing-refactor` | `6ce7157` | Extract `parseGeneratedPostJson()` |
| Related article recommendations (separate feature branch) | `part2/ch01-article-recommendations` | `68cd127` | Related post ranking and UI, with a focused 4-test file |

The three refactor commits are on separate branch histories; CH03 has CH02 as parent. The recommendations commit is separate.

## Important unresolved scope discrepancy

The master prompt specifies CH01 article recommendations, CH02 content moderation, and CH03 subscription/paywall access control. The checked-in change records instead label CH01 as provider inference, CH02 as publication-validation refactoring, and CH03 as AI JSON parsing. The separate recommendations branch implements only the recommendations part. The inspected evidence does not show a content-moderation workflow or a server-side premium-access gate. Do not tell the instructor these two requirements are complete; obtain scope approval or implement them if they remain mandatory.

## Test evidence caveats

- Change 1 full-suite log currently records 1,025 tests passing across 88 files. Its focused `after-tests.log` was later overwritten by a 20-test run while the recommendations branch was checked out; it does not prove the provider-refactor branch's focused result. Rerun the focused test on `part2/ch01-provider-refactor` before treating that log as definitive.
- Change 2 targeted publication tests recorded 30 passing; its full-suite log records 1,022 passing across 88 files.
- Change 3 full-suite log records 1,022 passing across 88 files. The most recent focused `after-tests.log` needs its branch context confirmed before it is presented as evidence specifically for commit `6ce7157`.
- Two existing author-byline tests failed when the pre-commit hook ran on the recommendations branch. The recommendations-specific tests themselves passed. This failure must remain disclosed rather than hidden.
- Part 1 reports local Supabase/Docker and end-to-end testing were unavailable.
- Consistent before/after LOC metrics have not been measured. Do not invent LOC deltas.
- Raw Part 2 LLM output transcripts were not separately archived. `llm.csv` discloses this; preserve actual transcripts if they are available from the chat history.

## Before final submission

1. Confirm with the instructor/team whether the implemented refactor scope is acceptable in place of content moderation and paywall access control.
2. Rerun the focused test logs on each relevant branch so the evidence matches the documented commit.
3. Measure before/after LOC using the same stated rule and tool, or record it as unavailable if time/tooling prevents reliable measurement.
4. Render `diagrams/pattern-evolution.mmd` if the report requires a diagram image.
5. Rebuild `B14_Report.pdf` from the updated `B14_Report.tex`; the existing PDF is not automatically refreshed by a source edit.
6. Pull the latest team `main`, review the changes, and ensure the final commit is pushed.

This handoff is deliberately explicit about limitations; it is safer than claiming features or metrics that are not evidenced.
