// Observer pattern - representative of the hearing/reminder notification in
// legalSystem (LegalAppApplication.java:25 @EnableScheduling -> EmailServiceImpl).
// The repo's original is scheduler-driven (recorded as an UNCERTAIN Observer in
// Part 1); here we implement the canonical subject-maintains-observers form so
// the cross-language snippet is a true Observer. Behaviour identical across langs.
import java.util.ArrayList;
import java.util.List;

interface HearingObs {                         // Observer
    void update(String caseNo, String date);
}

class CaseRegister {                           // Subject / ConcreteSubject
    private final List<HearingObs> observers = new ArrayList<>();
    void subscribe(HearingObs o) { observers.add(o); }
    void newHearing(String caseNo, String date) {   // state change -> notify
        for (HearingObs o : observers) o.update(caseNo, date);
    }
}

class EmailReminder implements HearingObs {    // ConcreteObserver A
    public void update(String caseNo, String date) {
        System.out.println("email," + caseNo + "," + date);
    }
}

class SmsReminder implements HearingObs {      // ConcreteObserver B
    public void update(String caseNo, String date) {
        System.out.println("sms," + caseNo + "," + date);
    }
}

public class HearingObserver {
    public static void main(String[] args) {
        CaseRegister register = new CaseRegister();
        register.subscribe(new EmailReminder());
        register.subscribe(new SmsReminder());
        register.newHearing("C-101", "2026-10-15");
        register.newHearing("C-205", "2026-10-18");
    }
}
