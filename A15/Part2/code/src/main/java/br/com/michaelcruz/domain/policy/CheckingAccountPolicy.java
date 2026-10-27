package br.com.michaelcruz.domain.policy;

public class CheckingAccountPolicy implements AccountPolicy {

    public static final double OVERDRAFT_LIMIT = 500.0;

    @Override
    public double bonusOnDeposit(double amount) {
        return 0.0;
    }

    @Override
    public boolean allowsWithdrawal(double balance, double amount) {
        return balance - amount >= -OVERDRAFT_LIMIT;
    }
}
