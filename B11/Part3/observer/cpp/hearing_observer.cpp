// Observer pattern - mirrors HearingObserver.java. Representative of the
// scheduler->email reminder in LegalAppApplication.java:25 (recorded UNCERTAIN in
// Part 1); implemented here in canonical subject-maintains-observers form.
#include <iostream>
#include <string>
#include <vector>

struct HearingObs {                             // Observer
    virtual void update(const std::string& caseNo, const std::string& date) = 0;
    virtual ~HearingObs() = default;
};

class CaseRegister {                            // Subject / ConcreteSubject
    std::vector<HearingObs*> observers;
public:
    void subscribe(HearingObs* o) { observers.push_back(o); }
    void newHearing(const std::string& caseNo, const std::string& date) {   // notify
        for (auto* o : observers) o->update(caseNo, date);
    }
};

struct EmailReminder : HearingObs {             // ConcreteObserver A
    void update(const std::string& caseNo, const std::string& date) override {
        std::cout << "email," << caseNo << "," << date << "\n";
    }
};

struct SmsReminder : HearingObs {               // ConcreteObserver B
    void update(const std::string& caseNo, const std::string& date) override {
        std::cout << "sms," << caseNo << "," << date << "\n";
    }
};

int main() {
    CaseRegister register_;
    EmailReminder email;
    SmsReminder sms;
    register_.subscribe(&email);
    register_.subscribe(&sms);
    register_.newHearing("C-101", "2026-10-15");
    register_.newHearing("C-205", "2026-10-18");
    return 0;
}
