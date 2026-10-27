"""Generates B16_Report.tex from the datasets (tables) plus the narrative below.
Run from B16/:  python3 data/build_report.py && tectonic B16_Report.tex
"""
import csv
import re
import sys

sys.dont_write_bytecode = True  # no __pycache__ in the submission folder
from pathlib import Path

B16 = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(B16 / "Part1" / "evidence"))
from part1_records import INSTANCES  # noqa: E402

AREAS = {"A": "Area A: discovery and test descriptors", "B": "Area B: engines and execution lifecycle",
         "C": "Area C: listeners and reporting", "D": "Area D: Jupiter extensions and resources"}


def esc(text):
    rep = {"\\": r"\textbackslash{}", "&": r"\&", "%": r"\%", "$": r"\$", "#": r"\#", "_": r"\_", "{": r"\{",
           "}": r"\}", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}", "<": r"\textless{}", ">": r"\textgreater{}",
           "–": "--", "—": "---", "→": r"$\rightarrow$", "×": r"$\times$", "≥": r"$\geq$", "…": "..."}
    return "".join(rep.get(ch, ch) for ch in str(text))


def code(text):  # breakable monospace symbol: after . / # and at camelCase boundaries
    t = esc(text).replace(".", r".\allowbreak{}").replace("/", r"/\allowbreak{}").replace(r"\#", r"\#\allowbreak{}")
    return r"\texttt{" + re.sub(r"([a-z])([A-Z])", r"\1\\allowbreak{}\2", t) + "}"


def path(p):
    return r"\path{" + p.replace("{", "").replace("}", "") + "}"


def read(p):
    with (B16 / p).open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


def short_loc(loc):
    m = re.match(r"(?:data/code/|Part2/code/)?([\w-]+)/src/main/java/(.+?)/([\w$]+\.java):(\d+-\d+)", loc)
    if not m:
        return esc(loc)
    return path(f"{m.group(1)}/.../{m.group(3)}:{m.group(4)}")


def inventory():
    by = {}
    for i in INSTANCES:
        by.setdefault(i["pattern"], []).append(i)
    rows = []
    for pat in sorted(by, key=lambda k: (-len(by[k]), k)):
        names = "; ".join(f'{i["id"]} {i["name"]}' for i in by[pat])
        rows.append(f"{esc(pat)} & {esc(names)} & {len(by[pat])} & {sum(i['concrete'] for i in by[pat])}\\\\")
    rows.append(r"\midrule\textbf{Total} & 10 pattern types & \textbf{35} & \textbf{76}\\")
    return "\n".join(rows)


def proofs():
    """Key code line per instance: the 'Proof' column of the tables in Part1/notes.md."""
    out = {}
    for line in (B16 / "Part1/notes.md").read_text(encoding="utf-8").splitlines():
        cells = [c.strip() for c in line.split("|")]
        if len(cells) > 6 and re.fullmatch(r"[A-D]\d+", cells[1]):
            out[cells[1]] = cells[5]
    return out


JAVA = {f.name: f for f in (B16 / "data/code").rglob("*.java")}


def proof_tex(text):
    """The first referenced source line, read from data/code, plus the full reference from the notes."""
    m = re.search(r"(\w+\.java):(\d+)", text)
    ref = esc(re.sub(r"`[^`]+`", "", text).strip(" ;"))
    if not m:
        return ref
    line = JAVA[m.group(1)].read_text(encoding="utf-8").splitlines()[int(m.group(2)) - 1].strip()
    loc = f"{m.group(1)}:{m.group(2)}"
    return f"{code(line)} ({esc(loc)}" + ("" if ref == esc(loc) else f"; see {ref}") + ")"


CATEGORY = {"Null Object": "not GoF; Woolf, Pattern Languages of Program Design 3, 1998"}


