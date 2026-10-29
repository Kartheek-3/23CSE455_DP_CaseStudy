"""Makes every diagram agree with its counted record (data/patterns.csv / Part2/pattern_evolution.csv):
- a drawn class with a pattern-role stereotype that is NOT a participant of the record is greyed out and
  marked "not counted" (it is a real class shown only for context);
- a note lists exactly the counted participants, marking those not drawn.
Idempotent. Run from B16/:  python3 Part1/uml/align_with_records.py  (then re-render the PNGs)
"""
import csv
import re
from pathlib import Path

B16 = Path(__file__).resolve().parents[2]
ROLE = re.compile(r"Concrete|Leaf|Adapter|Decorator|Observer|Strategy|Composite|Command|Handler|Product")
DECL = re.compile(r'^(\s*(?:abstract\s+class|class|interface|enum|annotation)\s+(?:"([^"]+)"\s+as\s+(\w+)|([\w.$]+)))'
                  r'(\s*<<([^>]*)>>)?(.*)$', re.M)
MARK = "' aligned-with-record"


def simple(name):
    return re.sub(r"<.*", "", name).split(".")[-1]


def align(puml: Path, roles: list[str]):
    text = puml.read_text(encoding="utf-8")
    if MARK in text:
        return False
    counted = [(r.partition("=")[0], r.partition("=")[2]) for r in roles]
    counted_names = {simple(sym.split("#")[0]) for _, sym in counted}
    drawn = set()

    def fix(m):
        head, full, alias, plain, st_all, st, rest = m.groups()
        name = simple(full or plain)
        drawn.update({name, alias} - {None})
        # a descriptive label such as "lambda from TagFilter.includeTags()" stands for a counted participant
        drawn.update(c for c in counted_names if full and c in full)
        if full and any(c in full for c in counted_names):
            return m.group(0)
        if st and ROLE.search(st) and name not in counted_names and (alias or "") not in counted_names \
                and "not counted" not in st:
            return f"{head} <<{st}, not counted>> #E6E6E6{rest}"
        return m.group(0)

    text = DECL.sub(fix, text)
    lines = [f"{role}: {simple(sym.split('#')[0])}{'#' + sym.split('#')[1] if '#' in sym else ''}"
             + ("" if simple(sym.split("#")[0]) in drawn or "(JDK)" in sym or "none in production" in sym else " (not drawn)")
             for role, sym in counted]
    note = ("legend right\n  <b>Counted participants</b> (record in the dataset)\n  "
            + "\n  ".join(lines) + "\n  Grey classes: real, shown for context, not counted\nendlegend\n")
    text = text.replace("@enduml", f"{MARK}\n{note}@enduml")
    puml.write_text(text, encoding="utf-8")
    return True


def main():
    p1 = {r["instance_name"].split()[0]: r["participant_roles"].split("; ") for r in
          csv.DictReader((B16 / "data/patterns.csv").open(encoding="utf-8"))}
    final = {}
    for r in csv.DictReader((B16 / "Part2/pattern_evolution.csv").open(encoding="utf-8")):
        final[(r["source_version"], r["instance_name"].split()[0])] = r["participant_roles"].split("; ")
    changed = []
    for puml in sorted((B16 / "Part1/uml").glob("*.puml")):
        iid = puml.name.split("_")[0]
        if iid in p1 and align(puml, p1[iid]):
            changed.append(puml.name)
    after = {"A2_after_CH03.puml": ("Code after Change3", "A2"), "A3_after_CH03.puml": ("Code after Change3", "A3"),
             "C1_after_CH01.puml": ("Code after Change1", "C1"), "D3_after_CH02.puml": ("Code after Change2", "D3"),
             "N1_Strategy_ResourceFactory.puml": ("Code after Change2", "N1"),
             "N2_Adapter_ManagedResourceHolder.puml": ("Code after Change2", "N2")}
    for name, key in after.items():
        if align(B16 / "Part2/uml" / name, final[key]):
            changed.append("Part2/" + name)
    print(f"aligned {len(changed)} diagrams")


if __name__ == "__main__":
    main()
