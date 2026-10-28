from sample import *
from pathlib import Path
import sys

def execute(a,b,c):
    used = []
    def recovery(code):
        if code != "R-1" or used: return False
        used.append(code)
        return True
    strategy = Totp(lambda code: code == "123456") if a == "totp" else Recovery(recovery)
    login = Login(strategy)
    return ":".join("ok" if login.authenticate(b) else "fail" for _ in range(2))

count=0
for line in Path(sys.argv[1]).read_text().splitlines():
    a,b,c,expected=line.split("\t")
    actual=execute(a,b,c)
    assert actual == expected, (a,b,c,actual,expected)
    count+=1
print(f"PASS {count}/{count}")
