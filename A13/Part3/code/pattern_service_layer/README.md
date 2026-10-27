# Service Layer: Misskey Core Application Service Layer

**Status:** Confirmed with caveat, for this service only. `AnnouncementService` and its caller were read in detail; the other 75 `*Service.ts` files and `CoreModule.ts` were not read, so the claim about the whole layer rests on naming and structure, not on checked behaviour.

**Why this instance:** `AnnouncementService` is the smallest service that combines persistence, event publication and moderation logging, and an endpoint class that calls it.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- `AnnouncementService` (injected repositories, `IdService`, `GlobalEventService`, `ModerationLogService`): packages/backend/src/core/AnnouncementService.ts:10-31
- Use cases: `getUnreadAnnouncements` 45, `create` 69, `update` 121, `delete` 160, `getAnnouncement` 183, `read` 202-224 (same file)
- Caller: packages/backend/src/server/api/endpoints/admin/announcements/create.ts:72-75 (`announcementService.create`)
- Module wiring: packages/backend/src/core/CoreModule.ts:168, 321

**How the source shows the pattern:** An endpoint calls one method, and the service decides everything the operation involves: it inserts the row, publishes the right event (to one user or to everyone), and writes a moderation log entry when a moderator did it. `read` ignores duplicates, deactivates a user's own announcement and announces when nothing is left unread.

**Caveats:** "Service Layer" is a broad architectural label. The evidence here is the use-case boundary of one service plus the 76 `*Service.ts` files in `core/`; only this one was read in detail.

**The small model:** `AnnouncementService` is built from a repository, an event publisher and a moderation log (all injected). `create` publishes `announcementCreated` to `main:<user>` or `broadcast` and logs when a moderator is given; `unread(user)` lists active announcements visible to the user that they have not read; `read` follows the source's rules; `get` raises `not found` for unknown ids and for other users' private announcements. Output lines for events and logs appear in order, and a `deactivated#id` line is a state check made after a `read`.

**Not modelled:** No packing/serialization, no `update`/`delete`, no pagination, ids come from a counter and `isActive`/`isRead` are simplified.

**Shared test cases:** `Part3/test-cases/service_layer.txt` has 8 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
