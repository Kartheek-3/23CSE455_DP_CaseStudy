"""Tests for the Observer cross-language snippet (shared cases)."""

from occupancy_observer import AvailabilityObserver, LoggingObserver, OccupancyMonitor

passed = 0
total = 0


def check(label, actual, expected):
    global passed, total
    total += 1
    assert actual == expected, label + ": expected " + str(expected) + " got " + str(actual)
    passed += 1


avail = AvailabilityObserver()
log = LoggingObserver()
monitor = OccupancyMonitor()
monitor.attach(avail)
monitor.attach(log)

check("notify-return", monitor.notify("occupy:1"), 2)
check("avail-1", avail.count(), 1)
check("log-1", len(log.events), 1)

monitor.notify("occupy:2")
check("avail-2", avail.count(), 2)

monitor.notify("free:1")
check("avail-free", avail.count(), 1)

monitor.detach(log)
monitor.notify("occupy:3")
check("avail-3", avail.count(), 2)
check("log-still-3", len(log.events), 3)
check("log-contents", ",".join(log.events), "occupy:1,occupy:2,free:1")

print("OBSERVER_PY PASS " + str(passed) + "/" + str(total))
