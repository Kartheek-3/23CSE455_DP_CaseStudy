# Chain Of Responsibility — cpp

Run from this directory:

```sh
g++ -std=c++17 -O2 test_sample.cpp -o test_sample && ./test_sample ../../test-cases/chain_of_responsibility.tsv
```

Production: `sample.hpp`. Tests: `test_sample.cpp`. Common fixture: `../../test-cases/chain_of_responsibility.tsv`.
The fixture contains 7 independent cases. Test doubles are in the test runner, outside measured production LOC.
