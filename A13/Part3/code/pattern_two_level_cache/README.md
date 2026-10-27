# Two-Level Cache: RedisSingleCache L1/L2 Cache

**Why this instance:** `RedisSingleCache` is the instance recorded in the input and its `get`/`fetch`/`set` show both levels clearly. (`RedisKVCache` right above it is the keyed sibling and is not used.)

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- `RedisSingleCache`: packages/backend/src/misc/cache.ts:113-205 (`get` reads memory, then Redis; `set` writes both; `fetch` falls back to the fetcher; `delete` clears both)
- Level 1 `MemorySingleCache`: cache.ts:340
- Fetcher passed in through the constructor options: cache.ts:116, 125-133

**How the source shows the pattern:** `get()` returns the in-process value if it is fresh, otherwise reads Redis and copies the result into memory, and `fetch()` calls the fetcher only when both levels are empty, then writes both. Other worker processes share the Redis level but each has its own memory level.

**Caveats:** Redis key expiry (the source sets `EX` from the lifetime) is not modelled; only the memory level expires. This pattern is about cache infrastructure: how one cache object keeps a fast in-process copy in front of a shared Redis copy and falls back to a fetcher. It is separate from Cache-Aside, which is about application code deciding when to read or fill a cache around its database; see the Cache-Aside README.

**The small model:** L1 is a single value with a lifetime of 100 time units and a fake clock; L2 is a key-value fake that counts reads; the fetcher returns `v1`, `v2`, ... Results are tagged with the level that answered (`fetcher`, `L2`, `L1`). `newproc` creates a second cache object on the same Redis fake to show another process finding the value in L2.

**Not modelled:** No serialization converters, no async calls, no TTL in L2. The source awaits Redis writes on purpose (see the comment at cache.ts:178-184); the model is synchronous.

**Shared test cases:** `Part3/test-cases/two_level_cache.txt` has 7 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
