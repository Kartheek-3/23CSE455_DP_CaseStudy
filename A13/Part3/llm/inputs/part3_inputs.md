# Inputs supplied to the model in the Part 3 session

Source application: Misskey, commit `53ac6808ae4921305e761c545863ee6593edd1f4` (working tree clean when checked at the start of implementation).
Paths are relative to the workspace root `~/design_patterns_case_study/`; SHA-256 values are of the files as they were when this list was written.
The model read the Misskey files through targeted `sed`/`grep` line ranges and through a pre-built code index of the Misskey checkout (fast mode, indexed 2026-10-10), not as whole-file dumps.

## Assignment and workspace files

| file | sha256 |
|---|---|
| CLAUDE.md | d2fe0bed04cfaba42d7ea02ac62e84872c1370eab492eaf84dba7b3db42875a2 |
| DP_Csestudy.pdf | aa83794960a301dc919c26b409918ccb94a4d6fcd42696a4318f13bc5ed25212 |
| DP_Csestudy_report.pdf | 5b18709bd3d8858f86a7218af3e865dc0e42603bc2f0f0b1cecf11bccb1cb554 |
| audit-input/patterns.csv | 5cafed388ed9f89eca412ae199d26cdbf6f81e20f47f311d74f6e1a9316660ea |
| audit-input/pattern_counts.csv | 31cfa4c87629c59ad2e7c69e9057aa9667eb38b4b38509bed289f54cd648c4ea |
| audit-results/summary.md | bea90e94321e781794e49ec37819080ed053b4e691acd402037155ffa5e337e2 |
| audit-results/coverage.md | 058255b60443d4a922a0655a0a575870c30e5192d5a572fafc574192d35f5120 |
| audit-results/validation.csv | e73beeee39cc8cbd196449534d7c9d3ff5ed5240634edcee4daf739388a36665 |
| audit-results/new_patterns.csv | 6a15195241cbd2b8ef705df4d283b0906d52b9f26350fdd67e56a073d1c0c7b6 |

## Misskey source files read for the 15 verified instances

