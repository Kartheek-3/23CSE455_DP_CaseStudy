#!/usr/bin/env python3
"""Check data/code/baseline_83998629 against the upstream per-file hashes.
Run from the team folder: python3 data/code/verify_baseline.py
Expected: 167 identical, 2 redacted (listed in data/provenance/REDACTIONS.md), 1 omitted."""
import hashlib, json, pathlib, sys
root = pathlib.Path(__file__).resolve().parents[2]
tree = root / "data/code/baseline_83998629"
upstream = json.loads((root / "data/provenance/baseline-files.sha256.json").read_text())
redacted = {"canteen/settings.py", "static/js/firebase.js"}
same, red, omitted, bad = [], [], [], []
for rel, digest in sorted(upstream.items()):
    p = tree / rel
    if not p.exists():
        omitted.append(rel)
    elif hashlib.sha256(p.read_bytes()).hexdigest() == digest:
        same.append(rel)
    elif rel in redacted:
        red.append(rel)
    else:
        bad.append(rel)
print(f"identical to upstream: {len(same)}")
print(f"redacted (see data/provenance/REDACTIONS.md): {len(red)} {red}")
print(f"omitted from package: {len(omitted)} {omitted}")
print(f"unexpected differences: {len(bad)} {bad}")
sys.exit(1 if bad else 0)
