# Cache-Aside: Federated Instance Cache-Aside

**Status:** Confirmed with caveat. The two service methods follow Cache-Aside, but the cache object they use is itself a read-through-capable, two-level cache. The overlap with the Two-Level Cache snippet is deliberate: that one covers the cache infrastructure, this one covers the application's own read, query and write-back logic.

**Why this instance:** `FederatedInstanceService` is plain application code that asks the cache first and fills it itself, which is the defining trait of Cache-Aside.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Cache construction (a `RedisKVCache` named `federatedInstance`): packages/backend/src/core/FederatedInstanceService.ts:30
- `fetchOrRegister`: FederatedInstanceService.ts:50-71 (cache `get` 53, repository `findOneBy` 56, `insertOne` 59, `cache.set` 65 and 68)
- Second method `fetch(host)` that also caches a missing instance as null: FederatedInstanceService.ts:73-89
- `update` refreshes the cached copy after a write: FederatedInstanceService.ts:92-103

**How the source shows the pattern:** The service checks `federatedInstanceCache.get(host)`, goes to the database on a miss, inserts the row if the instance is new, and then writes the result into the cache itself. The cache never loads anything on its own.

**Caveats:** The cache is a `RedisKVCache` that is constructed with a `fetcher` (line 33), so it could load from the database itself (read-through) through `fetch(key)`, but these methods only call `get`/`set` and do the database lookup in the service, which is what makes them Cache-Aside. The cache is also itself two-level (that infrastructure is the Two-Level Cache snippet; this snippet is about the application code that decides when to read the cache, query the database and write the cache back) (see the Two-Level Cache snippet), so the two instances share infrastructure. Cache-Aside is about who owns the lookup logic, which in this class is the service.

**The small model:** A repository keyed by host with auto-increment ids, a key-value cache that can hold "known missing", and a service with `fetch_or_register` (returns the instance, registering it if needed) and `lookup` (the source's `fetch`; returns null if unknown and caches that). Hosts are lower-cased as a stand-in for `toPuny`. The result is tagged with where it came from: `cache`, `db` or `insert`.

**Not modelled:** Cache expiry, Redis, the `update`/`delete` paths and the real `toPuny` conversion are not modelled. The repository's `finds`/`inserts` counters exist only so the tests can tell where a result came from.

**Shared test cases:** `Part3/test-cases/cache_aside.txt` has 7 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
