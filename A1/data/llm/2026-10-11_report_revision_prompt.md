# Exact prompt — report revision, same session, 2026-10-11 22:08 IST

Tool: Claude app agent session (Claude Opus 5.5 selected; configured identifier `claude-opus-5-5`). This is the second prompt of the report-production session recorded in `2026-10-11_report_generation_prompt.md`. It is not a historical pattern-analysis experiment.

Chat message sent with this prompt (verbatim), together with a screenshot now stored as `data/test_result/github_team_folder_82a5d58.png`:

> not:this screenshot is to paste properly at this section"Team folder and datasets (take a screenshots from the GitHub repository— your team)"

Attached prompt file (verbatim):

---

# FINAL EXECUTION: COMPLETE AND PACKAGE MY A1 DESIGN PATTERNS CASE STUDY

You are continuing an existing Claude Cowork session in which you have already inspected the project files and generated a draft report. Do not restart the project, repeat the forensic audit, or generate a completely different report.

My deadline is today. I need the final report and all required supporting files prepared for submission, with the highest possible academic and technical quality.

**Your job is to finish the existing deliverables, correct errors, preserve the faculty's prescribed structure, and produce one complete, downloadable `A1_Final_Submission.zip`. Do the actual work in the existing workspace rather than returning instructions for me to follow.**

## 1. Project identity

Course: 23CSE455 — Design Patterns Case Study

Team: A1

Topic: Food Delivery Application using Django

Repository: https://github.com/HarshavardhanVemali/campus-food-ordering

Confirmed baseline commit: `83998629e633594037cfa25e583542f9f6f0f968`

All six team members belong to **CSE A**:

- AM.SC.U4CSE23001 — Aadil Nizar
- AM.SC.U4CSE23007 — Adil Najeem
- AM.SC.U4CSE23014 — Athul Yesudas
- AM.SC.U4CSE23039 — Hima C
- AM.SC.U4CSE23046 — M Krishnapriya
- AM.SC.U4CSE23053 — Muhammed Faais A

Correct the batch information everywhere it appears.

## 2. Follow the faculty format exactly

The authoritative documents are:
- `DP_Csestudy_instructions.pdf`
- `DP_Csestudyreport structure.pdf`
- `casestudy.tex`

Use the report and template already supplied in this workspace.

**Do not redesign the report. Do not add sections that the faculty did not request.**

Specifically:
- Remove the opening "At a Glance" summary or equivalent.
- Preserve the prescribed headings, section numbering, order, tables, and required subsections.
- Do not add an executive summary, supplementary conclusion, decorative summary boxes, or a new report structure.
- Make editorial improvements within the existing structure only.
- Ask me about essential missing information instead of leaving avoidable placeholders.

If the two faculty documents genuinely conflict, preserve the prescribed structure and make the smallest defensible choice.

## 3. Finish the existing technical report

Use the actual application source, recovered project ZIP, original CSVs, language demonstrations, CH01 implementation package, diffs, logs, and analysis notes already supplied.

Preserve all verified findings and correct any errors in:
- Pattern classifications and participant mappings.
- Baseline versus evolved application counts.
- File paths, source references, and line numbers.
- CSV schemas and data consistency.
- Cross-language tests, source LOC, complexity, timing, and methodology.
- Citations, references, figure captions, and table numbering.

The baseline contains a Django signal-based Observer-like collaboration for removing unavailable items from carts and Channels-based order-event broadcasting. Distinguish these accurately.

CH01 introduces a Strategy-based delivery-assignment design. Its documented tests report 39 passing Django tests and 9 passing JavaScript tests; verify these figures against the supplied evidence.

CH02 and CH03 must be assessed against every available artifact in this workspace. If genuine implementations, diffs, or test results exist, integrate them. If they do not, do not invent them or describe proposals as completed implementations. Present the actual engineering work clearly and professionally within the faculty's required sections, without adding unnecessary standalone warnings or repeatedly emphasizing limitations.

