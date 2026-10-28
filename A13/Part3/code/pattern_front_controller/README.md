# Front Controller: Misskey API Front Controller

**Status:** Confirmed with caveat. A shared handler authenticates, rate-limits and dispatches every API call, but Fastify gets one route per endpoint and the real rate limit is optional and per endpoint. There is no single entry route.

**Why this instance:** All API requests pass through one component that authenticates, rate-limits and dispatches, which is what the Front Controller pattern describes.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Registration of every endpoint (loop over `endpoints`, `moduleRef.get('ep:' + name).exec`): packages/backend/src/server/api/ApiServerService.ts:65-106
- Controller `ApiCallService.handleRequest`: packages/backend/src/server/api/ApiCallService.ts:194 (authentication at 212); `handleMultipartRequest` 233
- Rate limiting: ApiCallService.ts:387-391
- Dispatch `ep.exec(...)`: ApiCallService.ts:498

**How the source shows the pattern:** Whatever the endpoint, the request goes through the same `handleRequest`: look up the credential, apply the endpoint's rate limit, then call the endpoint's `exec`. Endpoint classes do not repeat that logic.

**Caveats:** Fastify gets one route per endpoint (the loop in `ApiServerService`), not a single route that dispatches by name. The shared pre-processing sits in `ApiCallService`, so it is treated as a Front Controller with a framework doing the routing, not a literal single-entry servlet.

**The small model:** `ApiController.handle(name, token, body)` returns a status and text. It answers 404 for an unknown endpoint, 401 when the endpoint needs a credential and the token does not resolve to a user, 429 when the actor has already made two successful requests, and otherwise 200 with the endpoint's result. Actors are the user or `anon`. The three endpoints (`ping`, `notes/create`, `i`) are defined by the test.

**Not modelled:** Parameter validation, multipart handling, time windows and the API's real error format are not modelled. The rate limit is the model's own simplification: in the source it applies only when the endpoint declares `meta.limit`, is keyed per endpoint (`limit.key = ep.name`, ApiCallService.ts:368-391) and uses a user id or an IP hash as the actor; the model uses one fixed limit of 2 calls per actor across all endpoints and never resets it.

**Shared test cases:** `Part3/test-cases/front_controller.txt` has 7 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
