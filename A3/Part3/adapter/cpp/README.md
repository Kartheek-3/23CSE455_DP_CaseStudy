# Adapter — cpp

Run from this directory:

```sh
g++ -std=c++17 -O2 test_sample.cpp -o test_sample && ./test_sample ../../test-cases/adapter.tsv
```

Production: `sample.hpp`. Tests: `test_sample.cpp`. Common fixture: `../../test-cases/adapter.tsv`.
The fixture contains 3 independent cases. Test doubles are in the test runner, outside measured production LOC.
