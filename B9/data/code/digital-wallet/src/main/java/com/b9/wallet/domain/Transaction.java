package com.b9.wallet.domain;

import java.util.UUID;

/** Builder prevents a partially specified transfer record. */
public final class Transaction {
    public final String id, senderWalletId, receiverWalletId; public final Money amount;
    private Transaction(Builder b) { id = UUID.randomUUID().toString(); senderWalletId = b.sender; receiverWalletId = b.receiver; amount = b.amount; }
    public static Builder builder() { return new Builder(); }
    public static final class Builder {
        private String sender, receiver; private Money amount;
        public Builder sender(String value) { sender = value; return this; }
        public Builder receiver(String value) { receiver = value; return this; }
        public Builder amount(Money value) { amount = value; return this; }
        public Transaction build() { if (sender == null || receiver == null || amount == null) throw new IllegalStateException("transaction fields required"); return new Transaction(this); }
    }
}
