"""Check every 'ROLE | SYMBOL | path:start-end' row of a raw LLM output against the real source."""
import re, sys, os, json
sys.path.insert(0, os.path.dirname(__file__))
from javaloc import resolve, JavaFile

def rows(md):
    for ln, line in enumerate(open(md, encoding="utf-8"), 1):
        m = re.match(r"^(\w[\w ]*?) \| (.+?) \| ([\w/\.\-]+):(\d+)-(\d+)\s*$", line)
        if m: yield ln, m.group(1), m.group(2), m.group(3), int(m.group(4)), int(m.group(5))

def check(root, md):
    res = []
    for ln, role, sym, rel, a, b in rows(md):
        path = rel if rel.endswith(".properties") else "src/main/java/br/com/michaelcruz/" + rel
        full = os.path.join(root, path)
        if not os.path.exists(full): res.append((ln, role, sym, rel, a, b, "PATH_MISSING", None)); continue
        if rel.endswith(".properties"): res.append((ln, role, sym, rel, a, b, "OK", None)); continue
        fm = re.search(r"\((?:injected )?field (\w+)\)", sym)
        if fm:
            jf = JavaFile(full); c = jf.cls(os.path.basename(rel)[:-5]); f = jf.field(fm.group(1), c)
            res.append((ln, role, sym, rel, a, b, "OK" if f == (a, b) else ("SYMBOL_NOT_FOUND" if f is None else "RANGE_MISMATCH"), f)); continue
        base = re.sub(r"\(.*?\)", "", sym).strip()
        if base.startswith(("EntityManager", "Container")):
            jf = JavaFile(full); txt = jf.text(a, b)
            res.append((ln, role, sym, rel, a, b, "OK" if "EntityManager" in txt else "SYMBOL_NOT_IN_RANGE", None)); continue
        if base.split()[0].split(".")[0] in ("DAO<T>",) or True:
            r = resolve(root, path, base)
            if r is None: res.append((ln, role, sym, rel, a, b, "SYMBOL_NOT_FOUND", None))
            elif r == (a, b): res.append((ln, role, sym, rel, a, b, "OK", r))
            else: res.append((ln, role, sym, rel, a, b, "RANGE_MISMATCH", r))
    return res

if __name__ == "__main__":
    root, outjson = sys.argv[1], sys.argv[2]
    allres = {}
    for md in sys.argv[3:]:
        r = check(root, md)
        allres[os.path.basename(md)] = r
        ok = sum(1 for x in r if x[6] == "OK")
        print("%s: %d rows, %d OK, %d not OK" % (os.path.basename(md), len(r), ok, len(r) - ok))
        for x in r:
            if x[6] != "OK": print("   line %d: %s | %s | %s:%d-%d -> %s (actual %s)" % (x[0], x[1], x[2], x[3], x[4], x[5], x[6], x[7]))
    json.dump(allres, open(outjson, "w"), indent=1)
