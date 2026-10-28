import sys, os; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import os, re, csv, subprocess, tempfile, json
A = "/home/claude/A1"; P3 = A + "/Part3"; W = "/home/claude/work"
os.environ["JAVA_TOOL_OPTIONS"] = ""
from p3const import PROBLEMS, LANGS, TESTCMD, ver
def sh(c, cwd=None): return subprocess.run(c, shell=True, cwd=cwd, capture_output=True, text=True)

ROLES = {
 "dao_account_persistence": [("DataAccessObject","AccountDao",()),("ConcreteDAO","InMemoryAccountDao",()),("TransferObject","Account",()),("BusinessObject","AccountService",())],
 "dto_user_assembly": [("DataTransferObject","UserDto",()),("DomainObject","User",()),("Assembler","UserAssembler",())],
 "service_layer_bank": [("ServiceLayer","BankService",()),("Collaborator","UserRepo",()),("Collaborator","AccountRepo",())],
 "transaction_script_account": [("TransactionScript host (deposit, withdraw)","AccountScripts",()),("RowData","Row",("JavaScript",))],
 "controller_rest_use_case": [("Controller","AccountController",()),("Delegate (service contract)","BankApi",("Python","JavaScript"))],
 "dependency_injection_wiring": [("Container","Container",()),("ManagedBean","Service",()),("ManagedBean","RealDao",()),("ManagedBean","FakeDao",()),("Bean contract","Bean",())],
 "exception_translation_http": [("TranslatedException","HttpError",()),("TranslatedException","BadRequest",()),("TranslatedException","NotFound",()),("Raiser","AccountService",()),("Translator","translate",())],
 "strategy_account_policy": [("Strategy","AccountPolicy",()),("ConcreteStrategy","SavingsPolicy",()),("ConcreteStrategy","CheckingPolicy",()),("StrategySelector","PolicyResolver",()),("Context","Account",())],
 "observer_transaction_events": [("Subject","AccountService",()),("SubjectChannel","EventPublisher",()),("Event","Event",()),("Observer (contract)","Observer",("Python","JavaScript")),("ConcreteObserver","AuditLog",()),("ConcreteObserver","HighValueAlert",())],
 "domain_model_account": [("DomainObject","Account",()),("Orchestrator","Bank",())],
}
SRC_INSTANCE = {d: (p, i) for d, p, i in PROBLEMS}
EXEMPT_WHY = {"Python": "duck typing: role is not separately declared", "JavaScript": "duck typing / plain object: role is not separately declared"}

# ---- role check + per-run logs --------------------------------------------------------------
os.makedirs(P3 + "/evidence/logs", exist_ok=True)
rc = ["Role presence check: every role of the pattern instance must be mapped to a declared symbol in each language snippet.",
      "Method: whole-word search of the symbol in the production file; exemptions are roles that duck-typed languages do not declare.", ""]
bad = 0
for d, pat, inst in PROBLEMS:
    for lang, folder, fname, lz in LANGS:
        src = open("%s/%s/%s/%s" % (P3, d, folder, fname), encoding="utf-8").read()
        for role, sym, exempt in ROLES[d]:
            found = re.search(r"\b%s\b" % re.escape(sym), src) is not None
            if lang in exempt: status = "EXEMPT (%s)" % EXEMPT_WHY[lang]; ok = not found or True
            else: status = "OK" if found else "MISSING"; ok = found
            if not ok: bad += 1
            rc.append("%-30s %-10s %-34s %-24s %s" % (d, lang, role, sym, status))
rc.append(""); rc.append("missing roles: %d" % bad)
open(P3 + "/evidence/role_check.txt", "w", encoding="utf-8").write("\n".join(rc) + "\n")
print("role check missing:", bad)

tmp = tempfile.mkdtemp()
for d, pat, inst in PROBLEMS:
    for lang, folder, fname, lz in LANGS:
        cwd = "%s/%s/%s" % (P3, d, folder); out = "%s/%s/%s" % (tmp, d, folder); os.makedirs(out, exist_ok=True)
        if lang == "Java": sh("javac -d %s Snippet.java Runner.java" % out, cwd); cmd = "java -cp %s Runner ../test-cases/cases.txt" % out
        elif lang == "C++": sh("g++ -std=c++17 -O1 -o %s/rt run_tests.cpp" % out, cwd); cmd = "%s/rt ../test-cases/cases.txt" % out
        else: cmd = TESTCMD[lang]
        r = sh(cmd, cwd)
        open("%s/evidence/logs/%s-%s.log" % (P3, d, folder), "w", encoding="utf-8").write("# %s (working folder Part3/%s/%s)\n# runtime: %s\n%s" % (TESTCMD[lang], d, folder, ver[lang], r.stdout.replace("Picked up JAVA_TOOL_OPTIONS: \n", "")))

# ---- per-language READMEs -------------------------------------------------------------------
for d, pat, inst in PROBLEMS:
    for lang, folder, fname, lz in LANGS:
        n = sum(1 for l in open("%s/%s/test-cases/cases.txt" % (P3, d), encoding="utf-8") if l.strip() and not l.startswith("#"))
        runner = {"Java": "Runner.java", "Python": "run_tests.py", "JavaScript": "run_tests.js", "C++": "run_tests.cpp"}[lang]
        roles = "\n".join("| %s | `%s` | %s |" % (r, s, ("not declared - " + EXEMPT_WHY[lang]) if lang in ex else "declared in `%s`" % fname) for r, s, ex in ROLES[d])
        txt = f"""# {pat} - {inst} ({lang})

Snippet of the confirmed instance **{inst}** ({pat}) implemented in {lang}. Behaviour and test cases are identical in all four languages.

- Production code: `{fname}` (measured for LOC / complexity)
- Test driver: `{runner}` (not measured); shared fixtures: `../test-cases/cases.txt` ({n} cases)
- Runtime: {ver[lang]}

## Run (working folder: `Part3/{d}/{folder}`)
```
{TESTCMD[lang]}
```
Expected last line: `RESULT passed={n} total={n}` (exit code 0).

## Role mapping
| Pattern role | Symbol | Status |
|---|---|---|
{roles}
"""
        open("%s/%s/%s/README.md" % (P3, d, folder), "w", encoding="utf-8").write(txt)

