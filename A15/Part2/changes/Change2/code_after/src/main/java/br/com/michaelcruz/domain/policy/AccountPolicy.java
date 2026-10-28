package br.com.michaelcruz.domain.policy;

/** Account-type specific rules (Strategy). */
public interface AccountPolicy {

    /** Extra amount credited on top of a deposit of the given size. */
    double bonusOnDeposit(double amount);

    /** Whether withdrawing {@code amount} from an account holding {@code balance} is allowed. */
    boolean allowsWithdrawal(double balance, double amount);
}
