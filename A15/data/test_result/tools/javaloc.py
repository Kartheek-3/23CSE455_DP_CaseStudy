"""Locate Java declarations (class / method / field) and return (start, end) 1-based line ranges.
Range = leading annotation lines through the closing brace (or the field's semicolon)."""
import re, os

def _code_lines(lines):
    out, in_block = [], False
    for ln in lines:
        s, res, i = ln, "", 0
        while i < len(s):
            if in_block:
                j = s.find("*/", i)
                if j < 0: i = len(s)
                else: in_block, i = False, j + 2
                continue
            if s.startswith("/*", i): in_block, i = True, i + 2; continue
            if s.startswith("//", i): break
            if s[i] == '"':
                j = i + 1
                while j < len(s) and s[j] != '"':
                    j += 2 if s[j] == "\\" else 1
                res += '""'; i = j + 1; continue
            res += s[i]; i += 1
        out.append(res)
    return out

class JavaFile:
    def __init__(self, path):
        self.path = path
        self.raw = open(path, encoding="utf-8").read().split("\n")
        self.code = _code_lines(self.raw)

    def _up(self, idx):
        while idx > 0 and self.code[idx - 1].strip().startswith("@"):
            idx -= 1
        return idx

    def _match_end(self, idx):
        depth, seen = 0, False
        for k in range(idx, len(self.code)):
            for ch in self.code[k]:
                if ch == "{": depth += 1; seen = True
                elif ch == "}": depth -= 1
            if seen and depth == 0: return k
            if not seen and self.code[k].rstrip().endswith(";"): return k
        raise ValueError("no end for line %d in %s" % (idx + 1, self.path))

    def cls(self, name):
        pat = re.compile(r"^\s*(public\s+|abstract\s+|final\s+)*(class|interface|enum|record)\s+%s\b" % re.escape(name))
        for i, c in enumerate(self.code):
            if pat.search(c): return self._up(i) + 1, self._match_end(i) + 1
        return None

    def method(self, name, within=None):
        lo, hi = (0, len(self.code))
        if within: lo, hi = within[0] - 1, within[1]
        pat = re.compile(r"^\s*((public|protected|private|static|final|synchronized)\s+)*[\w<>\[\], ?]+\s+%s\s*\(" % re.escape(name))
        stmt = re.compile(r"^\s*(return|throw|new|else|if|for|while|yield)\b")
        for i in range(lo, hi):
            if pat.search(self.code[i]) and not stmt.search(self.code[i]): return self._up(i) + 1, self._match_end(i) + 1
        return None

    def field(self, name, within=None):
        lo, hi = (0, len(self.code))
        if within: lo, hi = within[0] - 1, within[1]
        pat = re.compile(r"^\s*(private\s+|public\s+|protected\s+|final\s+|static\s+)*[\w<>\[\],.? ]+\s+%s\s*(=[^;]*)?;" % re.escape(name))
        for i in range(lo, hi):
            if pat.search(self.code[i]) and "return" not in self.code[i] and "(" not in self.code[i].split("=")[0]:
                return self._up(i) + 1, i + 1
        return None

    def text(self, a, b): return "\n".join(self.raw[a - 1:b])

def resolve(root, relpath, symbol):
    """symbol forms: 'Cls', 'Cls.member' (method or field). Returns (start,end) or None."""
    jf = JavaFile(os.path.join(root, relpath))
    sym = re.sub(r"\(.*?\)", "", symbol).strip()
    sym = re.sub(r"<.*?>", "", sym).strip()
    parts = sym.split()[0].split(".")
    c = jf.cls(parts[0])
    if len(parts) == 1: return c
    if c is None: return None
    return jf.method(parts[1], c) or jf.field(parts[1], c)

def kind_of(root, relpath, symbol):
    jf = JavaFile(os.path.join(root, relpath))
    sym = re.sub(r"<.*?>", "", re.sub(r"\(.*?\)", "", symbol)).strip().split()[0].split(".")
    if len(sym) == 1: return "class"
    c = jf.cls(sym[0])
    if c and jf.method(sym[1], c): return "method"
    return "field"