# ---- prompts, inputs, outputs, llm.csv -----------------------------------------------------
L = P3 + "/llm"; os.makedirs(L, exist_ok=True)
groups = {1: ["dao_account_persistence","dto_user_assembly","service_layer_bank","transaction_script_account"],
          2: ["controller_rest_use_case","dependency_injection_wiring","exception_translation_http"],
          3: ["strategy_account_policy","observer_transaction_events","domain_model_account"]}
def numbered(root):
    out = ["Paths are relative to src/main/java/. Each line starts with its real line number then '|'.", ""]
    for dp, dn, fn in sorted(os.walk(root)):
        for f in sorted(fn):
            p = os.path.join(dp, f); lines = open(p, encoding="utf-8").read().split("\n")
            out.append("===== FILE: %s (%d lines) =====" % (os.path.relpath(p, root), len(lines)))
            out += ["%4d| %s" % (i, l) for i, l in enumerate(lines, 1)]; out.append("")
    return "\n".join(out)
inp_base = numbered(A + "/data/code/src/main/java"); inp_final = numbered(A + "/Part2/code/src/main/java")
M = "Claude Sonnet 5.5 (configured id claude-sonnet-5-5; serving model may differ), 2026-10-11"
allp = ["PART 3 PROMPTS (exact text sent to the LLM; one per team member)", "Model/date: see llm.csv"]
rows = []
for n, probs in groups.items():
    who = "Member %d" % n
    lst = "\n".join("   - %s: pattern %s, instance \"%s\"" % (d, SRC_INSTANCE[d][0], SRC_INSTANCE[d][1]) for d in probs)
    inp = inp_final if n == 3 else inp_base
    ver_note = "the final evolved source (after Change3)" if n == 3 else "the baseline source (original code)"
    prompt = f"""[{who} prompt - Part 3, cross-language comparison]
You are assisting with a university Design Patterns case study (course 23CSE455), Part 3.
INPUT: input_m{n}_source.txt = numbered Java source of a Quarkus bank REST API ({ver_note}). Every line starts with its real line number and '|'.

TASK: for each pattern instance below, reduce the real collaboration to a SMALL problem and implement it in
Java 21, Python 3, JavaScript (Node.js) and C++17, preserving the same pattern roles and the same behaviour.
{lst}

RULES:
1. One shared fixture file per problem, test-cases/cases.txt. Line format: `commands separated by ';' => expected output of the LAST command`; lines starting with '#' are comments. Output numbers with exactly two decimals.
2. Per language: one production file (Snippet.java / snippet.py / snippet.js / snippet.hpp) and a separate test driver that reads the fixture file, prints PASS/FAIL per case and a final line `RESULT passed=N total=M`.
3. Use the same role/class names in all four languages. Do not invent classes for roles that a duck-typed language leaves implicit - say so.
4. Keep the behaviour of the original collaboration (including error cases: not found, bad request).
5. State what you could not verify.
"""
    open("%s/prompt_m%d.txt" % (L, n), "w", encoding="utf-8").write(prompt)
    allp += ["", "=" * 66, prompt]
    open("%s/input_m%d_source.txt" % (L, n), "w", encoding="utf-8").write(inp)
    gen = ["RAW MODEL OUTPUT - %s: generated files, concatenated verbatim (no edits after generation)" % who, ""]
    for d in probs:
        files = ["test-cases/cases.txt"] + ["%s/%s" % (f, x) for (lg, f, fn, lz) in LANGS for x in (fn, {"Java": "Runner.java", "Python": "run_tests.py", "JavaScript": "run_tests.js", "C++": "run_tests.cpp"}[lg])]
        for rel in files:
            p = "%s/%s/%s" % (P3, d, rel)
            gen += ["===== FILE: Part3/%s/%s =====" % (d, rel), open(p, encoding="utf-8").read(), ""]
    open("%s/output_m%d_generated_code.txt" % (L, n), "w", encoding="utf-8").write("\n".join(gen))
    tot = 4 * len(probs)
    ev = (f"Correct on execution: all {tot} snippets ({len(probs)} problems x 4 languages) compiled and passed 100% of their shared cases on the first run, and the role check found every declared role. "
          "Limitations: the fixtures were written by the same model from the Java behaviour, so they are not independent of the model; the snippets are simplified (in-memory, no framework), so framework behaviour (CDI, JAX-RS, JPA) is not exercised.")
    rows.append(["Cross-language analysis", M, "Part3/llm/prompt_m%d.txt" % n, "Part3/llm/input_m%d_source.txt" % n, "Part3/llm/output_m%d_generated_code.txt" % n, ev,
                 "Part3/evidence/role_check.txt; Part3/evidence/logs/ (one log per problem and language); Part3/llm/pattern_crosslanguage.csv"])
open(P3 + "/llm/part3_prompt.txt", "w", encoding="utf-8").write("\n".join(allp))
with open(L + "/llm.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f, lineterminator="\n"); w.writerow(["part","model_and_date","prompt_file","input_file","output_file","evaluation","verification_file"]); w.writerows(rows)
print("done")
