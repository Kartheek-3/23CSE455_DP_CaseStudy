# P08 — Observer (GoF): Outbound Mail Delivery Logging (C++)

**Selected source ID:** P08. **Source instance:** Outbound Mail Delivery Logging. This is a standalone, simulated adaptation of DaPlanStan's Action Mailer delivery-observer behavior. **No real email is sent.** There is no Rails, Action Mailer, network service or external dependency.

## Pattern roles
- **Subject/Publisher:** `MailDeliveryPublisher` stores and notifies currently registered observers.
- **Observer interface/protocol:** `MailObserver.onDelivered(message)`.
- **ConcreteObserver:** `MailLogger` holds the delivered messages it observed.
- **Event:** `MailMessage` with ID, subject and recipient.
- **Registration:** `register`/`unregister` on the publisher (C++ uses `registerObserver`/`unregisterObserver`).
- **Notification point:** `MailDeliveryPublisher.deliver` notifies via the observer contract after a successful delivery.
- **Client:** the language's test runner, which creates fresh subjects/observers and performs O07's explicit register/unregister sequence.

The publisher does **not** directly call a `MailLogger.log` method. Unlike Rails/Action Mailer, this snippet constructs and dispatches a local `MailMessage` without transport or framework callbacks. C++ uses registerObserver/unregisterObserver (register is a C++ language keyword); observer lifetime must outlive the publisher.

## Build and test (working directory `Part3/observer/cpp`)
```sh
g++ -std=c++17 -O2 -Wall -Wextra -pedantic main.cpp test_main.cpp -o observer_tests
./observer_tests
```
Expected behavior: 7/7 cases pass against `../../common_specs/observer_cases.tsv` and `../../common_specs/observer_expected.tsv`. O01/O04 log complete original event fields; O02/O03/O07 do not notify; O05/O06 return controlled errors.

Actual compiler/runtime: g++ (Debian 14.2.0-19) 14.2.0; C++17
Actual compile status: success
Actual test result: 7/7 passed; failures=0; errors=0; skipped=0; exit code 0.

## Recorded measurements
Production LOC: **60** (exclude tests, comments, blanks, fixtures). Maximum function CC: **4** (same McCabe-style counting as the completed Strategy stage).
One warmup and five measured fresh-process runs (milliseconds), using `./observer_tests`:
- Warmup: 3.002566
- Measured: 2.167666, 2.148941, 2.421307, 2.325304, 2.394832
- Median: **2.325304 ms**

Full process timing includes startup, shared fixture input, simulation, comparison and output. It is not isolated Observer algorithm performance. See `timings.csv` and `test_result.txt` for raw evidence.
