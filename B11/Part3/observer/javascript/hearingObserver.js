// Observer pattern - mirrors HearingObserver.java. Representative of the
// scheduler->email reminder in LegalAppApplication.java:25 (recorded UNCERTAIN in
// Part 1); implemented here in canonical subject-maintains-observers form.

class CaseRegister {                            // Subject / ConcreteSubject
  constructor() { this.observers = []; }
  subscribe(o) { this.observers.push(o); }
  newHearing(caseNo, date) {                    // notify
    for (const o of this.observers) o.update(caseNo, date);
  }
}

class EmailReminder {                           // ConcreteObserver A
  update(caseNo, date) { console.log(`email,${caseNo},${date}`); }
}

class SmsReminder {                             // ConcreteObserver B
  update(caseNo, date) { console.log(`sms,${caseNo},${date}`); }
}

function main() {
  const register = new CaseRegister();
  register.subscribe(new EmailReminder());
  register.subscribe(new SmsReminder());
  register.newHearing("C-101", "2026-10-15");
  register.newHearing("C-205", "2026-10-18");
}

main();
