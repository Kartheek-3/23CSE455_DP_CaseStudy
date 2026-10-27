# Frozen shared Observer fixture specification — P08

Confirmed DaPlanStan instance: **Observer (GoF) — Outbound Mail Delivery Logging** (P08).
Both UTF-8 TSV files are authoritative and shared unchanged by Java, Python, JavaScript and C++.
The case header is `case_id`, `register_logger`, `delivered`, `message_id`, `subject`, `recipient`.
Literal `~` means an absent recipient. All other message text is literal and preserved.
The output is one line per case; a successful delivery logged by an observer has five tab-separated fields: `case_id`, `LOGGED`, `message_id`, `subject`, `recipient`. No notification has two fields: `case_id`, `NO_NOTIFICATION`. An error has three fields: `case_id`, `ERROR`, error code.
The expected TSV header is informational; each runner skips it and compares exact remaining lines without altering expected values.

## Frozen O01–O07 scenarios

- O01 registered, delivered: `LOGGED` with the delivered message fields.
- O02 not registered, delivered: `NO_NOTIFICATION`.
- O03 registered, delivery failed: `NO_NOTIFICATION`.
- O04 registered, a second valid message delivered: `LOGGED` with that message's fields.
- O05 delivery attempted without recipient (`~`): `ERROR INVALID_RECIPIENT`.
- O06 invalid registration flag (`MAYBE`): `ERROR INVALID_FLAG`.
- O07 **fixed test-runner sequence**: `register(logger)` → `unregister(logger)` → successful delivery → `NO_NOTIFICATION`. The frozen six-column input format has no separate sequence column; O07's explicitly frozen case ID specifies this setup sequence in the test runner. Publisher production code never branches on case IDs.

Each case constructs a fresh publisher and logger, validates YES/NO flag fields, and simulates local delivery without actually sending an email. A delivered `YES` request validates a nonblank recipient before notifying observers. Failed deliveries do not notify. The publisher must notify through a generic Observer callback and must not special-case MailLogger.

## Locked fixture SHA-256
94b91711bd90a40ef91991c8f0a584049651ccdf7f56a873ca6693d705cd1194  observer_cases.tsv
0fa446f53a67ef75c77c32723c07d4f27877e5cad1e9deea08c44b3fd9c5ebc8  observer_expected.tsv