def records():
    p1 = {r["instance_name"]: r for r in read("data/patterns.csv")}
    key = proofs()
    out, area = [], None
    for i in INSTANCES:
        if i["id"][0] != area:
            area = i["id"][0]
            out.append(f"\\subsubsection*{{{AREAS[area]}}}")
        r = p1[f'{i["id"]} {i["name"]}']
        roles = r["participant_roles"].split("; ")
        locs = r["source_locations"].split("; ")
        out.append(f"\\paragraph{{{esc(i['id'])} {esc(i['name'])}}} "
                   f"\\textbf{{Pattern:}} {esc(i['pattern'])} ({esc(i['type'])}, {esc(CATEGORY.get(i['pattern'], 'GoF'))}). "
                   f"\\textbf{{Origin:}} JUnit framework code (not student-added). "
                   f"\\textbf{{Concrete participant classes:}} {i['concrete']}.\\par")
        out.append(r"\begin{longtable}{@{}p{0.19\linewidth}p{0.41\linewidth}p{0.33\linewidth}@{}}\toprule" "\n"
                   r"Role & Class / interface / function & File and lines\\\midrule\endhead")
        for role, loc in zip(roles, locs):
            name, _, sym = role.partition("=")
            out.append(f"{esc(name).replace('/', '/\\allowbreak{}')} & {code(sym)} & {short_loc(loc)}\\\\")
        out.append(r"\bottomrule\end{longtable}")
        out.append(f"\\textbf{{Evidence:}} {esc(i['intent'])}\\par")
        out.append(f"\\textbf{{Key code:}} {proof_tex(key[i['id']])}\\par")
        out.append(f"\\textbf{{Diagram:}} {path('Part1/uml/png/' + i['id'] + '.png')} (source in "
                   f"{path('Part1/uml/')}). "
                   f"\\textbf{{Verification:}} confirmed (reviewer: Gautham Mohanraj); claims and line numbers checked in "
                   f"{path('Part1/evidence/verification.csv')}, decisions in {path('Part1/notes.md')}.\\par")
    return "\n".join(out)


def rejected_table():
    text = (B16 / "Part1/notes.md").read_text(encoding="utf-8")
    rows = []
    for block in re.split(r"^## ", text, flags=re.M)[1:]:
        area = block.split()[1]
        sec = block.split("### Rejected / uncertain (with reason)")[1]
        for line in sec.splitlines():
            if line.startswith("- "):
                item = line[2:]
                verdict = "uncertain" if "uncertain" in item.lower() else "rejected"
                rows.append(f"{area} & {verdict} & {esc(item)}\\\\")
    rows.append("C & uncertain & CompositeTestExecutionListener, CompositeEngineExecutionListener, "
                "CompositeLauncherSessionListener as Composite: flat multicasters that only broadcast "
                "(Composite rule; recorded in the Area C decisions)\\\\")
    return "\n".join(rows)


def evolution_counts():
    evo = read("Part2/pattern_evolution.csv")
    versions = list(dict.fromkeys(r["source_version"] for r in evo))
    concrete = {versions[0]: 76, versions[1]: 78, versions[2]: 79, versions[3]: 81}
    rejected = {versions[0]: 25, versions[1]: 27, versions[2]: 28, versions[3]: 28}
    rows = []
    for v in versions:
        rs = [r for r in evo if r["source_version"] == v]
        symbols = {role.partition("=")[2] for r in rs for role in r["participant_roles"].split("; ")}
        changed = ", ".join(f'{r["instance_name"].split()[0]} {r["status_after_change"].replace("_", " ")}'
                            for r in rs if r["status_after_change"] not in ("baseline", "preserved")) or "--"
        commit = {"Original code": "f59f60d", "Code after Change3": "6f98fbf", "Code after Change1": "e55fefe",
                  "Code after Change2": "99987b0"}[v]
        rows.append(f"{esc(v)} (\\texttt{{{commit}}}) & {len({r['pattern_name'] for r in rs})} & {len(rs)} & {concrete[v]} & "
                    f"{len(symbols)} & {rejected[v]} / 8 & {esc(changed)}\\\\")
    return "\n".join(rows)


def cross_table():
    rows = []
    for r in read("data/cross_language.csv"):
        rows.append(f"{esc(r['pattern_name'])} & {esc(r['language'])} & {r['source_loc']} & {r['max_function_cc']} & "
                    f"{esc(r['test_result'].split(' (')[0])} & {r['median_process_ms']}\\\\")  # log path stated above the table
    return "\n".join(rows)


