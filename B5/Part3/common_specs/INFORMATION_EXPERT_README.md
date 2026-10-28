# P01 Information Expert — frozen common specification

Selected DaPlanStan pattern: **Information Expert (GRASP)** — **Parsed Email to Trip Record Linking**.

- `information_expert_cases.tsv`: 10 input columns and exactly I01–I08, each row independent. A literal `~` is absent.
- `information_expert_expected.tsv`: `case_id, action, item ID or error, name, confirmation reference, inbox ID` for successful rows; three fields for error rows.
- ASCII case-insensitive matching is restricted to the same trip. Existing nonblank reference and inbox ID are preserved, missing values filled, and unmatched records create one confirmed item with ID `item-<case_id>`.
- The matching and linking responsibility must stay in `InboxItem`; `InboxReviewController` only invokes it.
- Existing candidate records are initialized in `idea` status for the simplified input; linking must not change that status. New records must have `confirmed` status.
- I01 covers missing reference/inbox; I02 new; I03 existing reference; I04 cross-trip isolation; I05 absent provider; I06 mixed case; I07 existing inbox link; I08 missing incoming reference.
- All four test runners independently verify output AND resulting object state, including error/no-mutation.
- No database, network, Expense, Anthropic or live email.

Frozen SHA-256:

- `information_expert_cases.tsv`: `c12f408f1d5c3e9e19e35d3e3b5e415a9fc8af0cbef726692033115370257657`
- `information_expert_expected.tsv`: `6274eab668f786007555af1f19babeaef6cc8fcf9575cdaabada99f8d3775584`

These hashes were established **before implementing** the four translations. Do not change the expected output to resolve a source-code failure.
