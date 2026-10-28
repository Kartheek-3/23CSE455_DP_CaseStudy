# Observed acceptance evidence

The application model and test source were statically reviewed in this environment. One Quarkus REST integration test and three focused rule tests are authored under `code/digital-wallet/src/test/java`, covering transfer balances, the configured FX pair, unsupported currency rejection, transaction limits, and fraud-chain outcomes. Java execution is `not_run` because no JDK or Maven executable was exposed. Run `mvn test` from `code/digital-wallet` on a JDK 17+ workstation before submission. No result is represented as a pass without that execution.
