# Part 2: Pattern evolution and refactoring

Team A13 | Application: Misskey | Baseline commit: `5f501341d49d2bc3fa7e817ce7548a82174326eb`

## Contents

| Path | Content |
|---|---|
| `code/` | Evolved source files (changed and added files only) and `code/README.md` with commit hashes and the production file list per change |
| `changes/Change1` to `Change4` | Per change: `requirement.md`, `diff.patch`, `commit.txt`, `test_result.log`, `metrics.csv`, `pattern_effects.md` |
| `diagrams/Change1` to `Change4` | Class diagrams (`.puml` source and `.png`; `.svg` for Change1) |
| `pattern_evalution.csv` | Pattern instances per version with `status_after_change` (83 rows; baseline, CH01 to CH04) |
| `Pattern_count.csv` | Counts per version: per pattern, total types and total instances |
| `Part2_prompt.text`, `llm/`, `llm.csv` | Prompt, per-change inputs, outputs and verification notes, and the Part 2 AI-use records |

`data/patterns_evolution.csv` and `data/pattern_counts.csv` are copies of `pattern_evalution.csv` and `Pattern_count.csv`.

## Changes

| Change | Feature | Commit | Production LOC before / after | Focused tests |
|---|---|---|---|---|
| CH01 | Native events with RSVP and reminder notifications | `608b45de20dce0a78459025320bfdeb0c4e47a78` | 2704 / 3648 | 21 passed / 21 |
| CH02 | First-class audio posts with transcription | `9a4398a103e392a0ea634eaf521470985985145d` | 2834 / 3981 | 21 passed / 21 |
| CH03 | Context-aware link safety and spam protection | `39e3c987488d59045cc3ed5cfe532f6f32c0936d` | 4350 / 5501 | 29 passed / 29 |
| CH04 | Explainable, user-controlled personalized feed | `b3040278d3e63cf4ced915f9623b95969ff42010` | 3391 / 4488 | 20 passed / 20 |

Values are taken from each `changes/ChangeN/metrics.csv`. Production LOC is a Python SLOC counter over the affected files (excluding comments and blanks); CH02 to CH04 are measured against the preceding change.

## Pattern effects

| Version | Pattern types | Instances | Newly introduced |
|---|---|---|---|
| baseline | 11 | 14 | none |
| CH01 | 12 | 15 | State: RSVP Attendance State Machine |
| CH02 | 12 | 17 | Strategy: Audio Transcription Engine Strategies; State: Audio Transcript Lifecycle State Machine |
| CH03 | 12 | 18 | Strategy: Link Reputation Provider Strategies |
| CH04 | 12 | 19 | Strategy: Recommendation Ranking Strategy |

## Refactorings

- CH01: `EventReminderSchedule` value object replaces scattered timestamp arithmetic.
- CH02: `AudioTranscriptStateMachine` transition table replaces status type codes.
- CH03: central `normalizeUrl` and `validateDestinationSafety` in `LinkSafetyService`.
- CH04: Strategy classes replace ranking-mode conditionals.

## Running the tests

The focused unit tests are in `code/packages/backend/test/unit/` (`EventService`, `AudioTranscriptService`, `LinkSafetyService`, `RecommendationService`). They run with the Misskey backend test setup against in-memory repository doubles (PostgreSQL and Redis were not available when the logs were recorded). Recorded output is in each `changes/ChangeN/test_result.log`.

