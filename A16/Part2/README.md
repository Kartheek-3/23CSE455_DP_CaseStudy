# Part 2 — Evolution

The evolved application is under `code/evolved/`. Change requirements, implementation diffs and test summaries are grouped under `code/changes/Change1` through `Change3`. Pattern evolution is in `pattern_evaluation.csv`; counts are in `Pattern_count.csv`. Updated diagrams are in `diagrams/`.

Payment integration uses a provider interface, a deterministic local adapter by default and an external HTTP adapter behind the `external-payments` profile. No real credentials or transactions are required. Notification records delivery through a logging adapter and is best-effort. The 10-module Maven reactor passed 17 unit tests; the service smoke flow passed 14/14 expected HTTP outcomes. Full test evidence is under `../data/test_result/`. Focused results are copied into each change folder.

`Part2_prompt.text` is a reconstructed scope brief, not a verbatim prompt. `llm.csv` contains only its required header because no auditable Part 2 transcript was exported.
