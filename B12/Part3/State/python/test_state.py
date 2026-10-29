"""Tests for the State cross-language snippet (Python)."""

from ev_charging_state import ChargingSession

_passed = 0
_total = 0


def check(label, actual, expected):
    global _passed, _total
    _total += 1
    assert actual == expected, f"{label}: expected {expected} got {actual}"
    _passed += 1


def main():
    session = ChargingSession()
    check("initial", session.state(), "idle")
    check("startCharge-invalid", session.start_charge(), "error")
    check("state-unchanged", session.state(), "idle")
    check("errors", ",".join(session.errors), "startCharge@idle")
    check("plugIn", session.plug_in(), "plugged_in")
    check("state-plugged", session.state(), "plugged_in")
    check("removeCable-back", session.remove_cable(), "idle")

    session.plug_in()
    check("startCharge", session.start_charge(), "charging")
    check("state-charging", session.state(), "charging")
    check("removeCable-invalid", session.remove_cable(), "error")
    check("finishCharge", session.finish_charge(), "completed")
    check("state-completed", session.state(), "completed")
    check("removeCable-done", session.remove_cable(), "idle")

    print(f"STATE_PY PASS {_passed}/{_total}")


if __name__ == "__main__":
    main()
