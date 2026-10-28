package br.com.michaelcruz.event;

import java.time.Instant;

/** Published after a deposit or withdrawal has been applied (the observable state change). */
public record TransactionEvent(Long accountId, TransactionKind kind, double amount, double balanceAfter, Instant at) {
}
