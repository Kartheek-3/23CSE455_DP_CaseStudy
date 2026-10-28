# Part 3 — Layered Architecture (cross-language)

Layered Architecture: the system is split into layers that depend only downward.

- Presentation layer: `ParkingController` (depends on the business layer) turns a
  reservation request into an `OK:slot:plate` / `ERR:invalid-slot` response.
- Business layer: `ParkingService` (depends on the data layer) validates and
  coordinates reservations.
- Data layer: `ReservationRepository` stores `Reservation` records.

Layered Architecture is a confirmed Part 1 (baseline) pattern. This snippet is a
representative small problem — a three-layer parking reservation slice.

Implementations (production snippet + tests in each directory):

| Language | Production | Test | Result | Median ms |
|---|---|---|---|---|
| JavaScript | `javascript/layered_architecture.js` | `javascript/test_layered_architecture.js` | 8/8 | 74.698 |
| Python | `python/layered_architecture.py` | `python/test_layered_architecture.py` | 8/8 | 89.697 |
| Java | `java/ReservationRepository.java` | `java/LayeredArchitectureTest.java` | 8/8 | 148.051 |
| C++ | `cpp/layered_architecture.hpp` | `cpp/layered_architecture_test.cpp` | 8/8 | 15.814 |

Shared test cases (identical inputs/expected results in every language):

1. `postReservation(1, "ABC")` → `OK:1:ABC`, repository count 1.
2. `postReservation(0, "ZZZ")` → `ERR:invalid-slot`, count still 1.
3. `postReservation(2, "XYZ")` → `OK:2:XYZ`, count 2.
4. `findByPlate("ABC")` returns the reservation with slot 1.
5. `postReservation(-5, "QQ")` → `ERR:invalid-slot`.

Run instructions, LOC/CC/timing rules and the exact commands are in each
language's README. Raw runs are in `../evidence/LayeredArchitecture_*.txt`.
