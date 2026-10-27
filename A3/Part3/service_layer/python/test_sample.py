from sample import *
from pathlib import Path
import sys

def execute(a,b,c):
    class Store:
        account = {"balance": int(a)} if c == "yes" else None
        def load(self): return self.account
        def save(self, account): self.account = account
    store = Store()
    notices = []
    PostingService(store, lambda: notices.append("sent")).post(int(b))
    balance = store.account["balance"] if store.account else "missing"
    return str(balance) + ":" + str(len(notices))

count=0
for line in Path(sys.argv[1]).read_text().splitlines():
    a,b,c,expected=line.split("\t")
    actual=execute(a,b,c)
    assert actual == expected, (a,b,c,actual,expected)
    count+=1
print(f"PASS {count}/{count}")
