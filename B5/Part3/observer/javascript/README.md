# P08 — Observer (GoF): Outbound Mail Delivery Logging (JavaScript)

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

## Build and test (working directory `Part3/observer/javascript`)
```sh
# No compilation necessary
node test_main.js
```
Expected behavior: 7/7 cases pass against `../../common_specs/observer_cases.tsv` and `../../common_specs/observer_expected.tsv`. O01/O04 log complete original event fields; O02/O03/O07 do not notify; O05/O06 return controlled errors.

Actual compiler/runtime: Node.js v22.16.0
Actual compile status: not applicable
Actual test result: 7/7 passed; failures=0; errors=0; skipped=0; exit code 0.

## Recorded measurements
Production LOC: **43** (exclude tests, comments, blanks, fixtures). Maximum function CC: **5** (same McCabe-style counting as the completed Strategy stage).
One warmup and five measured fresh-process runs (milliseconds), using `node test_main.js`:
- Warmup: 37.965193
- Measured: 36.192922, 46.430877, 44.341686, 43.672670, 37.155430
- Median: **43.672670 ms**

Full process timing includes startup, shared fixture input, simulation, comparison and output. It is not isolated Observer algorithm performance. See `timings.csv` and `test_result.txt` for raw evidence.