| file | sha256 |
|---|---|
| misskey/packages/backend/src/logging/LogBackend.ts | cfb1979076022003c5c144685be86719801f85e2968fad13da3b716750a38a07 |
| misskey/packages/backend/src/logging/LogManager.ts | fdc6c898791b76f3f7d53d5a25ba61f6de83d4fc3f434db7c9ce3643ea030bd6 |
| misskey/packages/backend/src/logging/logging-runtime.ts | 64247430b0df005bdc715400eb32e0dea301d04aa87b2d8d83a474b98526bca5 |
| misskey/packages/backend/src/logging/BootstrapConsoleBackend.ts | d066c8e41fe4f3612f7cc19e8a638e1b600a9b5efde755db94c5a31aab3a8988 |
| misskey/packages/backend/src/logging/JsonConsoleBackend.ts | bd351be0e1b0a7c0bd817c54186f6d1789e8da87898b3ca1ee7fde75920c63ef |
| misskey/packages/backend/src/logging/PrettyConsoleBackend.ts | 341699f199e8532c9b3a0d014da21f969d2d70f726ee1d2a6d45ad4412596b30 |
| misskey/packages/backend/src/core/telemetry/adapters/TelemetryAdapter.ts | f8bca8249aa745a04e9da9ba8d02232cb8f3857f148a57777283e8c8f2640c37 |
| misskey/packages/backend/src/core/telemetry/adapters/SentryTelemetryAdapter.ts | d425ee9b52849fee0e960f185d9cdb79e20d9b426f063b94d5efe372d553a785 |
| misskey/packages/backend/src/core/telemetry/telemetry-registry.ts | 61f2334254c8f49cfee0f52b183315754a6ed664cb533c069fa7589528df737b |
| misskey/packages/backend/src/core/chart/core.ts | 0fae5de0dcfb05018ffaf4f83bfc82e377d3fe316f05d4e057c3edc8c52bb6b3 |
| misskey/packages/backend/src/core/chart/charts/active-users.ts | 1208b0bec882f74b62ffc7bfd732952376dd45a357b18752e84a75a95daba4a7 |
| misskey/packages/backend/src/misc/cache.ts | 99ea27bbf1287bbc6b2fc08fb7ce083395f30cdca7d6f5d9aca6048d5d9ef95c |
| misskey/packages/backend/src/core/FederatedInstanceService.ts | 84ac1640b6eda2d838e44a80c7db1bd5ca1c6b2273793eee6b3af805db9714af |
| misskey/packages/backend/src/core/GlobalEventService.ts | 1012c3bd8e7920d888f4d0fe9c7d5aea64c81348431b8bbb63c37629b993bc84 |
| misskey/packages/backend/src/server/api/StreamingApiServerService.ts | 14448639f51526a12b741f7278ef09abf2b9f0296f0fc13ee20a8ed03e24147e |
| misskey/packages/backend/src/core/QueueService.ts | 5889c68d68c0f3131ce29e09adade579e716b6a78e9b9388f87487a4ea73a227 |
| misskey/packages/backend/src/queue/QueueProcessorService.ts | 5f625e41df30f970506898463240c98b954eaa4ec783a07a0833f746926ad61d |
| misskey/packages/backend/src/queue/processors/DeliverProcessorService.ts | 1837a7bcc1871c88e25d7a90035730c2c7ddd17b238a56415c33f3e7301ffd85 |
| misskey/packages/backend/src/server/api/ApiServerService.ts | 99b599f42431a18eca5740df054804a27bb9b0b5206d3a39ae93d683410342a0 |
| misskey/packages/backend/src/server/api/ApiCallService.ts | da6431575d066d3b71633bead6e5d26130482d8b2a57a01179a1ab82a3032283 |
| misskey/packages/backend/src/core/AnnouncementService.ts | ce009b50249aa5041f2457d4633e7c8695e51dd34a90c7188f38cbf6ee76c436 |
| misskey/packages/backend/src/server/api/endpoints/admin/announcements/create.ts | 093bcd6b1f1b9a3025de21d02235a3190d1b66324891b89aa84b812d36be2ee6 |
| misskey/packages/backend/src/core/CoreModule.ts | ead88b9eebd7ae84b2d5d16048b14b1ec8afef3dea7e15a5e7dbbae11fd9006e |
| misskey/packages/backend/src/models/_.ts | 03554499d5eb569d3267040967d67959d1b1072abed11cd016094f6510032b26 |
| misskey/packages/backend/src/models/RepositoryModule.ts | 536feef52a211d6fe231fb51a65a7e7e0a53df365465a0de50c1c75ca56f0e55 |
| misskey/packages/frontend/src/analytics.ts | 1dc526caf3c3aa5e3429b23d9575dca543f3e48a555da7390cc17d4899002f99 |
| misskey/packages/frontend/src/preferences/manager.ts | c933bc36a3e13eb04488e7f40de598361d37351c0a65076a5a7701942c7526af |
| misskey/packages/frontend/src/preferences.ts | 97afe9eb561e047c6beb9fd3e6a652554f0f7e6537b230364cb74ce7606e8fb3 |
| misskey/packages/frontend/src/lib/nirax.ts | 3e832945d10e01008059d53fe6fdcca574b72f4b2eb3fc13eafcc91967ff5b01 |
| misskey/packages/frontend/src/router.definition.ts | 1bedb4db596330ab8fd90c5b399f56d61353796d4662f90dd514189bf07a0289 |
| misskey/packages/frontend/src/plugin.ts | 4a6f354b2f4380e79dd024b354410753f31aa9a4916c5a624d3fac5ba0f06a4a |

## Shared test fixtures written for the snippets

`Part3/test-cases/*.txt` (15 files; written by the model in this session, so they are outputs, not supplied inputs).
