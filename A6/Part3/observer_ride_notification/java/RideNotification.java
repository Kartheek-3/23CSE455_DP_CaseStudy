import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** Observer pattern: ride event notification (mirrors SocketNotificationService + Redis socket registry). */
public final class RideNotification {
    private RideNotification() {}

    public record Event(String type, String bookingId) {}

    public interface Observer {
        void update(Event event);
    }

    /** Stands in for a connected rider/driver socket. */
    public static final class RecordingObserver implements Observer {
        public final List<Event> received = new ArrayList<>();
        public void update(Event event) { received.add(event); }
    }

    /** Subject: one observer per subscriber id; a reconnect replaces the old one. */
    public static final class NotificationHub {
        private final Map<String, Observer> subscribers = new HashMap<>();

        public void subscribe(String id, Observer observer) { subscribers.put(id, observer); }

        public void unsubscribe(String id) { subscribers.remove(id); }

        public boolean notify(String id, Event event) {
            Observer observer = subscribers.get(id);
            if (observer == null) return false;
            observer.update(event);
            return true;
        }

        public int broadcast(List<String> ids, Event event) {
            int delivered = 0;
            for (String id : ids) {
                if (notify(id, event)) delivered++;
            }
            return delivered;
        }
    }
}
