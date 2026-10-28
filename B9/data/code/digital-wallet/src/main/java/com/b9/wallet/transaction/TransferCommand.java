package com.b9.wallet.transaction;

import com.b9.wallet.domain.*;
/** Command captures a transfer so the processor can invoke a uniform execute operation. */
public final class TransferCommand {
    private final Wallet sender, receiver; private final Money amount;
    public TransferCommand(Wallet sender, Wallet receiver, Money amount) { this.sender = sender; this.receiver = receiver; this.amount = amount; }
    public Transaction execute() { sender.debit(amount); receiver.credit(amount); return Transaction.builder().sender(sender.id()).receiver(receiver.id()).amount(amount).build(); }
}
