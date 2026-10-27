# CH02 — Add an SMS notification channel (extends Observer)

**Owner:** Nithilesh (Observer lane)

## Change and acceptance criteria
Add a second notification channel so a hearing reminder reaches users by SMS in
addition to email, without changing the code that raises the reminder.
- **Acceptance:** when a hearing reminder fires, both an email notifier and an SMS
  notifier receive the same (caseNo, date); adding the SMS channel does not modify
  the reminder-raising method.

## Before and after
- **Before commit:** `4e4ebb57` (baseline)
- **After commit:** `c31ce44` (CH01–CH03 applied together to the baseline clone and committed)
- **Changed paths:**
  - `src/main/java/com/dcm/observer/HearingObserver.java` (Observer interface)
  - `src/main/java/com/dcm/observer/CaseRegister.java` (Subject — holds observer list)
  - `src/main/java/com/dcm/observer/EmailReminderObserver.java` (ConcreteObserver A)
  - `src/main/java/com/dcm/observer/SmsReminderObserver.java` (ConcreteObserver B — new channel)
  - `src/test/java/com/dcm/observer/CaseRegisterTest.java` (2 JUnit 5 tests)

## Implementation and tests
Reference runnable implementation in `Part3/observer/` (all four languages, 8/8 cases):
`CaseRegister` (subject) + `EmailReminderObserver` / `SmsReminderObserver` (observers).
Porting this into the app ALSO upgrades the Part-1 "uncertain" scheduler-Observer into a
genuine subject-maintains-observers Observer (recorded in `data/patterns_evolution.csv`).
- **Run command:** `./mvnw test -Dtest=CaseRegisterTest -DfailIfNoTests=false`
- **Actual test result + log path:** `CaseRegisterTest` — Tests run: 2, Failures: 0,
  Errors: 0 (OpenJDK 11.0.32). Full log: `test_result/mvn_test.log`.

## Pattern effects
- Instance **Hearing/Reminder Notification** → *modified / extended*: gains a real
  Subject with registered Observers; status moves from `uncertain` toward a confirmed
  Observer. Explain the relationship to the previous scheduler-driven collaboration.
