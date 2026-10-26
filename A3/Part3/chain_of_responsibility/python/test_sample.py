from sample import *
from pathlib import Path
import sys

def execute(a,b,c):
    try:
        rule = Positive(Funds(HighValue(int(c))))
        return "allow" if rule.allows(int(a), int(b)) else "reject"
    except ValueError:
        return "error"

count=0
for line in Path(sys.argv[1]).read_text().splitlines():
    a,b,c,expected=line.split("\t")
    actual=execute(a,b,c)
    assert actual == expected, (a,b,c,actual,expected)
    count+=1
print(f"PASS {count}/{count}")
