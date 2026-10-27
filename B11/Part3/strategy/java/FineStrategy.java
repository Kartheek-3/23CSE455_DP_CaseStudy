// Strategy pattern - representative of the PasswordEncoder strategy in
// SecurityConfiguration.java:57 (legalSystem). Reframed to the case-management
// domain as a late-fee policy so the collaboration is meaningful in isolation.
// Behaviour is identical across Java/Python/JavaScript/C++.
import java.util.Locale;

interface FinePolicy {                       // Strategy
    double fine(int daysLate);
}

class RegularFine implements FinePolicy {    // ConcreteStrategy A
    public double fine(int daysLate) {
        if (daysLate <= 0) return 0.0;
        return daysLate * 5.0;
    }
}

class AdvocateFine implements FinePolicy {   // ConcreteStrategy B
    public double fine(int daysLate) {
        if (daysLate <= 0) return 0.0;
        if (daysLate <= 7) return daysLate * 2.0;
        return 14.0 + (daysLate - 7) * 3.0;
    }
}

class FineContext {                          // Context
    private FinePolicy policy;
    FineContext(FinePolicy policy) { this.policy = policy; }
    void setPolicy(FinePolicy policy) { this.policy = policy; }
    double compute(int daysLate) { return policy.fine(daysLate); }
}

public class FineStrategy {
    public static void main(String[] args) {
        int[] cases = {0, 3, 7, 10};
        FineContext ctx = new FineContext(new RegularFine());
        StringBuilder out = new StringBuilder();
        for (int d : cases)
            out.append(String.format(Locale.US, "regular,%d,%.2f%n", d, ctx.compute(d)));
        ctx.setPolicy(new AdvocateFine());
        for (int d : cases)
            out.append(String.format(Locale.US, "advocate,%d,%.2f%n", d, ctx.compute(d)));
        System.out.print(out);
    }
}
