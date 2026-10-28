package com.b9.wallet.notification;

import com.b9.wallet.domain.Transaction;
import java.util.*;

/** Subject role; observers can be added without changing transfer processing. */
public final class NotificationPublisher {
    private final List<TransactionObserver> observers = new ArrayList<>();
    public void subscribe(TransactionObserver observer) { observers.add(observer); }
    public void publishCompleted(Transaction transaction) { observers.forEach(o -> o.onCompleted(transaction)); }
}
