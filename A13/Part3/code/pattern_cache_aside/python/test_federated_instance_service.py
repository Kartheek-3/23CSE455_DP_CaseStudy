import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from federated_instance_service import FederatedInstanceService, InMemoryInstanceRepository, KeyValueCache


def run(text):
    repo, cache = InMemoryInstanceRepository(), KeyValueCache()
    service = FederatedInstanceService(repo, cache)
    out = []
    for command in text.split(";"):
        parts = command.split(" ")
        if parts[0] == "dropcache":
            cache.dispose()
            continue
        finds, inserts = repo.finds, repo.inserts
        if parts[0] == "fetch":
            result = service.fetch_or_register(parts[1])
        else:
            result = service.lookup(parts[1])
        source = "insert" if repo.inserts > inserts else "db" if repo.finds > finds else "cache"
        out.append(("none" if result is None else "%s#%d" % (result.host, result.id)) + "@" + source)
    return "~".join(out)

def main():
    with open(sys.argv[1], encoding="utf-8") as f:
        cases = [l.rstrip("\n").split("|", 2) for l in f if l.strip() and not l.startswith("#")]
    passed = 0
    for name, text, expected in cases:
        got = run(text)
        ok = got == expected
        passed += ok
        print(("PASS " if ok else "FAIL ") + name + ("" if ok else ": expected [%s] got [%s]" % (expected, got)))
    print("passed %d/%d" % (passed, len(cases)))
    sys.exit(0 if passed == len(cases) else 1)


if __name__ == "__main__":
    main()
