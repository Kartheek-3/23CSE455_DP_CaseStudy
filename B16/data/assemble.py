"""Builds the per-Part combined prompt files named in the assignment's folder tree.
The four dataset CSVs live only in data/ and are NOT copied into the Part folders
("Do not repeat the four CSVs inside them").
Masters (edit these, never the outputs): data/llm.csv and the exact prompt files Part*/llm/prompt_*.txt.
Run from B16/:  python3 data/assemble.py
"""
import csv
from pathlib import Path

B16 = Path(__file__).resolve().parents[1]
# part number -> combined prompt file, as named in the assignment's folder tree
TARGETS = {"1": "Part1/Part1_prompt.txt", "2": "Part2/Part2_prompt.txt", "3": "Part3/llm/part3_prompt.txt"}

with (B16 / "data/llm.csv").open(encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

for part, prompt_out in TARGETS.items():
    mine = [r for r in rows if r["part"].startswith(f"Part {part} ")]
    if not mine:
        continue
    blocks = [f"All Part {part} prompts, exactly as sent, in the order they were run.\n"
              f"Each prompt's raw output is the file named in its header (paths relative to the team folder).\n"]
    for r in mine:
        text = (B16 / r["prompt_file"]).read_text(encoding="utf-8").rstrip()
        blocks.append(f"=== {r['part']}\n=== prompt: {r['prompt_file']} | output: {r['output_file']} "
                      f"| model: {r['model_and_date']}\n\n{text}\n")
    (B16 / prompt_out).write_text("\n".join(blocks), encoding="utf-8")
    print(f"Part {part}: {len(mine)} prompts -> {prompt_out}")
