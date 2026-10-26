# Baseline Test Results

## 1. Environment

Tests were run against the original, unmodified application in `data/code/`.

- **Operating system:** macOS 26.5
- **Node.js:** v24.15.0
- **npm:** 11.12.1
- **Jest:** 30.1.3 (project-local)
- **Baseline commit:** `ae2c24869377ce2f7a29022cd237d808338156ea`
- **Working directory:** `data/code/`
- **Environment details:** [`environment.txt`](environment.txt)

## 2. Commands and Results

| Command | Recorded output | Exit code | Result |
|---|---|---:|---|
| `npm ci` | [`install_output.txt`](install_output.txt) | 0 | Dependencies installed successfully. npm reported dependency warnings and 147 vulnerabilities. |
| `npm run build` | [`build_output.txt`](build_output.txt) | 0 | Build succeeded. |
| `npm test` | [`unit_test_output.txt`](unit_test_output.txt) | 0 | 10 test suites passed; 10 tests passed. |
| `npm run test:e2e` | [`e2e_test_output.txt`](e2e_test_output.txt) | 1 | E2E suite failed during module resolution; no tests ran. |

The `npm ci` exit code is confirmed by the recorded terminal output. The other exit codes and results are documented in their respective command output files.

## 3. E2E Test Failure

The recorded error was:

```text
Cannot find module 'src/flight/entities/flight.entity'
from '../src/users/entities/user.entity.ts'
```

The captured output reports one failed test suite and zero tests executed. The failure occurred while Jest was loading the application, before the E2E tests ran.

Inspection of `data/code/test/jest-e2e.json` showed no `moduleNameMapper` entry for resolving `src/` import paths. This is consistent with the module-resolution failure shown in the captured output.

The E2E configuration and application source were not modified to work around this failure. The failure is recorded as observed in the baseline run.

## 4. Screenshots

Screenshots of the terminal results are stored in [`screenshots/`](screenshots/).

- [`build_result.png`](screenshots/build_result.png) — successful build with exit code 0.
- [`unit_tests_pass.png`](screenshots/unit_tests_pass.png) — unit-test summary showing 10 suites and 10 tests passed.
- [`e2e_fail.png`](screenshots/e2e_fail.png) — E2E module-resolution failure with exit code 1.

## 5. Raw Evidence

The accompanying text files contain the captured command outputs:

- `install_output.txt`
- `build_output.txt`
- `unit_test_output.txt`
- `e2e_test_output.txt`

Environment information is recorded in `environment.txt`.

The baseline source remains checked out at commit `ae2c24869377ce2f7a29022cd237d808338156ea`. Test evidence is stored separately from the application source.
