package com.b9.wallet.notification;

import com.b9.wallet.domain.Transaction;
public final class EmailNotifier implements TransactionObserver { public void onCompleted(Transaction transaction) { System.out.println("email " + transaction.id); } }
