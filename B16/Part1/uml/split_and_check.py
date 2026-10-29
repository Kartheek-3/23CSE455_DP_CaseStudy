"""Splits Part1/llm/output_10_uml.md into one .puml per instance (renamed to our B16 ids) and checks
every 'implements' (..|>) and 'extends' (--|>) arrow against the class declarations in data/code.
Run from B16/:  python3 Part1/uml/split_and_check.py
"""
import re
from pathlib import Path

B16 = Path(__file__).resolve().parents[2]
CODE = B16 / "data" / "code"
# model id -> our id (None = not one of our confirmed instances)
MAP = {"B9": None, "B10": "B9", "B11": "B10", "C5": None, "C6": "C5", "C7": "C6", "C8": "C7"}

text = (B16 / "Part1/llm/output_10_uml.md").read_text(encoding="utf-8")
blocks = re.findall(r"```plantuml\n(@startuml (\w+)\n.*?@enduml)\n```", text, re.S)

java_files = list(CODE.rglob("*.java"))
decl_cache = {}


def declarations(simple):
    if simple not in decl_cache:
        pat = re.compile(r"\b(class|interface|enum|record)\s+" + re.escape(simple) + r"\b[^{;]*\{", re.S)
        found = []
        for f in java_files:
            src = f.read_text(encoding="utf-8")
            if simple not in src:
                continue
            for m in pat.finditer(src):
                found.append(re.sub(r"\s+", " ", m.group(0)))
        decl_cache[simple] = found
    return decl_cache[simple]


report, written = [], []
for body, model_id in blocks:
    our_id = MAP.get(model_id, model_id)
    if our_id is None:
        report.append(f"{model_id}: SKIPPED (not a confirmed B16 instance)")
        continue
    body = body.replace(f"@startuml {model_id}", f"@startuml {our_id}", 1)
    body = re.sub(r"^title " + re.escape(model_id) + r"\b", f"title {our_id}", body, count=1, flags=re.M)
    title = re.search(r"^title (.*)$", body, re.M).group(1)
    name = re.sub(r"[^A-Za-z0-9]+", "_", title).strip("_")
    out = B16 / "Part1/uml" / f"{name}.puml"
    out.write_text(body + "\n", encoding="utf-8")
    written.append(out.name)
    # alias -> real simple name
    names = {}
    for kw, quoted, alias, plain in re.findall(
            r'^(?:abstract class|class|interface|enum)\s+(?:"([^"]+)"\s+as\s+(\w+)|(\w+))', body, re.M) and [] or []:
        pass
    for m in re.finditer(r'^(abstract class|class|interface|enum)\s+(?:"([^"]+)"\s+as\s+(\w+)|(\w+))', body, re.M):
        quoted, alias, plain = m.group(2), m.group(3), m.group(4)
        if plain:
            names[plain] = plain
        else:
            names[alias] = quoted
    for a, arrow, b in re.findall(r"^(\w+)\s+(\.\.\|>|--\|>)\s+(\w+)\s*$", body, re.M):
        ra, rb = names.get(a, a), names.get(b, b)
        if any(k in ra.lower() for k in ("lambda", "anonymous", "caller", "::")) or ra.startswith("java."):
            report.append(f"{our_id}: {a} {arrow} {b}  -> not checkable (lambda/JDK)")
            continue
        sa = re.sub(r"<.*", "", ra).split(".")[-1]
        sb = re.sub(r"<.*", "", rb).split(".")[-1]
        if rb.startswith("java."):
            ok = any(sb in d for d in declarations(sa))
        else:
            kw = "implements" if arrow == "..|>" else "extends"
            ok = any(re.search(kw + r"[^{]*\b" + re.escape(sb) + r"\b", d) for d in declarations(sa))
            if not ok and arrow == "..|>":  # interface inheritance drawn as implements, or implements via 'extends' on interface
                ok_ext = any(re.search(r"extends[^{]*\b" + re.escape(sb) + r"\b", d) for d in declarations(sa))
                if ok_ext:
                    report.append(f"{our_id}: {a} {arrow} {b}  -> WRONG ARROW: source says 'extends'")
                    continue
        report.append(f"{our_id}: {a} {arrow} {b}  -> {'OK' if ok else 'NOT FOUND IN SOURCE'}")

(B16 / "Part1/uml/arrow_check.txt").write_text("\n".join(report) + "\n", encoding="utf-8")
print(len(written), "diagrams written")
bad = [r for r in report if "NOT FOUND" in r or "WRONG" in r or "SKIPPED" in r]
print(sum("-> OK" in r for r in report), "arrows OK;", len(bad), "flagged:")
print("\n".join(bad))
