// Template Method pattern - mirrors ReportTemplate.java. Representative of
// SecurityConfiguration configure(...) hooks (config/SecurityConfiguration.java:23).

class CaseReport {                             // AbstractClass
  generate(caseNo) {                           // template method (fixed)
    return `${this.header(caseNo)}\n${this.body(caseNo)}\n${this.footer()}`;
  }
  header(caseNo) { throw new Error("abstract"); }
  body(caseNo) { throw new Error("abstract"); }
  footer() { return "-- end --"; }             // hook with default
}

class HearingReport extends CaseReport {       // ConcreteClass A
  header(caseNo) { return `HEARING REPORT ${caseNo}`; }
  body(caseNo) { return `Next hearing scheduled for ${caseNo}`; }
}

class PaymentReport extends CaseReport {       // ConcreteClass B
  header(caseNo) { return `PAYMENT REPORT ${caseNo}`; }
  body(caseNo) { return `Outstanding dues for ${caseNo}`; }
  footer() { return "-- accounts dept --"; }
}

function main() {
  console.log(new HearingReport().generate("C-101"));
  console.log(new PaymentReport().generate("C-205"));
}

main();
