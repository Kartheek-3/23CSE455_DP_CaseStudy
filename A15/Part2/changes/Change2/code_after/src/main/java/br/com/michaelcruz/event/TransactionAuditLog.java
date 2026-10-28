package br.com.michaelcruz.event;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Observer: keeps an in-memory audit trail per account (not durable across restarts). */
@ApplicationScoped
public class TransactionAuditLog {

    private final Map<Long, List<TransactionEvent>> entries = new HashMap<>();

    void onTransaction(@Observes TransactionEvent event) {
        synchronized (entries) {
            entries.computeIfAbsent(event.accountId(), id -> new ArrayList<>()).add(event);
        }
    }

    public List<TransactionEvent> entriesFor(Long accountId) {
        synchronized (entries) {
            return List.copyOf(entries.getOrDefault(accountId, Collections.emptyList()));
        }
    }
}
