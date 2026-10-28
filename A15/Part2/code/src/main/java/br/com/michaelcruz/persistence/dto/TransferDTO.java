package br.com.michaelcruz.persistence.dto;

import jakarta.validation.constraints.NotNull;

public class TransferDTO {

    @NotNull(message = "Precisa ser informada a conta de origem")
    private Long fromAccountId;

    @NotNull(message = "Precisa ser informada a conta de destino")
    private Long toAccountId;

    private double amount;

    public Long getFromAccountId() { return fromAccountId; }
    public void setFromAccountId(Long fromAccountId) { this.fromAccountId = fromAccountId; }
    public Long getToAccountId() { return toAccountId; }
    public void setToAccountId(Long toAccountId) { this.toAccountId = toAccountId; }
    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }
}
