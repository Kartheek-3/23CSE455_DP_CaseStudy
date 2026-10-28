# CH01 — Add a configurable late-fee policy (extends Strategy)

**Owner:** Rakshann (Strategy lane)

## Change and acceptance criteria
Add a second fine-calculation policy so the fee charged on an overdue case action
can be switched without changing the calling code.
- **Acceptance:** with the "advocate" policy selected, a 10-day overdue item is
  charged 23.00; with "regular", 50.00. Switching policy changes only the injected
  strategy, not the context.

## Before and after
- **Before commit:** `4e4ebb57` (baseline)
- **After commit:** `c31ce44` (CH01–CH03 applied together to the baseline clone and committed)
- **Changed paths:**
  - `src/main/java/com/dcm/strategy/FinePolicy.java` (Strategy interface)
  - `src/main/java/com/dcm/strategy/RegularFine.java` (ConcreteStrategy A, `@Primary`)
  - `src/main/java/com/dcm/strategy/AdvocateFine.java` (ConcreteStrategy B)
  - `src/main/java/com/dcm/strategy/FineService.java` (Context)
  - `src/test/java/com/dcm/strategy/FineServiceTest.java` (3 JUnit 5 tests)

## Implementation and tests
A reference, runnable implementation of exactly this collaboration also exists in
`Part3/strategy/` (Java/Python/JS/C++) and passes 8/8 shared cases. The same
`FinePolicy` / `RegularFine` / `AdvocateFine` / `FineService` structure was ported
into the app's `com.dcm.strategy` package.
- **Run command:** `./mvnw test -Dtest=FineServiceTest -DfailIfNoTests=false`
- **Actual test result + log path:** `FineServiceTest` — Tests run: 3, Failures: 0,
  Errors: 0 (OpenJDK 11.0.32). Full log: `test_result/mvn_test.log`.
- **Integration finding:** two `FinePolicy` beans (`regularFine`, `advocateFine`)
  caused a `NoUniqueBeanDefinitionException` on app startup; resolved by marking
  `RegularFine` `@Primary` (default injected strategy; callers still switch via
  `setPolicy`). Verified by a successful app boot — see
  `test_result/app_startup.log` and `test_result/ENVIRONMENT_NOTES.md`.

## Pattern effects
- Instance **Password Encoding Strategy** → *preserved*.
- Instance **Overdue Fine Strategy** → *newly_introduced* (a second Strategy collaboration).

## Refactoring
None required for CH01 (pure extension). Code smell addressed in CH03.
