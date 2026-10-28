from sample import *
from pathlib import Path
import sys

def execute(a,b,c):
    def vendor(payload):
        assert payload == {"to": a, "html": b}
        if c == "throw":
            raise RuntimeError("simulated")
        return int(c)
    return EmailAdapter(vendor).send(a, b)

count=0
for line in Path(sys.argv[1]).read_text().splitlines():
    a,b,c,expected=line.split("\t")
    actual=execute(a,b,c)
    assert actual == expected, (a,b,c,actual,expected)
    count+=1
print(f"PASS {count}/{count}")
