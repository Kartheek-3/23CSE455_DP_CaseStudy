"""Runs fixtures O1-O6 from Part3/test-cases/observer_spec.md."""
import sys

from ride_notification import Event, NotificationHub, RecordingObserver


def o1():
    hub, d1, d2 = NotificationHub(), RecordingObserver(), RecordingObserver()
    hub.subscribe("d1", d1)
    hub.subscribe("d2", d2)
    n = hub.broadcast(["d1", "d2", "d3"], Event("booking:new", "B1"))
    return n == 2 and len(d1.received) == 1 and len(d2.received) == 1


def o2():
    hub, d1 = NotificationHub(), RecordingObserver()
    hub.subscribe("d1", d1)
    hub.subscribe("d2", RecordingObserver())
    hub.unsubscribe("d1")
    n = hub.broadcast(["d1", "d2"], Event("booking:new", "B2"))
    return n == 1 and not d1.received


def o3():
    return NotificationHub().notify("r1", Event("booking:confirmation", "B3")) is False


def o4():
    hub, a, b = NotificationHub(), RecordingObserver(), RecordingObserver()
    hub.subscribe("d1", a)
    hub.subscribe("d1", b)
    ok = hub.notify("d1", Event("cancel:booking", "B4"))
    return ok and not a.received and len(b.received) == 1


def o5():
    hub, d2 = NotificationHub(), RecordingObserver()
    hub.subscribe("d2", d2)
    hub.notify("d2", Event("booking:new", "B5"))
    hub.notify("d2", Event("cancel:booking", "B5"))
    return [e.type for e in d2.received] == ["booking:new", "cancel:booking"]


def o6():
    hub = NotificationHub()
    hub.subscribe("r1", RecordingObserver())
    ok = hub.notify("r1", Event("booking:confirmation", "B6"))
    return ok and hub.broadcast([], Event("booking:new", "B7")) == 0


def main() -> int:
    cases = [("O1", o1), ("O2", o2), ("O3", o3), ("O4", o4), ("O5", o5), ("O6", o6)]
    passed = 0
    for case_id, body in cases:
        if body():
            passed += 1
            print(f"PASS {case_id}")
        else:
            print(f"FAIL {case_id}")
    print(f"RESULT {passed}/{len(cases)} passed")
    return 0 if passed == len(cases) else 1


if __name__ == "__main__":
    sys.exit(main())
