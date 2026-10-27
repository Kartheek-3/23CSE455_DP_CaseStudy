# Change1 (CH01) — interchangeable delivery-assignment policies

**Status:** implemented and feature-tested. Introduces the Strategy instance *Delivery Assignment Policy Selection*.

**Requirement.** An administrator assigning a confirmed delivery order should be able to choose how the delivery person is picked (manual choice or automatic least workload), and adding another rule later should not mean rewriting the assignment view. The acceptance criteria and their tests are listed in `A1_Report.pdf` §3.1 and in `CH01_IMPLEMENTATION.md`.

| Item | Location |
|---|---|
| Unified diff against baseline 83998629 | `CH01.diff` |
| Implementation and validation notes (from the CH01 package, unchanged) | `CH01_IMPLEMENTATION.md` |
| Changed files before / after | `source/before/`, `source/after/` (full evolved tree: `data/code/evolved_CH01/`) |
| Test and check logs (final and earlier attempts) | `evidence/` |
| Validation-only requirements, scoped settings, UI test script, command record | `verification/` |
| Before/after metrics (lizard) | `metrics/` |
| Independent re-checks on 2026-10-11 | `rerun_2026-10-11/` |

There is no Git commit for this change. Baseline + `CH01.diff` = `data/code/evolved_CH01/` (checked byte for byte).
