import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// Observer pattern (GoF, behavioural) -- real-time occupancy notifications.
// Production snippet. Tests live in ObserverTest.java.

public interface OccupancyObserver {
    void update(String event);
}

class AvailabilityObserver implements OccupancyObserver {
    private final Set<Integer> occupied = new HashSet<>();

    public void update(String event) {
        int sep = event.indexOf(':');
        String kind = event.substring(0, sep);
        int id = Integer.parseInt(event.substring(sep + 1));
        if (kind.equals("occupy")) {
            occupied.add(id);
        } else if (kind.equals("free")) {
            occupied.remove(id);
        }
    }

    int count() {
        return occupied.size();
    }
}

class LoggingObserver implements OccupancyObserver {
    final List<String> events = new ArrayList<>();

    public void update(String event) {
        events.add(event);
    }
}

class OccupancyMonitor {
    private final List<OccupancyObserver> observers = new ArrayList<>();

    void attach(OccupancyObserver observer) {
        observers.add(observer);
    }

    void detach(OccupancyObserver observer) {
        observers.remove(observer);
    }

    int notify(String event) {
        for (OccupancyObserver observer : observers) {
            observer.update(event);
        }
        return observers.size();
    }
}
