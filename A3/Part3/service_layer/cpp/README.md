# Service Layer — cpp

Run from this directory:

```sh
g++ -std=c++17 -O2 test_sample.cpp -o test_sample && ./test_sample ../../test-cases/service_layer.tsv
```

Production: `sample.hpp`. Tests: `test_sample.cpp`. Common fixture: `../../test-cases/service_layer.tsv`.
The fixture contains 5 independent cases. Test doubles are in the test runner, outside measured production LOC.
