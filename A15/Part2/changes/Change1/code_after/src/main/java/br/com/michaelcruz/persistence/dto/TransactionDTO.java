package br.com.michaelcruz.persistence.dto;

import jakarta.validation.constraints.NotNull;

public class TransactionDTO {

    @NotNull(message = "Precisa ser informado um valor")
    private double amount;
    public double getAmount() {
        return amount;
    }
    public void setAmount(double amount) {
        this.amount = amount;
    }
}