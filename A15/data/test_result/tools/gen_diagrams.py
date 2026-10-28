import os, subprocess, re
from patterns_spec import *

def node_id(s): return "n_" + re.sub(r"\W", "_", s)

def instance_dot(inst, edges, extra, skip):
    """class-level diagram: nodes per mapped symbol (grouped roles), edges between roles + literal extras"""
    nodes = {}                                   # symbol -> set(roles)
    for role, sym, rel in inst["roles"]:
        if role in skip or "." in sym: continue
        nodes.setdefault(sym, []).append(role)
    ext = {sym for role, sym, rel in inst["roles"] if rel is None}
    out = ['digraph G {', ' rankdir=LR; fontname="Helvetica"; labelloc=t; label="%s - %s";' % (inst["pattern"], inst["name"]),
           ' node [shape=box, style="rounded,filled", fillcolor="#eef3fb", color="#4a6fa5", fontname="Helvetica", fontsize=10];',
           ' edge [fontname="Helvetica", fontsize=9, color="#555555"];']
    names = {}
    for sym, roles in nodes.items():
        lab = "&laquo;%s&raquo;\\n%s" % (" / ".join(sorted(set(roles))), sym.replace("(", "\\n(") if sym in ext else sym)
        fill = "#fff4d6" if sym in ext else "#eef3fb"
        names[sym] = node_id(sym)
        out.append(' %s [label="%s", fillcolor="%s"];' % (node_id(sym), lab, fill))
    def syms(role): return [s for r, s, f in inst["roles"] if r == role and s in names]
    for a, b, lab, dashed in edges.get(inst["key"], []):
        for x in syms(a):
            for y in syms(b):
                if x == y: continue
                out.append(' %s -> %s [label="%s"%s];' % (names[x], names[y], lab, ", style=dashed" if dashed else ""))
    for a, b, lab, dashed in extra.get(inst["key"], []):
        for s in (a, b):
            if s not in names:
                names[s] = node_id(s)
                out.append(' %s [label="%s", fillcolor="#fff4d6"];' % (node_id(s), s.replace("(", "\\n(")))
        out.append(' %s -> %s [label="%s"%s];' % (names[a], names[b], lab, ", style=dashed" if dashed else ""))
    out.append("}")
    return "\n".join(out)

def render(dot_text, base):
    open(base + ".dot", "w", encoding="utf-8").write(dot_text)
    subprocess.run(["dot", "-Tpng", "-Gdpi=130", base + ".dot", "-o", base + ".png"], check=True)

def instance_diagrams(instances, outdir, edges=EDGES, extra=EXTRA, skip=SKIP_ROLES):
    os.makedirs(outdir, exist_ok=True)
    for inst in instances:
        render(instance_dot(inst, edges, extra, skip), os.path.join(outdir, "%s" % inst["key"]))
