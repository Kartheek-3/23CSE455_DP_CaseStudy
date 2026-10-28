import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from redis_single_cache import RedisSingleCache


class FakeRedis:
    def __init__(self):
        self.data = {}
        self.reads = 0

    def get(self, key):
        self.reads += 1
        return self.data.get(key)

    def set(self, key, value):
        self.data[key] = value

    def delete(self, key):
        self.data.pop(key, None)


def run(text):
    redis, now, calls = FakeRedis(), [0], [0]

    def fetcher():
        calls[0] += 1
        return "v%d" % calls[0]

    def new_cache():
        return RedisSingleCache(redis, "demo", 100, fetcher, lambda: now[0])

    def answered(action):
        reads, fetched = redis.reads, calls[0]
        value = action()
        if value is None:
            return "none"
        level = "fetcher" if calls[0] > fetched else "L2" if redis.reads > reads else "L1"
        return "%s@%s" % (value, level)

    cache = new_cache()
    out = []
    for command in text.split(";"):
        parts = command.split(" ")
        if parts[0] == "fetch":
            out.append(answered(cache.fetch))
        elif parts[0] == "get":
            out.append(answered(cache.get))
        elif parts[0] == "delete":
            cache.delete()
        elif parts[0] == "tick":
            now[0] += int(parts[1])
        elif parts[0] == "newproc":
            cache = new_cache()
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
