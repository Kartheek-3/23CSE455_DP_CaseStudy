# Part 2 - Evolution and refactoring

Three Agile changes cover the four requirements of the case study:

| Change | Requirement(s) | Owner | Tests at commit | Patterns |
|---|---|---|---|---|
| [CH01](changes/CH01/README.md) | new driver status (SUSPENDED) | Sai Sameer | 22/22 | + State (Driver Account Lifecycle) |
| [CH02](changes/CH02/README.md) | ride cancellation | M Kumar | 33/33 | + State (Trip Lifecycle), + Strategy (Cancellation Fee Policy) |
| [CH03](changes/CH03/README.md) | multiple ride types + dynamic pricing | K Harish | 41/41 | + Strategy (Ride Fare Pricing), + Decorator (Dynamic Fare Pricing) |

- `code/` - final evolved source (commit `a12c878`) including `tests/` (run `npm install && npm test`).
- `changes/CHxx/` - requirement and acceptance criteria (README), patch, diffstat, test log at that commit.
- `diagrams/` - UML for each change (PlantUML source + PNG).
- `evidence/test_results.txt` - final run 41/41; `evidence/evolved_metrics.json` - NLOC/CC of all files (229 files,
  8,680 NLOC, 460 functions); `evidence/changed_files_before.json` / `changed_files_after.json` - same-scope metrics for
  the edited files; `evidence/source_manifest.sha256`.

Pattern evolution per snapshot: `data/patterns_evolution.csv` and `data/pattern_counts.csv`.
LLM records for this part: `prompts/Sai_Sameer_prompt_01.txt`, `M_Kumar_prompt_01.txt`, `K_Harish_prompt_01.txt`.
