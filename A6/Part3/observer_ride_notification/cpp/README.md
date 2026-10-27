# Observer - Ride Event Notification (C++)

Production code: `ride_notification.hpp`. Test runner: `test_ride_notification.cpp` (fixtures from `Part3/test-cases/observer_spec.md`).

## Run (working folder: `Part3/observer_ride_notification/cpp`)
```bash
g++ -std=c++20 -O2 -Wall -Wextra test_ride_notification.cpp -o test_bin
./test_bin
# or, without a local compiler:
docker run --rm -v "$PWD:/src" -w /src gcc:13 bash -c "g++ -std=c++20 -O2 test_ride_notification.cpp -o /tmp/t && /tmp/t"
```
Expected last line: `RESULT 6/6 passed`.

## Recorded result
- Runtime/compiler: g++ (GCC) 13.5.0 -std=c++20 -O2 (Docker gcc:13)
- Test result: 6/6 passed
- Source LOC (lizard NLOC, production file only): 40; max function CC: 3
- Median process time (1 warm-up + 5 runs): 2.3 ms - raw runs in `Part3/evidence/cross_language_runs.txt`
