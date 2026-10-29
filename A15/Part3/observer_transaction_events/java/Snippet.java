import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.StringJoiner;

class BadRequest extends RuntimeException { }

class Event {                                    // Event (what is published)
    final String kind; final long accountId; final double amount;
    Event(String kind, long accountId, double amount) { this.kind = kind; this.accountId = accountId; this.amount = amount; }
}

interface Observer { void onEvent(Event e); }

class EventPublisher {                           // SubjectChannel: keeps the observers, knows none by type
    private final List<Observer> observers = new ArrayList<>();
    void subscribe(Observer o) { observers.add(o); }
    void publish(Event e) { for (Observer o : observers) o.onEvent(e); }
}

class AccountService {                           // Subject: publishes after a valid operation
    private final EventPublisher publisher;
    AccountService(EventPublisher publisher) { this.publisher = publisher; }
    void deposit(long accountId, double amount) { apply("DEPOSIT", accountId, amount); }
    void withdraw(long accountId, double amount) { apply("WITHDRAWAL", accountId, amount); }
    private void apply(String kind, long accountId, double amount) {
        if (amount <= 0) throw new BadRequest();  // failed operations publish nothing
        publisher.publish(new Event(kind, accountId, amount));
    }
}

class AuditLog implements Observer {             // ConcreteObserver
    private final Map<Long, List<Event>> entries = new HashMap<>();
    public void onEvent(Event e) { entries.computeIfAbsent(e.accountId, k -> new ArrayList<>()).add(e); }
    String text(long accountId) {
        StringJoiner j = new StringJoiner(",");
        for (Event e : entries.getOrDefault(accountId, List.of())) j.add(String.format(Locale.ROOT, "%s:%.2f", e.kind, e.amount));
        return j.length() == 0 ? "-" : j.toString();
    }
}

class HighValueAlert implements Observer {       // ConcreteObserver
    static final double THRESHOLD = 10000.0;
    private final List<Event> alerts = new ArrayList<>();
    public void onEvent(Event e) { if (e.amount >= THRESHOLD) alerts.add(e); }
    String text() {
        StringJoiner j = new StringJoiner(",");
        for (Event e : alerts) j.add(String.format(Locale.ROOT, "%s:%.2f@%d", e.kind, e.amount, e.accountId));
        return j.length() == 0 ? "-" : j.toString();
    }
}
