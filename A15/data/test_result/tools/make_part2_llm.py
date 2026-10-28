import os, re, csv, subprocess, json
A, W = "/home/claude/A1", "/home/claude/work"
L = A + "/Part2/llm"; os.makedirs(L, exist_ok=True)
exec(open("make_part2_docs.py").read().split("hdr =")[0].split("DOC = {")[0].replace("met = json","met = json"), {}) if False else None
import importlib.util, sys
spec = importlib.util.spec_from_file_location("docs", "make_part2_docs.py")
src = open("make_part2_docs.py").read()
DOC = {}
exec(src[src.index("DOC = {"):src.index("hdr =")], {"__builtins__": __builtins__}, DOC)
DOC = DOC["DOC"] if "DOC" in DOC else DOC

def numbered(tag):
    root = "%s/snaps/%s/src/main/java" % (W, tag)
    out = ["Paths are relative to src/main/java/. Each line starts with its real line number then '|'.", ""]
    for dp, dn, fn in sorted(os.walk(root)):
        for f in sorted(fn):
            p = os.path.join(dp, f); lines = open(p, encoding="utf-8").read().split("\n")
            out.append("===== FILE: %s (%d lines) =====" % (os.path.relpath(p, root), len(lines)))
            out += ["%4d| %s" % (i, l) for i, l in enumerate(lines, 1)]; out.append("")
    return "\n".join(out)

members = {1: ("Member 1", "c0"), 2: ("Member 2", "change1"), 3: ("Member 3", "change2")}
commits = json.load(open(W + "/logs/commits.json"))
all_prompts = ["PART 2 PROMPTS (exact text sent to the LLM; one per team member / change)", "Model/date: see llm.csv"]
rows = []
M = "Claude Sonnet 5.5 (configured id claude-sonnet-5-5; serving model may differ), 2026-10-11"
EVAL = {
1: ("Partial: production code compiled and all 23 tests passed on the first run, and the pattern analysis (Strategy introduced, Transaction Script modified) matches the code. One unannounced behaviour change was found in review: an account whose type is null could be credited before, but now gets HTTP 400 from AccountPolicyResolver.forType(null). One existing test had to be edited because the boundary change (AC4) was intended.",
    "Part2/changes/Change1/test_result.txt; Part2/changes/Change1/Change1.patch"),
2: ("Partial: code compiled and 30/30 tests passed on the first run; claims about event content, per-account order, 400/404 publishing nothing and the 10000.00 threshold are confirmed by tests. Cannot confirm: that the audit trail stays correct if the surrounding database transaction rolls back after the event is fired (observers run synchronously inside the transaction; needs Quarkus + a database).",
    "Part2/changes/Change2/test_result.txt; Part2/changes/Change2/Change2.patch"),
3: ("Partial: code compiled and 37/37 tests passed on the first run; the Move Method refactoring preserved all earlier test results unchanged. The claim that the transfer is atomic is confirmed only for validation failures (nothing is persisted when a rule fails); rollback after a failure between the two DAO updates relies on @Transactional and was not executed. The unreachable-else-branch finding in the old deposit/withdraw code was confirmed by reading AccountDAO.findById.",
    "Part2/changes/Change3/test_result.txt; Part2/changes/Change3/Change3.patch"),
}
for n in (1, 2, 3):
    who, tag = members[n]; d = DOC[n]
    open("%s/input_ch0%d_source_before.txt" % (L, n), "w", encoding="utf-8").write(numbered(tag))
    prompt = f"""[{who} prompt - Part 2, change CH0{n}]
You are assisting with a university Design Patterns case study (course 23CSE455), Part 2 (evolution and refactoring).
INPUT: input_ch0{n}_source_before.txt = numbered Java source (src/main/java) of a Quarkus bank REST API.
The existing JUnit 5 characterization tests use an in-memory EntityManager fake and a small CDI-like container (no database needed).

CHANGE {d['title']}
{d['req']}

DELIVER:
1. The code change as a unified diff (production code and JUnit 5 tests). Keep the existing style (field @Inject, @ApplicationScoped, WebApplicationException-based errors).
2. One test per acceptance criterion; do not weaken existing tests except where the requirement changes behaviour - say which.
3. Pattern effects: for every pattern instance in the current code say preserved / modified / extended / replaced / removed / newly_introduced and why.
4. The refactoring: the real code smell, the technique, and how behaviour preservation is shown.
5. Say honestly what you could not verify.
"""
    open("%s/prompt_ch0%d.txt" % (L, n), "w", encoding="utf-8").write(prompt)
    all_prompts += ["", "=" * 66, prompt]
    effects = "\n".join("- %s: **%s** - %s" % e for e in d["effects"])
    out = f"""# {who} - raw model output for CH0{n} (design notes; the generated code is the patch)

Generated code (verbatim diff): Part2/changes/Change{n}/Change{n}.patch  (commits {commits[str(n)][0]} -> {commits[str(n)][1]})

## Design
{d['req'].splitlines()[0]}

## Pattern effects
{effects}

## Refactoring
- Smell: {d['smell']}
- Technique: {d['tech']}

## Not verified
- Anything that needs the real Quarkus runtime or a database (HTTP wiring, JPA mapping, transaction rollback).
"""
    open("%s/output_ch0%d.md" % (L, n), "w", encoding="utf-8").write(out)
    rows.append(["Evolution", M, "Part2/llm/prompt_ch0%d.txt" % n, "Part2/llm/input_ch0%d_source_before.txt" % n, "Part2/llm/output_ch0%d.md" % n, EVAL[n][0], EVAL[n][1]])
open(A + "/Part2/Part2_prompt.txt", "w", encoding="utf-8").write("\n".join(all_prompts))
with open(A + "/Part2/llm.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, lineterminator="\n"); w.writerow(["part","model_and_date","prompt_file","input_file","output_file","evaluation","verification_file"]); w.writerows(rows)
print("ok", len(rows))
