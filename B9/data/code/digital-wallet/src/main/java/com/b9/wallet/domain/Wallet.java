package com.b9.wallet.domain;

import java.util.UUID;

public final class Wallet {
    private final String id = UUID.randomUUID().toString();
    private Money balance;
    public Wallet(Money openingBalance) { this.balance = openingBalance; }
    public String id() { return id; }
    public Money balance() { return balance; }
    public void debit(Money amount) { balance = balance.subtract(amount); }
    public void credit(Money amount) { balance = balance.add(amount); }
}
