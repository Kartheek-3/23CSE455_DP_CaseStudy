"""Observer pattern - mirrors HearingObserver.java. Representative of the
scheduler->email reminder in LegalAppApplication.java:25 (recorded UNCERTAIN in
Part 1); implemented here in canonical subject-maintains-observers form."""
from abc import ABC, abstractmethod
from typing import List


class HearingObs(ABC):                          # Observer
    @abstractmethod
    def update(self, case_no: str, date: str) -> None: ...


class CaseRegister:                             # Subject / ConcreteSubject
    def __init__(self):
        self._observers: List[HearingObs] = []

    def subscribe(self, o: HearingObs) -> None:
        self._observers.append(o)

    def new_hearing(self, case_no: str, date: str) -> None:   # notify
        for o in self._observers:
            o.update(case_no, date)


class EmailReminder(HearingObs):                # ConcreteObserver A
    def update(self, case_no, date):
        print(f"email,{case_no},{date}")


class SmsReminder(HearingObs):                  # ConcreteObserver B
    def update(self, case_no, date):
        print(f"sms,{case_no},{date}")


def main():
    register = CaseRegister()
    register.subscribe(EmailReminder())
    register.subscribe(SmsReminder())
    register.new_hearing("C-101", "2026-10-15")
    register.new_hearing("C-205", "2026-10-18")


if __name__ == "__main__":
    main()
