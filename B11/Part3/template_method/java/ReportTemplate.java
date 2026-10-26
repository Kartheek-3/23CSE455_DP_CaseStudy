// Template Method pattern - representative of SecurityConfiguration extending
// WebSecurityConfigurerAdapter and overriding configure(...) hooks
// (legalSystem config/SecurityConfiguration.java:23,29,35). Reframed as a case
// report generator: the base class fixes the algorithm, subclasses fill steps.
abstract class CaseReport {                   // AbstractClass
    // Template method - fixed skeleton, not overridden
    public final String generate(String caseNo) {
        StringBuilder sb = new StringBuilder();
        sb.append(header(caseNo)).append("\n");
        sb.append(body(caseNo)).append("\n");
        sb.append(footer());
        return sb.toString();
    }
    protected abstract String header(String caseNo);  // primitive op
    protected abstract String body(String caseNo);    // primitive op
    protected String footer() { return "-- end --"; } // hook with default
}

class HearingReport extends CaseReport {      // ConcreteClass A
    protected String header(String caseNo) { return "HEARING REPORT " + caseNo; }
    protected String body(String caseNo) { return "Next hearing scheduled for " + caseNo; }
}

class PaymentReport extends CaseReport {      // ConcreteClass B
    protected String header(String caseNo) { return "PAYMENT REPORT " + caseNo; }
    protected String body(String caseNo) { return "Outstanding dues for " + caseNo; }
    protected String footer() { return "-- accounts dept --"; }  // overrides hook
}

public class ReportTemplate {
    public static void main(String[] args) {
        System.out.println(new HearingReport().generate("C-101"));
        System.out.println(new PaymentReport().generate("C-205"));
    }
}
