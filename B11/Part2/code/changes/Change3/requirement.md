# CH03 — Replace the stubbed password encoder with real BCrypt (refactor)

**Owner:** Sai Tharun / Rakshann (jointly — Template Method + Strategy areas)

## Change and acceptance criteria
The baseline `PasswordEncoder` in `config/SecurityConfiguration.java:57-77` is a stub:
`encode()` returns the plaintext and `matches()` compares plaintext. Replace it with a
real `BCryptPasswordEncoder`.
- **Acceptance:** stored passwords are BCrypt hashes; `matches(raw, hash)` returns true
  for the correct password and false otherwise; login still succeeds for a user created
  with the new encoder.

## Before and after
- **Before commit:** `4e4ebb57` (baseline)
- **After commit:** `c31ce44` (CH01–CH03 applied together to the baseline clone and committed)
- **Changed paths:** `src/main/java/com/dcm/config/SecurityConfiguration.java`
  (+ a one-time migration note for existing rows; see `getPasswordEncoder.after.java`)

## Refactoring
- **Code smell:** security anti-pattern / dead-stub — the Strategy's concrete
  implementation defeats its own purpose (plaintext comparison).
- **Technique:** replace the anonymous stubbed subclass with the real
  `new BCryptPasswordEncoder()` (remove the overridden encode/matches).
- **Behavior-preservation evidence:** the Strategy *structure* and wiring (line 31)
  are unchanged — only the concrete strategy's behavior is corrected. Show a before/after
  diff and a test proving correct/incorrect password handling.
- **Diff:** saved at `Change3/change3.diff` (before/after of `getPasswordEncoder()`).

## Implementation and tests
- **Run command:** `./mvnw test -Dtest=PasswordEncoderTest -DfailIfNoTests=false`
- **Actual test result + log path:** `PasswordEncoderTest` — Tests run: 2, Failures: 0,
  Errors: 0 (OpenJDK 11.0.32). Full log: `test_result/mvn_test.log`. The real
  `BCryptPasswordEncoder` is already on the classpath via `spring-boot-starter-security`.

## Pattern effects
- Instance **Password Encoding Strategy** → *modified* (concrete strategy replaced;
  structure preserved).

## Before/after metrics
Same scope measured before and after on `config/SecurityConfiguration.java`:
- **File length:** 79 → 59 lines (net −20); the `getPasswordEncoder()` body goes
  from 21 lines (anonymous stubbed subclass overriding `encode`/`matches`) to 3 lines
  (`return new BCryptPasswordEncoder();`).
- **Behavior:** `encode()` now yields a `$2`-prefixed BCrypt hash (not plaintext);
  `matches()` accepts the correct password and rejects a wrong one — proven by
  `PasswordEncoderTest` (2/2 pass). Strategy structure and wiring (line 31) unchanged.
