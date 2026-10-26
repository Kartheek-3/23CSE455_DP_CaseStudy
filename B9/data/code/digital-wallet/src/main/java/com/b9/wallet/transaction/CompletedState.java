package com.b9.wallet.transaction;
public final class CompletedState implements TransactionState { public String name() { return "COMPLETED"; } public TransactionState next() { throw new IllegalStateException("terminal state"); } }
