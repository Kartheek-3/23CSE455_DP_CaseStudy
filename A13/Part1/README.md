# Part 1: Pattern discovery

Team A13 | Application: Misskey | Baseline commit: `5f501341d49d2bc3fa7e817ce7548a82174326eb`

| Path | Content |
|---|---|
| `patterns.csv` | 22 pattern instances with participant roles, file paths with line ranges, and evidence (copied to `data/patterns.csv`) |
| `pattern_counts.csv` | Instances per pattern type with category (17 types, 22 instances) |
| `pattern_architecture/` | Architecture diagram: Graphviz source, SVG and PNG |
| `Part1_prompt.txt` | Discovery prompt |
| `llm.csv` | Part 1 AI-use record |

Method: LLM-assisted candidate discovery and classification, followed by source-oriented checks and a missed-pattern scan; the exact line ranges should be checked against the frozen source.

Note: `pattern_counts.csv` uses the columns `pattern_name,pattern_type,count` rather than the specification's `source_version,summary,pattern_name,count`. The specification-format counts for the baseline and the Part 2 versions are in `Part2/Pattern_count.csv` (`data/pattern_counts.csv`).
