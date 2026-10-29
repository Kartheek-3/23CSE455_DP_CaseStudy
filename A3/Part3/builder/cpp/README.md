# Builder — cpp

Run from this directory:

```sh
g++ -std=c++17 -O2 test_sample.cpp -o test_sample && ./test_sample ../../test-cases/builder.tsv
```

Production: `sample.hpp`. Tests: `test_sample.cpp`. Common fixture: `../../test-cases/builder.tsv`.
The fixture contains 4 independent cases. Test doubles are in the test runner, outside measured production LOC.
