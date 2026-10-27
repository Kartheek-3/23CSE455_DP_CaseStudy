# Adapter — java

Run from this directory:

```sh
javac Sample.java TestSample.java && java TestSample ../../test-cases/adapter.tsv
```

Production: `Sample.java`. Tests: `TestSample.java`. Common fixture: `../../test-cases/adapter.tsv`.
The fixture contains 3 independent cases. Test doubles are in the test runner, outside measured production LOC.
