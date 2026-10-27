package br.com.michaelcruz.event;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

/** Observer: flags transactions at or above the alert threshold. */
@ApplicationScoped
public class HighValueAlertObserver {

    public static final double THRESHOLD = 10_000.0;
    private static final Logger LOG = Logger.getLogger(HighValueAlertObserver.class.getName());

    private final List<TransactionEvent> alerts = new ArrayList<>();

    void onTransaction(@Observes TransactionEvent event) {
        if (event.amount() >= THRESHOLD) {
            LOG.warning("High-value " + event.kind() + " of " + event.amount() + " on account " + event.accountId());
            synchronized (alerts) {
                alerts.add(event);
            }
        }
    }

    public List<TransactionEvent> alerts() {
        synchronized (alerts) {
            return List.copyOf(alerts);
        }
    }
}
