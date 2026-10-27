# B11 — Environment & run notes (test_result/)

Machine: macOS (Darwin 27.0.0, Apple Silicon). Run date: 2026-10-10.

## Toolchain actually used
- **JDK: Homebrew `openjdk@11` = OpenJDK 11.0.32.1** (keg-only at
  `/opt/homebrew/opt/openjdk@11`). Installed for this work because the only
  pre-existing JDK was Homebrew OpenJDK **25.0.1**, which is too new for the
  app's declared Spring Boot 2.4.0 / Java 8 target. Java 11 was put on PATH via
  `JAVA_HOME=/opt/homebrew/opt/openjdk@11` for the Maven build and for
  `measure.py`.
  - Note: `install_mac.sh` as written would have *skipped* the JDK install on
    this machine (its guard installs Temurin 11 only when `javac` is absent, and
    OpenJDK 25's `javac` was present). The Temurin **cask** also needs a sudo
    password; the `openjdk@11` **formula** used here is keg-only and needed none.
- Python 3.9.6, Node v25.9.0, g++ = Apple clang 21.0.0 (for Part 3).
- MySQL: **not installed** on this machine (see item 5 below).

## Baseline
- legalSystem cloned to `.run/legalSystem`; baseline HEAD
  `4e4ebb574d6730614855899e032fd5a79b04da63` == requested `4e4ebb57`
  (`baseline_commit.txt`).

## Item 4 — unit tests (JDK-compatibility finding, honest)
- `mvn_test.log` contains **two** runs:
  1. **First run = BUILD FAILURE**, honestly recorded. It failed at
     `maven-compiler-plugin:testCompile`, *not* on the Part-2 tests, but on the
     repo's own default baseline test
     `src/test/java/com/dcm/demo/LegalAppApplicationTests.java`. That file is
     **JUnit 4** (`org.junit`, `@RunWith(SpringRunner.class)`), but **Spring Boot
     2.4.0's `spring-boot-starter-test` dropped the JUnit Vintage engine**, so
     the JUnit 4 API is not on the test classpath. Maven compiles *all* test
     sources before running the `-Dtest` subset, so this unrelated baseline file
     blocked the three Part-2 tests. This is a real baseline/version
     incompatibility in the old app.
  2. **Second run = BUILD SUCCESS**, with the broken baseline test temporarily
     moved aside (restored immediately after). This is the real result for the
     three Part-2 JUnit 5 tests:
     - `FineServiceTest`   — Tests run: 3, Failures: 0, Errors: 0
     - `CaseRegisterTest`  — Tests run: 2, Failures: 0, Errors: 0
     - `PasswordEncoderTest` — Tests run: 2, Failures: 0, Errors: 0
     - Total: **7 run, 0 failures, 0 errors.**
- The committed tree (`after_commit.txt` =
  `c31ce441822614e731e0b7066cb29bf25d8f348f`) contains only the Part-2 changes;
  the baseline test was restored before committing.

## Item 6 — Part 3 timings (`cross_language_thismachine.csv`)
- `measure.py` ran cleanly; all 16 targets (4 patterns x 4 languages) compiled
  and executed with no errors. The `median_process_ms` values are **real** for
  this machine.
- Caveat: the CSV's `runtime_compiler` column shows the **hardcoded** strings
  baked into `measure.py` (OpenJDK 21.0.12 / CPython 3.13.16 / Node.js 22.22.0 /
  g++ 13.3.0), which do **not** match this machine's actual tools listed above.
  Only the version labels are stale; the timings are genuine.

## Item 5 — live app run (MySQL)
- MySQL installed on this machine for this run: Homebrew **mysql v26.7.0**
  (`brew services start mysql`), database **`legal`** created. Root uses
  `caching_sha2_password` with the password the app already expected
  (`Viku@2022`), because this MySQL has `mysql_native_password` disabled.
- **Result: the live login page was served and screenshotted.**
  `GET http://localhost:8080/login` -> **HTTP 200**, `text/html`, 4081 bytes.
  - `login_page.html` — the real served JSP output.
  - `app_screenshot.png` — 1280x1000 render of the login page (headless Chrome).
  - `app_startup.log` — the full, honest sequence of every boot attempt.
- Getting there required working through several real "old app" issues; all are
  in `app_startup.log`:
  1. **Port**: repo config is `server.port=8018`, not 8080. Overridden to 8080
     to match the checklist URL.
  2. **MySQL 8.4+/9+ auth**: `mysql_native_password` plugin not loaded; used the
     default `caching_sha2_password`. JDBC URL amended (runtime-only) with
     `allowPublicKeyRetrieval=true&serverTimezone=UTC` so connector 8.0.22 could
     authenticate over non-SSL. The DB connection then worked and Hibernate
     (`ddl-auto=update`, MySQL5Dialect) auto-created all tables.
  3. **Test-compile blocked `spring-boot:run`** (same JUnit-4 baseline issue as
     item 4) -> ran with `-Dmaven.test.skip=true`.
  4. **Spring DI failure caused by the Part-2 CH01 change (important):**
     `NoUniqueBeanDefinitionException` for `com.dcm.strategy.FinePolicy` — two
     beans (`advocateFine`, `regularFine`) but `FineService`'s constructor wants
     one. Unit tests construct `FineService` directly so they pass; the full
     Spring context does not. Standard fix: `@Primary`/`@Qualifier`. Applied
     `@Primary` to `RegularFine` **runtime-only (uncommitted)** to let the
     context boot for the screenshot.
  5. **Non-web start**: under `spring-boot:run` the WAR came up as a non-web app
     (servlet container not on the run classpath: `javax.servlet-api` and
     `tomcat-embed-jasper` were `provided`). Resolved by packaging the Spring
     Boot **executable WAR** and running `java -jar target/Legal.war
     --server.port=8080`, which bundles embedded Tomcat. (`pom.xml` provided
     scopes were also relaxed runtime-only during debugging.)

### Uncommitted, runtime-only changes in `.run/legalSystem` (NOT in after_commit)
Made only to run the live app for item 5; the committed Part-2 tree
(`after_commit.txt`) deliberately excludes them so the real CH01 DI finding is
preserved:
- `src/main/resources/application.properties` — JDBC URL params for modern MySQL.
- `src/main/java/com/dcm/strategy/RegularFine.java` — `@Primary`.
- `pom.xml` — `javax.servlet-api` & `tomcat-embed-jasper` provided -> compile.
- `logs/*.log` — written by the app at runtime.

Note: MySQL was left running as a Homebrew service. To stop it:
`brew services stop mysql`.
