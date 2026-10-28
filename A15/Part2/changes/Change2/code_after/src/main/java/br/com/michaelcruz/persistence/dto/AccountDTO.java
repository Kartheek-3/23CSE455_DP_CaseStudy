package br.com.michaelcruz.persistence.dto;

import br.com.michaelcruz.persistence.model.AccountType;
import jakarta.validation.constraints.NotNull;

public class AccountDTO {

    Long accountId;

    @NotNull(message = "Precisa ser informado o tipo de conta")
    AccountType type;

    @NotNull(message = "Precisa ser informado um saldo")
    double balance;

    @NotNull(message = "Precisa informar um ID de usuário da conta")
    Long userId;

    public Long getAccountId() {
        return accountId;
    }

    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }

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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