The goal is a strong, coherent case study supported by real evidence, not a report that merely sounds impressive.

## 4. Improve the writing

Write in precise, natural academic English suitable for a serious undergraduate software engineering case study.

Remove:
- Generic filler and repetitive explanations.
- Inflated claims of novelty or impact.
- Formulaic AI-style transitions.
- Unsupported claims and vague references.
- Redundant headings, excessive bold text, and decorative formatting.

Prefer specific technical explanations, concrete source evidence, meaningful comparisons, and accurate conclusions.

Do not optimize for AI-detector evasion or misrepresent authorship. Prioritize clarity, originality of analysis, factual accuracy, and professional presentation.

## 5. Team contributions

Include the six correct team members and CSE A batch information.

Provide a six-area contribution table only in the location required by the faculty template. Use areas such as baseline analysis, pattern discovery, refactoring, testing, cross-language comparison, and report/repository preparation.

Do not invent a historical contribution record. If individual assignments must be confirmed, ask me one concise question before finalizing that table. Do not invent names, roll numbers, or contribution claims.

## 6. Include the repository screenshot

I have attached the screenshot intended for the final repository-screenshot section.

Use the actual supplied screenshot in the exact section requested by the faculty template:
- Preserve its aspect ratio.
- Make its contents legible.
- Use an accurate caption.
- Store it inside the `A1/` folder and use a valid relative image path.
- Do not claim a pull request exists unless the screenshot or another source confirms it.

If the screenshot is unavailable in the workspace, ask me to attach it again rather than substituting an unrelated image.

## 7. Required output structure

Create or repair the following structure, adapting filenames only where required by the faculty documents:

`A1/`
- `README.md`
- `A1_Report.tex`
- `A1_Report.pdf`
- `data/` — canonical required CSV datasets
- `data/code/` — original and evolved application source, organized clearly
- `Part1/` — discovery evidence, pattern diagrams, and applicable prompts
- `Part2/` — implementation source, diffs, tests, logs, and change documentation
- `Part3/` — Java, Python, JavaScript, and C++ demonstrations, tests, measurements, and comparison evidence

Include actual AI prompts and raw outputs where available, with accurate provenance. Keep historical AI records distinct from prompts used to prepare the final report. Do not invent missing historical records.

Do not replace required individual files with ZIP files. Extract and organize the source, datasets, and evidence so the submission is independently inspectable.

## 8. Compile, verify, and package

Work directly in the existing workspace.

1. Finish the report in the faculty template.
2. Ensure the LaTeX source compiles successfully.
3. Fix broken figures, missing references, overflows, placeholders, and formatting defects.
4. Verify that the PDF matches the final LaTeX source.
5. Validate the CSV schemas, relative paths, dataset consistency, and README.
6. Ensure the four language demonstrations and genuine test evidence are present.
7. Check that the submission contains no secrets, credentials, unnecessary cache files, or contradictory duplicate reports.
8. Create `A1_Final_Submission.zip` containing the complete `A1/` folder.
9. Inspect the actual ZIP contents and confirm that the PDF, LaTeX source, README, required datasets, code, and evidence are included.

## 9. Time-critical priority

Do not spend time repeating the audit, restarting CH01, researching unrelated material, or rebuilding functioning components.

Prioritize, in this order:
1. Complete report following the exact faculty structure.
2. Compiled and readable PDF.
3. Matching LaTeX source.
4. Valid datasets and source evidence.
5. README and final ZIP.
6. Brief final validation and list of essential unresolved blockers, if any.

If an essential detail can be supplied by me, ask one concise, consolidated question rather than leaving placeholders throughout the report. Otherwise, finish the supported work without waiting for unnecessary confirmation.

**Do not finish with another plan. Produce the actual final files, verify them, and provide working download links to the PDF and `A1_Final_Submission.zip`.**