"""Counts JUnit XML results for one package, using each file's testsuite name (Gradle shortens long file names).
Usage: python3 count_tests.py <results-dir> <package-prefix> [label]"""
import sys, glob, xml.etree.ElementTree as ET
d, prefix = sys.argv[1], sys.argv[2]
label = sys.argv[3] if len(sys.argv) > 3 else ""
n = t = s = f = e = 0
for p in glob.glob(d + "/TEST-*.xml"):
    r = ET.parse(p).getroot()
    if r.get("name", "").startswith(prefix):
        n += 1; t += int(r.get("tests")); s += int(r.get("skipped")); f += int(r.get("failures")); e += int(r.get("errors"))
print(f"{label} classes {n} tests {t} skipped {s} failures {f} errors {e}".strip())
