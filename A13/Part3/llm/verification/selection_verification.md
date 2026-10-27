# Verification: pattern scope and source checks (prompts 1-5)

Model output being checked: `Part3/llm/outputs/selection_phase_output.md`.
"Checked by the assistant" means the assistant ran the command named here and read the result.
Evaluation in `data/llm.csv`: AI-assisted label recorded 2026-10-11 (see `human_review_checklist.md`).

## Claims and how each was checked

| claim in the output | how it was checked | result |
|---|---|---|
| `audit-input/patterns.csv` has 22 rows and 17 distinct pattern names (not 23) | read with Python's `csv` module; `wc -l` gives 23 because of the header line; `pattern_counts.csv` also sums to 22 | holds; the "23" in the original request was the line count |
| Misskey HEAD is `53ac6808ae4921305e761c545863ee6593edd1f4` and the tree is clean | `git rev-parse HEAD`, `git status --short` (empty), repeated at the start of implementation | holds |
| the audit's source locations still hold at HEAD for the 15 chosen instances | `sed -n`/`grep -n` on each file at HEAD; the line numbers are cited in each pattern README | holds, with line numbers corrected in the READMEs where the audit's were approximate (e.g. `GlobalEventService.ts:352-361`, `analytics.ts:21-26`) |
| Mediator, Object Pool and the streaming connection factory are uncertain, not confirmed | taken from `audit-results/validation.csv` and its reasons; `streaming.ts` was not re-read in this session | not independently re-verified |
| Repository is a TypeORM idiom plus `MiRepository.insertOne` and DI wiring | read `models/_.ts:80-100`, `RepositoryModule.ts:91-95`, type aliases at `_.ts:184,229`, and a count of `insertOne` call sites (40) | holds |
| Service Layer evidence (`AnnouncementService` and its endpoint) | read `AnnouncementService.ts:10-224` and `admin/announcements/create.ts:66-76`; 76 `*Service.ts` files counted under `core/` | holds for this service only; others were not read |
| the code index was fresh | index metadata for the cited files matched the checked-out commit | holds; the tool itself calls this a best-effort signal |

## Corrections made while working
- "15 patterns" in an early answer meant types; there are 22 instances. The final scope is 15 types with one representative each (the report template asks for one per confirmed type), and the unused confirmed Observer instances are named in the Observer README.
- Early drafts cited the audit's line ranges. Several were adjusted after reading HEAD (see the table).
- The input's Observer instance path `components/deck/column.vue` does not exist; the real path is `ui/deck/column.vue` (already noted in the audit). That instance was not selected.

## Provenance of the audit input
The audit input (`audit-input/`, `audit-results/`) is a preliminary result that was supplied to the session; it was not produced in it.
