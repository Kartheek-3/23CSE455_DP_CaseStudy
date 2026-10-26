package com.b9.wallet.notification;

import com.b9.wallet.domain.Transaction;
public interface TransactionObserver { void onCompleted(Transaction transaction); }
