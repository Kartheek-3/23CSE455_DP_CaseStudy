package br.com.michaelcruz.persistence.model;

import br.com.michaelcruz.domain.policy.AccountPolicy;
import br.com.michaelcruz.exception.BadRequestException;
import jakarta.persistence.*;

@Entity
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Enumerated(EnumType.STRING)
    AccountType type;

    double balance;

    @OneToOne
    @JoinColumn(name = "user_id")
    User user;

    public AccountType getType() {
        return type;
    }

    public void setType(AccountType type) {
        this.type = type;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        this.balance = balance;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    /** Applies a deposit; the policy decides the bonus for this account type. */
    public void deposit(double amount, AccountPolicy policy) {
        if (amount <= 0) {
            throw new BadRequestException("Valor do depósito precisa ser maior que zero");
        }
        this.balance += amount + policy.bonusOnDeposit(amount);
    }

    /** Applies a withdrawal if the policy allows it for the current balance. */
    public void withdraw(double amount, AccountPolicy policy) {
        if (amount <= 0 || !policy.allowsWithdrawal(this.balance, amount)) {
            throw new BadRequestException("Valor do saque indisponível na conta");
        }
        this.balance -= amount;
    }

    /** Receives transferred money (no deposit bonus). */
    public void credit(double amount) {
        if (amount <= 0) {
            throw new BadRequestException("Valor da transferência precisa ser maior que zero");
        }
        this.balance += amount;
    }
}
