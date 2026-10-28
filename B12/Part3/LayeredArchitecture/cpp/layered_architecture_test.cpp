// Tests for the Layered Architecture cross-language snippet (shared cases).

#include "layered_architecture.hpp"

#include <cstdlib>
#include <iostream>
#include <string>

static int passed = 0;
static int total = 0;

static void check(const char* label, const std::string& actual,
                  const std::string& expected) {
    total += 1;
    if (actual != expected) {
        std::cerr << label << ": expected " << expected
                  << " got " << actual << "\n";
        std::exit(1);
    }
    passed += 1;
}

static void check(const char* label, long long actual, long long expected) {
    total += 1;
    if (actual != expected) {
        std::cerr << label << ": expected " << expected
                  << " got " << actual << "\n";
        std::exit(1);
    }
    passed += 1;
}

int main() {
    ReservationRepository repository;
    ParkingService service(&repository);
    ParkingController controller(&service);

    check("valid-response", controller.postReservation(1, "ABC"),
          std::string("OK:1:ABC"));
    check("count-1", repository.count(), 1);

    check("invalid-response", controller.postReservation(0, "ZZZ"),
          std::string("ERR:invalid-slot"));
    check("count-still-1", repository.count(), 1);

    check("second-response", controller.postReservation(2, "XYZ"),
          std::string("OK:2:XYZ"));
    check("count-2", repository.count(), 2);

    check("find-by-plate", repository.findByPlate("ABC")->slotId, 1);
    check("negative-response", controller.postReservation(-5, "QQ"),
          std::string("ERR:invalid-slot"));

    std::cout << "LAYERED_ARCHITECTURE_CPP PASS " << passed << "/" << total
              << "\n";
    return 0;
}
