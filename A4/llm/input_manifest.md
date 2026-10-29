# Final report integration: input manifest

This manifest records the materials reviewed for the consolidated report and final package review on 2026-10-11. It does not claim that unavailable historical model prompts or responses were recovered.

## Primary inputs

- `casestudy.tex` from the working case-study folder; copied to `A4_Report.tex` for the team submission folder.
- `README.md`, `data/llm.csv`, `data/patterns.csv`, `data/pattern_counts.csv`, `data/patterns_evolution.csv`, and `data/cross_language.csv`.
- `Part1/Part1_prompt.txt`, `Part1/Part1_prompt_Sai_Samay.txt`, `Part1/llm/historical_discovery_prompt.txt`, the supplied code context, saved output, and verification artifacts.
- `Part2/Part2_prompt.txt` and `Part3/Part3_prompt.txt` as the task specifications for those sections.
- Part 2 report, evolution metrics, change requirements, diffs, snapshots, and saved test/type-check logs.
- Part 3 report, shared test specification, canonical cross-language dataset, code snippets, saved logs, measurement notes, and verification notes.
- Team roster, batch, work division, and the three Part 1–3 task prompt files.

## Limits

- The Part 1 task specifications are separate from the historical Gemini prompt, which remains preserved under `Part1/llm/`. Sai Samay's role-specific brief is reconstructed and is not a recovered historical transcript. The Part 2 prompt is also a reconstructed reference specification, not a recovered historical transcript.
- Earlier raw model prompts/responses for parts where they were not archived have not been reconstructed.
- The consolidated unique participant-symbol total remains `UNVERIFIED` because inventory participant fields were not normalized into a symbol-level ledger.
- Local LaTeX compiler binaries were unavailable. The `A4_Report.pdf` present in this folder is a text preview, not a compiled rendering of `A4_Report.tex`; compile and visually compare before final upload.
- This manifest identifies inputs reviewed; it does not claim fresh execution of the project test suites. Existing test evidence and the report state their actual run status.


## Follow-up P1 source audit

- Frozen source files opened in `data/code/src/lib/` and `data/code/src/routes/` for entity shape/state, control, configuration, state subscription, and the candidate collaborations listed in `Part1/llm/p1_discovery_audit.md`.
- Outputs: `Part1/llm/p1_discovery_audit.md` and `Part1/llm/patterns_p1_discovery.csv`, prepared against the current Part 1 task specification. This follow-up remains distinct from the historical Gemini output.
