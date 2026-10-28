# Builder — java

Run from this directory:

```sh
javac Sample.java TestSample.java && java TestSample ../../test-cases/builder.tsv
```

Production: `Sample.java`. Tests: `TestSample.java`. Common fixture: `../../test-cases/builder.tsv`.
The fixture contains 4 independent cases. Test doubles are in the test runner, outside measured production LOC.
