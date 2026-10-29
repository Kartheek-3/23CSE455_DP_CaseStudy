# Strategy - Ride Fare Pricing (C++)

Production code: `ride_fare.hpp`. Test runner: `test_ride_fare.cpp` (fixtures from `Part3/test-cases/strategy_spec.md`).

## Run (working folder: `Part3/strategy_ride_fare/cpp`)
```bash
g++ -std=c++20 -O2 -Wall -Wextra test_ride_fare.cpp -o test_bin
./test_bin
# or, without a local compiler:
docker run --rm -v "$PWD:/src" -w /src gcc:13 bash -c "g++ -std=c++20 -O2 test_ride_fare.cpp -o /tmp/t && /tmp/t"
```
Expected last line: `RESULT 8/8 passed`.

## Recorded result
- Runtime/compiler: g++ (GCC) 13.5.0 -std=c++20 -O2 (Docker gcc:13)
- Test result: 8/8 passed
- Source LOC (lizard NLOC, production file only): 69; max function CC: 3
- Median process time (1 warm-up + 5 runs): 2.1 ms - raw runs in `Part3/evidence/cross_language_runs.txt`
