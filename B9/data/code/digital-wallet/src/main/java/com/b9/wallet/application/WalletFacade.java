package com.b9.wallet.application;

import com.b9.wallet.domain.*;
import com.b9.wallet.notification.NotificationPublisher;
import com.b9.wallet.repository.WalletRepository;
import com.b9.wallet.transaction.TransferCommand;

/** Facade is the application boundary that a Quarkus REST resource would inject. */
public final class WalletFacade {
    private final WalletRepository repository; private final NotificationPublisher notifications;
    public WalletFacade(WalletRepository repository, NotificationPublisher notifications) { this.repository = repository; this.notifications = notifications; }
    public Transaction transfer(String from, String to, Money amount) {
        Wallet sender = repository.find(from).orElseThrow(); Wallet receiver = repository.find(to).orElseThrow();
        Transaction result = new TransferCommand(sender, receiver, amount).execute(); notifications.publishCompleted(result); return result;
    }
}
