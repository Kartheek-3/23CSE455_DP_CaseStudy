package br.com.michaelcruz.domain.policy;

public class SavingsAccountPolicy implements AccountPolicy {

    public static final double DEPOSIT_BONUS = 0.5;

    @Override
    public double bonusOnDeposit(double amount) {
        return DEPOSIT_BONUS;
    }

    @Override
    public boolean allowsWithdrawal(double balance, double amount) {
        return amount <= balance;
    }
}
