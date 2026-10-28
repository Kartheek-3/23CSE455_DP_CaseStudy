# Part 3 — Dependency Injection (cross-language)

Dependency Injection / IoC: a class receives its collaborators from the outside
instead of constructing them itself.

- `NotificationSender` is the abstract dependency (`channel`, `send`).
- Concrete implementations: `EmailSender`, `SmsSender`.
- `NotificationService` takes a `NotificationSender` through its **constructor**
  (constructor injection) and delegates `notify` to it.
- A composition root (`buildNotificationService` / `NotificationService.build`)
  wires a concrete sender in one place.

Dependency Injection / IoC is a confirmed Part 1 (baseline) pattern. This snippet
is a representative small problem — a notification service with an injected sender.

Implementations (production snippet + tests in each directory):

| Language | Production | Test | Result | Median ms |
|---|---|---|---|---|
| JavaScript | `javascript/notification_service.js` | `javascript/test_dependency_injection.js` | 6/6 | 80.494 |
| Python | `python/notification_service.py` | `python/test_dependency_injection.py` | 6/6 | 45.405 |
| Java | `java/NotificationService.java` | `java/DependencyInjectionTest.java` | 6/6 | 141.076 |
| C++ | `cpp/notification_service.hpp` | `cpp/dependency_injection_test.cpp` | 6/6 | 17.053 |

Shared test cases (identical inputs/expected results in every language):

1. `EmailSender.channel() == "email"`.
2. service built with `EmailSender` → `notify("hi") == "email:hi"`.
3. `SmsSender.channel() == "sms"`.
4. service built with `SmsSender` → `notify("hi") == "sms:hi"`.
5. the same service class produces different output for different injected
   senders (proves the dependency, not the class, decides behaviour).
6. the composition root wires an `EmailSender` → `notify("p") == "email:p"`.

Run instructions, LOC/CC/timing rules and the exact commands are in each
language's README. Raw runs are in `../evidence/DependencyInjection_*.txt`.
