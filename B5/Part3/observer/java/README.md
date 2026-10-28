# P08 — Observer (GoF): Outbound Mail Delivery Logging (Java)

**Selected source ID:** P08. **Source instance:** Outbound Mail Delivery Logging. This is a standalone, simulated adaptation of DaPlanStan's Action Mailer delivery-observer behavior. **No real email is sent.** There is no Rails, Action Mailer, network service or external dependency.

## Pattern roles
- **Subject/Publisher:** `MailDeliveryPublisher` stores and notifies currently registered observers.
- **Observer interface/protocol:** `MailObserver.onDelivered(message)`.
- **ConcreteObserver:** `MailLogger` holds the delivered messages it observed.
- **Event:** `MailMessage` with ID, subject and recipient.
- **Registration:** `register`/`unregister` on the publisher (C++ uses `registerObserver`/`unregisterObserver`).
- **Notification point:** `MailDeliveryPublisher.deliver` notifies via the observer contract after a successful delivery.
- **Client:** the language's test runner, which creates fresh subjects/observers and performs O07's explicit register/unregister sequence.

The publisher does **not** directly call a `MailLogger.log` method. Unlike Rails/Action Mailer, this snippet constructs and dispatches a local `MailMessage` without transport or framework callbacks. 

## Build and test (working directory `Part3/observer/java`)
```sh
javac Main.java TestMain.java
java TestMain
```
Expected behavior: 7/7 cases pass against `../../common_specs/observer_cases.tsv` and `../../common_specs/observer_expected.tsv`. O01/O04 log complete original event fields; O02/O03/O07 do not notify; O05/O06 return controlled errors.

Actual compiler/runtime: OpenJDK openjdk version "21.0.12.1" 2026-08-18; javac 21.0.12.1
Actual compile status: success
Actual test result: 7/7 passed; failures=0; errors=0; skipped=0; exit code 0.

## Recorded measurements
Production LOC: **47** (exclude tests, comments, blanks, fixtures). Maximum function CC: **5** (same McCabe-style counting as the completed Strategy stage).
One warmup and five measured fresh-process runs (milliseconds), using `java TestMain`:
- Warmup: 88.642371
- Measured: 126.393189, 104.698624, 103.541662, 116.814760, 109.548044
- Median: **109.548044 ms**

Full process timing includes startup, shared fixture input, simulation, comparison and output. It is not isolated Observer algorithm performance. See `timings.csv` and `test_result.txt` for raw evidence.
