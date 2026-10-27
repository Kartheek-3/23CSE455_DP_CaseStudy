# data/test_result

- `harness/` - sandbox substitute for `mvn test` (stubs of the Jakarta APIs, a JUnit-5 subset shim, `MiniRunner`, `run_tests.sh`). It compiles the application's REAL `src/main/java` and its tests.
  Usage: `bash harness/run_tests.sh <app-dir> <out-dir> <fully.qualified.TestClass>...`
- `baseline_tests/src_test/` - characterization tests (15) added on top of the unchanged baseline production code; `baseline_tests_run.log` is the actual run (15/15).
- `tools/` - the Python scripts used to locate participants (javaloc.py), generate CSVs / diagrams / documents and measure the snippets. Paths inside them are those of the working container.
- Screenshots of the team's GitHub repository (required by the report template) must be added here by the team after the upload.
