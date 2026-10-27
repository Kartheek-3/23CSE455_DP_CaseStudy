package com.b9.wallet.domain;

import java.math.BigDecimal;
import java.util.Currency;

/** Immutable money value used by the baseline (single currency is enforced by Wallet). */
public record Money(BigDecimal amount, Currency currency) {
    public Money {
        if (amount == null || amount.signum() < 0 || currency == null) throw new IllegalArgumentException("invalid money");
    }
    public Money subtract(Money other) {
        if (!currency.equals(other.currency) || amount.compareTo(other.amount) < 0) throw new IllegalArgumentException("insufficient or incompatible funds");
        return new Money(amount.subtract(other.amount), currency);
    }
    public Money add(Money other) {
        if (!currency.equals(other.currency)) throw new IllegalArgumentException("currency mismatch");
        return new Money(amount.add(other.amount), currency);
    }
}
