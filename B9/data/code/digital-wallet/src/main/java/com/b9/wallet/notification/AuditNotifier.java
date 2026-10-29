package com.b9.wallet.notification;

import com.b9.wallet.domain.Transaction;
public final class AuditNotifier implements TransactionObserver { public void onCompleted(Transaction transaction) { System.out.println("audit " + transaction.id); } }
