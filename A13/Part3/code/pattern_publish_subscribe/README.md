# Publish-Subscribe: Global Event Publication and Streaming Subscription

**Why this instance:** It is the clearest publisher/subscriber pair in the backend: one service publishes without knowing the consumer, and another class subscribes and forwards.

**Source participants** (Misskey commit `53ac6808ae4921305e761c545863ee6593edd1f4`):

- Publisher `GlobalEventService.publish` writing JSON to `redisForPub.publish`: packages/backend/src/core/GlobalEventService.ts:352-361
- `publishBroadcastStream` 369, `publishMainStream` 374 (same file)
- Subscription to the host channel: packages/backend/src/GlobalModule.ts:78 (`redis.subscribe(config.host)`)
- Subscriber `redisForSub.on('message', ...)`: packages/backend/src/server/api/StreamingApiServerService.ts:104
- Per-connection fan-out through an in-process emitter (`ev.emit(data.channel, data.message)`): StreamingApiServerService.ts:116-122

**How the source shows the pattern:** Producers call `publishMainStream(userId, type, value)` or `publishBroadcastStream(type, value)`. The message goes to Redis, and the streaming server, which was subscribed since start-up, turns it into events for each WebSocket connection. Publishers never reference connections.

**Caveats:** Redis is used as a single channel keyed by host, and the selection by `mainStream:<id>` happens afterwards in-process. The model merges both steps into one broker with channel subscriptions, so it simplifies how the source routes messages.

**The small model:** `Broker.subscribe(channel, handler)`, `unsubscribe`, and `publish(channel, message)` which returns how many handlers received the message. `GlobalEventService` builds the channel name (`mainStream:<userId>` or `broadcast`) and a JSON message `{"type":..,"body":..}`. A message to a channel with no subscribers is dropped (the command output shows `dropped:<channel>`), like a Redis publish with no listeners.

**Not modelled:** No real network, no connection lifecycle, no ordering guarantees beyond registration order.

**Shared test cases:** `Part3/test-cases/publish_subscribe.txt` has 5 cases. Each line is `case|input|expected output`; the input is a list of commands separated by `;` and the expected output joins result lines with `~`. All four languages read this same file, and `ERR:` marks an expected error. Per-language READMEs are in the `java/`, `python/`, `javascript/` and `cpp/` folders; measurements are in `data/cross_language.csv` and `Part3/evidence/`.
