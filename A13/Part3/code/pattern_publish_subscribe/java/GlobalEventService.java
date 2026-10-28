import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;

/** Stands in for Redis plus the per-connection channel emitters. */
class Broker {
    private final Map<String, List<BiConsumer<String, String>>> subscribers = new HashMap<>();

    void subscribe(String channel, BiConsumer<String, String> handler) {
        subscribers.computeIfAbsent(channel, c -> new ArrayList<>()).add(handler);
    }

    void unsubscribe(String channel, BiConsumer<String, String> handler) {
        List<BiConsumer<String, String>> handlers = subscribers.get(channel);
        if (handlers != null) handlers.remove(handler);
    }

    int publish(String channel, String message) {
        List<BiConsumer<String, String>> handlers = new ArrayList<>(subscribers.getOrDefault(channel, List.of()));
        for (BiConsumer<String, String> handler : handlers) handler.accept(channel, message);
        return handlers.size();
    }
}

public class GlobalEventService {
    private final Broker broker;

    public GlobalEventService(Broker broker) {
        this.broker = broker;
    }

    public int publishMainStream(String userId, String type, String body) {
        return publish("mainStream:" + userId, type, body);
    }

    public int publishBroadcastStream(String type, String body) {
        return publish("broadcast", type, body);
    }

    private int publish(String channel, String type, String body) {
        return broker.publish(channel, "{\"type\":\"" + type + "\",\"body\":\"" + body + "\"}");
    }
}
