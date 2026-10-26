// Template Method pattern - mirrors ReportTemplate.java. Representative of
// SecurityConfiguration configure(...) hooks (config/SecurityConfiguration.java:23).
#include <iostream>
#include <string>

class CaseReport {                             // AbstractClass
public:
    std::string generate(const std::string& caseNo) {  // template method (fixed)
        return header(caseNo) + "\n" + body(caseNo) + "\n" + footer();
    }
    virtual ~CaseReport() = default;
protected:
    virtual std::string header(const std::string& caseNo) = 0;
    virtual std::string body(const std::string& caseNo) = 0;
    virtual std::string footer() { return "-- end --"; }   // hook with default
};

class HearingReport : public CaseReport {      // ConcreteClass A
protected:
    std::string header(const std::string& c) override { return "HEARING REPORT " + c; }
    std::string body(const std::string& c) override { return "Next hearing scheduled for " + c; }
};

class PaymentReport : public CaseReport {      // ConcreteClass B
protected:
    std::string header(const std::string& c) override { return "PAYMENT REPORT " + c; }
    std::string body(const std::string& c) override { return "Outstanding dues for " + c; }
    std::string footer() override { return "-- accounts dept --"; }
};

int main() {
    HearingReport h;
    PaymentReport p;
    std::cout << h.generate("C-101") << "\n";
    std::cout << p.generate("C-205") << "\n";
    return 0;
}
