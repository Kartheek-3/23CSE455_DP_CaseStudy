# State - Trip Lifecycle and Cancellation (C++)

Production code: `trip_lifecycle.hpp`. Test runner: `test_trip_lifecycle.cpp` (fixtures from `Part3/test-cases/state_spec.md`).

## Run (working folder: `Part3/state_trip_lifecycle/cpp`)
```bash
g++ -std=c++20 -O2 -Wall -Wextra test_trip_lifecycle.cpp -o test_bin
./test_bin
# or, without a local compiler:
docker run --rm -v "$PWD:/src" -w /src gcc:13 bash -c "g++ -std=c++20 -O2 test_trip_lifecycle.cpp -o /tmp/t && /tmp/t"
```
Expected last line: `RESULT 8/8 passed`.

## Recorded result
- Runtime/compiler: g++ (GCC) 13.5.0 -std=c++20 -O2 (Docker gcc:13)
- Test result: 8/8 passed
- Source LOC (lizard NLOC, production file only): 57; max function CC: 6
- Median process time (1 warm-up + 5 runs): 1.9 ms - raw runs in `Part3/evidence/cross_language_runs.txt`
