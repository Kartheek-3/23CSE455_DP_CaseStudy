"""Exact-text replacement that respects each file's line endings (used to apply the CH01-CH03 edits)."""
import sys, json
def sub(path, old, new):
    raw = open(path, encoding='utf-8', newline='').read()
    crlf = '\r\n' in raw
    if crlf:
        old = old.replace('\r\n', '\n').replace('\n', '\r\n'); new = new.replace('\r\n', '\n').replace('\n', '\r\n')
    n = raw.count(old)
    if n != 1:
        raise SystemExit(f"{path}: expected 1 match, found {n}: {old[:80]!r}")
    open(path, 'w', encoding='utf-8', newline='').write(raw.replace(old, new))
    print("ok", path)
if __name__ == '__main__':
    for path, old, new in json.load(open(sys.argv[1], encoding='utf-8')):
        sub(path, old, new)
