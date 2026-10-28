"""Tests for the Layered Architecture cross-language snippet (shared cases)."""

from layered_architecture import (
    ParkingController,
    ParkingService,
    ReservationRepository,
)

passed = 0
total = 0


def check(label, actual, expected):
    global passed, total
    total += 1
    assert actual == expected, label + ": expected " + str(expected) + " got " + str(actual)
    passed += 1


repository = ReservationRepository()
service = ParkingService(repository)
controller = ParkingController(service)

check("valid-response", controller.post_reservation(1, "ABC"), "OK:1:ABC")
check("count-1", repository.count(), 1)

check("invalid-response", controller.post_reservation(0, "ZZZ"), "ERR:invalid-slot")
check("count-still-1", repository.count(), 1)

check("second-response", controller.post_reservation(2, "XYZ"), "OK:2:XYZ")
check("count-2", repository.count(), 2)

check("find-by-plate", repository.find_by_plate("ABC").slot_id, 1)
check("negative-response", controller.post_reservation(-5, "QQ"), "ERR:invalid-slot")

print("LAYERED_ARCHITECTURE_PY PASS " + str(passed) + "/" + str(total))
