"""Template Method pattern - mirrors ReportTemplate.java. Representative of
SecurityConfiguration configure(...) hooks (config/SecurityConfiguration.java:23)."""
from abc import ABC, abstractmethod


class CaseReport(ABC):                         # AbstractClass
    def generate(self, case_no: str) -> str:   # template method (fixed)
        return f"{self.header(case_no)}\n{self.body(case_no)}\n{self.footer()}"

    @abstractmethod
    def header(self, case_no: str) -> str: ...
    @abstractmethod
    def body(self, case_no: str) -> str: ...

    def footer(self) -> str:                    # hook with default
        return "-- end --"


class HearingReport(CaseReport):               # ConcreteClass A
    def header(self, case_no): return f"HEARING REPORT {case_no}"
    def body(self, case_no): return f"Next hearing scheduled for {case_no}"


class PaymentReport(CaseReport):               # ConcreteClass B
    def header(self, case_no): return f"PAYMENT REPORT {case_no}"
    def body(self, case_no): return f"Outstanding dues for {case_no}"
    def footer(self): return "-- accounts dept --"


def main():
    print(HearingReport().generate("C-101"))
    print(PaymentReport().generate("C-205"))


if __name__ == "__main__":
    main()
