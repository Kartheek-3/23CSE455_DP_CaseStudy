# Inputs supplied to the 2026-10-11 report consolidation session

| Supplied file | SHA-256 | Where its content is kept in this folder |
|---|---|---|
| `CH01_Implementation_Package.zip` | `3287bb238c45b9fd7bfbe9b1a669de6ea86c5725b25a7bf69076f2f3c2f8e833` | `Part2/changes/Change1/` (diff, notes, evidence, verification); `data/code/evolved_CH01/`; baseline archive content in `data/code/baseline_83998629/` |
| `A1_Original_Project_Recovery.zip` | `4291f5ea6273d4088125386cb631b61e62305a9bd79dd2790b09a8825cbab81f` | `data/provenance/recovery/`, `data/legacy_datasets/`, `Part1/llm/`, `Part2/llm/`, `Part3/order_events_and_delivery_selection/` |
| `CH01_IMPLEMENTATION.md` | `cb59880fe98ca2103669c81ffb3c9c94f8db7958265ebe703043ec9690a52db6` | identical to the copy in the CH01 package; `Part2/changes/Change1/CH01_IMPLEMENTATION.md` |
| `CH01.diff` | `e7267232b5489ff32d559fae954419ed8b3becf65f51b19f5652e5044425f6a9` | identical to the copy in the CH01 package; `Part2/changes/Change1/CH01.diff` |
| `casestudy.tex` (faculty template) | `23f26d5f3a8b8e23fa1fdaa480d05a4cd549c10728148e83efe06bd7dee7edec` | structure followed by `A1_Report.tex`; original kept unchanged outside the submission |
| `DP.zip` | `9be217b8e7e20cef9bb4e20792864c0a584e0031b14ac5ca65ef8899ecc30c76` | ZIP container differs from the recovery copy (`f19d0614…`), but all eight member files have identical hashes; demos in `Part3/`, datasets in `data/legacy_datasets/` |
| `manifest_1.csv` | `2f44581b7f8c1d1e925aec95edf82458532ab4f4b5d6494108c77abe2f127764` | recovery manifest; the package copy is `data/provenance/recovery/manifest.csv` |
| `DP_Csestudy_instructions.pdf` | `aa83794960a301dc919c26b409918ccb94a4d6fcd42696a4318f13bc5ed25212` | faculty instructions (CSV schemas, folder hierarchy) |
| `DP_Csestudyreport_structure.pdf` | `5b18709bd3d8858f86a7218af3e865dc0e42603bc2f0f0b1cecf11bccb1cb554` | faculty report structure (rendered template) |

Baseline source: commit `83998629e633594037cfa25e583542f9f6f0f968` of https://github.com/HarshavardhanVemali/campus-food-ordering (archive SHA-256 in `data/provenance/provenance.json`).

The session did not access the network for application code. It ran the Part 3 demonstrations locally (`Part3/evidence/`), generated the candidate scan (`Part1/evidence/candidate_scan.txt`) and rendered diagrams with Graphviz. It did not re-run the CH01 Django or JavaScript tests; those results come from the CH01 package logs.
