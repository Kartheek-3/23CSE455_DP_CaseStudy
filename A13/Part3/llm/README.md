# Part 3 LLM records

Model for all records: Claude Sonnet 5.5 (`claude-sonnet-5-5`). The records are the Part 3 rows of `data/llm.csv` (also in `llm.csv` here).

| File | Content |
|---|---|
| `part3_prompt.txt` | Prompts 1-9 of the first Part 3 session (2026-10-10). |
| `inputs/part3_inputs.md` | Supplied inputs (assignment files, audit results, Misskey source files) with SHA-256 hashes and the source commit. |
| `outputs/selection_phase_output.md`, `implementation_phase_output.md`, `review_phase_output.md` | Assistant text for prompts 1-5, 6 and 7-8, with the generator scripts. Tool calls and results are not included. |
| `verification_session_prompts.txt`, `outputs/verification_session_output.md` | Prompts V1-V2 of the 2026-10-11 verification session and the assistant text for them (row 5). |
| `deliverables_session_prompts.txt` | Prompts D3 and D5. D3 produced `A13_slide.pdf` (row 6); D5 produced `../A13_Part3_Report.pdf` (row 7); the generated PDFs are the outputs of those rows. |
| `llm.csv`, `pattern_crosslanguage.csv` | Part 3 rows of `data/llm.csv` and a copy of `data/cross_language.csv`, at the paths named in the assignment tree. |
| `A13_slide.pdf`, `slide_outline.md` | AI-generated slide deck and the outline it follows. |
| `verification/` | How claims and generated code were checked and corrected; `human_review_checklist.md` is the main record. |

The prompt files and output extracts in this folder are edited copies of the session records, not verbatim text.

The review entries in `verification/human_review_checklist.md` were completed by Sreehari M, who reports using ChatGPT for them; no prompt or output file of that use is in the repository.
