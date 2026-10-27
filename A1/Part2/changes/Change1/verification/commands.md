# Executed command record and reproduction

Commands below were run in this session. Paths are relative to `/workspace/scratch/ac905c27eac1`, except where the working directory is explicitly stated. Outputs and numeric exit codes are paired in `evidence/*.log` and `evidence/*.exit`. Baseline and earlier audit evidence were not overwritten.

## Installation attempts (working directory: workspace root)

1. `python -m venv ch01/venv`
2. `ch01/venv/bin/python -m pip install -r ch01/baseline/requirements.txt` — exit 1; `install.log` (PhonePe absent from default index).
3. `ch01/venv/bin/python -m pip install --no-deps --index-url https://phonepe.mycloudrepo.io/public/repositories/phonepe-pg-sdk-python phonepe-sdk==1.1.0` — session interrupted; only partial `install-phonepe.log`, no completed result claimed.
4. `timeout 55 ch01/venv/bin/python -m pip install --timeout 15 --retries 0 --no-deps --index-url https://phonepe.mycloudrepo.io/public/repositories/phonepe-pg-sdk-python phonepe-sdk==1.1.0` — exit 0; `install-phonepe-retry.log`.
5. `ch01/venv/bin/python -m pip install --timeout 20 --retries 1 -r ch01/baseline/requirements.txt` — exit 1; `install-full-retry.log` (`pg_config` missing).
6. `ch01/venv/bin/python -m pip install --timeout 20 --retries 1 -r ch01/verification/requirements-sqlite.txt` — exit 1; `install-sqlite.log` (baseline dependency resolution conflict).
7. `ch01/venv/bin/python -m pip install --no-deps --timeout 20 --retries 1 -r ch01/verification/requirements-sqlite.txt` — exit 0; `install-pinned-no-deps.log`.
8. `ch01/venv/bin/python -m pip install --no-deps -r ch01/verification/requirements-runtime-extras.txt` — exit 0; `install-runtime-extras.log`. That intermediate one-package file is now retained as `evidence/attempted-runtime-extra-pins.txt`; its cryptography version was superseded below.
9. `ch01/venv/bin/python -m pip install --timeout 20 --retries 1 -c ch01/baseline/requirements.txt 'cryptography==50.0.1' cbor2 py-ubjson ujson pycryptodome httpx` — exit 0 with conflicts; `install-transitive.log`. Two initially resolved extra versions were corrected below to respect their consumers' constraints; baseline pins remained unchanged.
10. `ch01/venv/bin/python -m pip install --no-deps 'setuptools==80.9.0' 'pycryptodome==3.18.0'` — exit 0; `install-legacy-support.log`.
11. `ch01/venv/bin/python -m pip install --no-deps 'cryptography>=46.0.0,<48'` — exit 0; resolved cryptography 47.0.0; `install-compatible-crypto.log`.

The SDK's published installation source was verified at https://pypi.org/project/phonepe-pg-sdk-python/2.1.8/ (installation instructions refer to the vendor index). The installed package itself is the requested `phonepe-sdk==1.1.0`; no newer SDK was substituted.

## Final validation (working directory: `ch01/working`)

```bash
../venv/bin/python manage.py check
../venv/bin/python manage.py test canteenapp.test_delivery_assignment --verbosity 2 --noinput
../venv/bin/python manage.py makemigrations --check --dry-run
```

Results respectively: `check-default-final.log` (exit 0, warning); `tests-default-final.log` (exit 0, 39 tests pass); `migrations-check.log` (exit 0, no changes detected).

Working directory: workspace root:

```bash
node ch01/verification/test_assignment_ui.cjs
ch01/venv/bin/python -m pip check
ch01/venv/bin/python -m pip freeze
git apply --check --directory=ch01/baseline ch01/CH01.diff
```

Results respectively: `ui-tests.log` (exit 0, 9 tests pass); `pip-check-final.log` (exit 1, six baseline conflicts); `environment-freeze.txt`; `diff-check.log` (no output, exit 0).

Python archive/file hashing also checked all 170 baseline files and all four unchanged demonstrations; outputs are in `preservation-check.log`, with source hashes in the adjacent JSON files.

## Earlier checks and test attempts

Normal `manage.py check` and the same labeled test command initially failed because dependencies were absent or incompatible. Those traces are retained in `initial-check.log`, `check-pinned.log`, `check-final.log`, and `tests-attempt1.log`.

Interim command (working directory `ch01/working`):

```bash
PYTHONPATH=../verification ../venv/bin/python manage.py test canteenapp.test_delivery_assignment --settings=ch01_test_settings --verbosity 2 --noinput
```

`tests-scoped-attempt1.log` records a missing harness file due to a working-directory mistake; `tests-scoped-attempt2.log` records missing legacy `pkg_resources`; attempts 3 and 4 record 37 tests with one incorrect logger assertion; `tests-scoped-final.log` records 39 tests with one CSRF-cookie failure before the production-page fix. Despite its intermediate filename, **that scoped log is not the accepted final result**. `tests-default-final.log` is authoritative.

`PYTHONPATH=../verification ../venv/bin/python manage.py check --settings=ch01_test_settings` completed with the documented deprecation/Firebase warnings (`check-scoped.log`). The final successful run no longer needs this scoped harness.

## Reproduce the final validation environment

These are reproduction instructions, not a claim that a fresh replay was executed. Use Python 3.12 in a new virtual environment. Extract the preserved archive to a separate baseline directory; do not overlay it onto `working/`.

From the extracted `CH01` directory:

```bash
python -m venv venv
venv/bin/python -m pip install --no-deps --index-url https://phonepe.mycloudrepo.io/public/repositories/phonepe-pg-sdk-python phonepe-sdk==1.1.0
venv/bin/python -m pip install --no-deps -r verification/requirements-sqlite.txt
venv/bin/python -m pip install --no-deps -r verification/requirements-validation-extras.txt
cd working
../venv/bin/python manage.py check
../venv/bin/python manage.py test canteenapp.test_delivery_assignment --verbosity 2 --noinput
../venv/bin/python manage.py makemigrations --check --dry-run
node ../verification/test_assignment_ui.cjs
```

This intentionally recreates the feature-validation environment, including its unresolved baseline conflicts. It is not a deployment recommendation or a replacement for repairing the project's lock/dependency configuration. No real payment or notification credentials are provided by this deliverable.
