# Repository: Misskey Persistence Repository Layer

**Status:** Confirmed with caveat, as a framework idiom. The repository abstraction is TypeORM's `Repository<T>`; Misskey adds DI wiring and one extension method and defines no repository interface of its own.

**Why this instance:** It is the persistence abstraction every service uses. The audit marked it as a weaker fit, so this README is explicit about what the source does and does not show.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Extension interface `MiRepository<T>` and implementation `miRepository.insertOne`: packages/backend/src/models/_.ts:89-97
- Typed repositories such as `UsersRepository = Repository<MiUser> & MiRepository<MiUser>`: models/_.ts:184 (`AnnouncementsRepository`), 229 (`UsersRepository`)
- Provider that builds each repository: packages/backend/src/models/RepositoryModule.ts:91-95 (`db.getRepository(MiUser).extend(miRepository)`)
- Clients: services such as `UserService` and `AnnouncementService` get repositories injected through DI tokens

**How the source shows the pattern:** Services do not touch the data source. They receive a repository object (`DI.usersRepository`) and call `findOneBy`, `update`, `insertOne` and similar on it, so persistence is hidden behind that object and swapped by DI.

**Caveats:** The repository abstraction comes from TypeORM's `Repository<T>`, not from Misskey. Misskey adds the DI wiring and one extension method (`insertOne`) and does not define a domain-specific repository interface. It is counted as the Repository pattern by way of a framework idiom; the claim is not that Misskey designed its own.

**The small model:** The cross-language example models the repository collaboration with an in-memory store. It does not reproduce TypeORM. `InMemoryRepository` plays `Repository<T>` (`insert`, `findOneBy`, `findOneOrFail`, `count`), `MiRepository` adds `insertOne` (insert, then read the row back by its identifiers) and is mixed in to give `UsersRepository`, and `UserService` receives it through its constructor.

**Not modelled:** No SQL, relations, transactions, entity metadata or DI container; entities are string maps.

**Shared test cases:** `Part3/test-cases/repository.txt` has 6 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
