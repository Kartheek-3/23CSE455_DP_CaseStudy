from sample import *
from pathlib import Path
import sys

def execute(a,b,c):
    try:
        headers = HeaderBuilder().add("X-Test", "old").add(a, b).remove(c).build()
        return headers.get("X-Test", "missing")
    except ValueError:
        return "error"

count=0
for line in Path(sys.argv[1]).read_text().splitlines():
    a,b,c,expected=line.split("\t")
    actual=execute(a,b,c)
    assert actual == expected, (a,b,c,actual,expected)
    count+=1
print(f"PASS {count}/{count}")
