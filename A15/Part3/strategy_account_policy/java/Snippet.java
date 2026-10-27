import java.util.Map;

class NoPolicy extends RuntimeException { }

interface AccountPolicy {                        // Strategy
    double bonusOnDeposit(double amount);
    boolean allowsWithdrawal(double balance, double amount);
}

class SavingsPolicy implements AccountPolicy {   // ConcreteStrategy
    public double bonusOnDeposit(double amount) { return 0.5; }
    public boolean allowsWithdrawal(double balance, double amount) { return amount <= balance; }
}

class CheckingPolicy implements AccountPolicy {  // ConcreteStrategy
    static final double OVERDRAFT_LIMIT = 500.0;
    public double bonusOnDeposit(double amount) { return 0.0; }
    public boolean allowsWithdrawal(double balance, double amount) { return balance - amount >= -OVERDRAFT_LIMIT; }
}

class PolicyResolver {                           // StrategySelector
    private final Map<String, AccountPolicy> policies = Map.of("S", new SavingsPolicy(), "C", new CheckingPolicy());
    AccountPolicy forType(String kind) {
        AccountPolicy p = policies.get(kind);
        if (p == null) throw new NoPolicy();
        return p;
    }
}

class Account {                                  // Context: delegates the type-specific rules to the strategy
    double balance;
    private final AccountPolicy policy;
    Account(double balance, AccountPolicy policy) { this.balance = balance; this.policy = policy; }
    void deposit(double amount) { balance += amount + policy.bonusOnDeposit(amount); }
    boolean withdraw(double amount) {
        if (amount <= 0 || !policy.allowsWithdrawal(balance, amount)) return false;
        balance -= amount;
        return true;
    }
}