def cross_summary():
    import statistics
    rows = read("data/cross_language.csv")
    out = []
    for lang in ["Java", "Python", "JavaScript", "C++"]:
        rs = [r for r in rows if r["language"] == lang]
        loc = [int(r["source_loc"]) for r in rs]
        cc = [int(r["max_function_cc"]) for r in rs]
        ms = [float(r["median_process_ms"]) for r in rs]
        out.append(f"{esc(lang)} & {statistics.mean(loc):.1f} & {min(loc)}--{max(loc)} & {min(cc)}--{max(cc)} & {min(ms)}--{max(ms)}\\\\")
    return "\n".join(out)


def llm_table():
    rows, group = [], None
    for r in read("data/llm.csv"):
        part, step = r["part"].split(": ", 1)  # "Part 1 - pattern discovery", "prompt 4: ..."
        folder, name = r["prompt_file"].rsplit("/", 1)
        if part != group:
            first, group, home = group is None, part, folder
            rows.append(("" if first else "\\addlinespace\n") +
                        f"\\multicolumn{{4}}{{@{{}}l}}{{\\textbf{{{esc(part.replace(' - ', ' -- '))}}} "
                        f"(prompts in {path(folder + '/')})}}\\\\")
        verdict = r["evaluation"].split(":")[0]
        tool = "Claude Code CLI" if "CLI" in r["model_and_date"] else "claude.ai (Claude Code on the web)"
        prompt = path(name if folder == home else r["prompt_file"])
        rows.append(f"{esc(step[0].upper() + step[1:])} & {tool} & {prompt} & {esc(verdict)}\\\\")
    return "\n".join(rows)


def verification_counts():
    rows = []
    for label, p in [("Part 1", "Part1/evidence/verification.csv"), ("Part 2", "Part2/evidence/verification.csv"),
                     ("Part 3", "Part3/llm/verification.csv")]:
        rs = read(p)
        c = lambda pred: sum(1 for r in rs if pred(r["verdict"]))  # noqa: E731
        rows.append(f"{label} & {len(rs)} & {c(lambda v: v == 'correct')} & {c(lambda v: v == 'partially correct')} & "
                    f"{c(lambda v: v.startswith('incorrect'))} & {c(lambda v: v == 'cannot confirm')} & "
                    f"{sum(1 for r in rs if r['checked_by'].strip())}\\\\")
    return "\n".join(rows)


def uml_appendix():
    out = []
    for name, cap in [("A2", "A2 after Change3 (extended)"), ("A3", "A3 after Change3 (extended)"),
                      ("C1", "C1 after Change1 (extended)"), ("D3", "D3 after Change2 (extended)"),
                      ("N1", "N1 Managed Resource Factory (Strategy, newly introduced by Change2)"),
                      ("N2", "N2 Managed Resource Holder (Adapter, newly introduced by Change2)")]:
        out.append(f"\\begin{{figure}}[H]\\centering\\includegraphics[width=0.95\\linewidth,height=0.42\\textheight,"
                   f"keepaspectratio]{{Part2/uml/png/{name}.png}}\\caption{{{esc(cap)}}}\\end{{figure}}")
    return "\n".join(out)


TEMPLATE = (B16 / "data" / "report_template.tex").read_text(encoding="utf-8")


def main():
    tex = (TEMPLATE.replace("%%INVENTORY%%", inventory()).replace("%%RECORDS%%", records())
           .replace("%%REJECTED%%", rejected_table()).replace("%%EVOCOUNTS%%", evolution_counts())
           .replace("%%CROSSSUMMARY%%", cross_summary()).replace("%%CROSS%%", cross_table()).replace("%%LLM%%", llm_table())
           .replace("%%VERIFY%%", verification_counts()).replace("%%UML%%", uml_appendix()))
    (B16 / "B16_Report.tex").write_text(tex, encoding="utf-8")
    print("wrote B16_Report.tex")


if __name__ == "__main__":
    main()
