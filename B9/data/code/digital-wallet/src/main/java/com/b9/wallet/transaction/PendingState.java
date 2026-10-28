package com.b9.wallet.transaction;
public final class PendingState implements TransactionState { public String name() { return "PENDING"; } public TransactionState next() { return new CompletedState(); } }
