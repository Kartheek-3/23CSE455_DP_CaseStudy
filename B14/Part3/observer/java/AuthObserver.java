import java.util.ArrayList;
import java.util.List;

interface AuthListener {
    void onAuthStateChanged(String event, String session);
}
final class AuthEventSource {
    private final List<AuthListener> listeners = new ArrayList<>();
    void subscribe(AuthListener listener) { listeners.add(listener); }
    void unsubscribe(AuthListener listener) { listeners.remove(listener); }
    void publish(String event, String session) {
        for (AuthListener listener : List.copyOf(listeners)) {
            listener.onAuthStateChanged(event, session);
        }
    }
}
final class RecordingAuthListener implements AuthListener {
    private final String name;
    private final List<String> received = new ArrayList<>();
    RecordingAuthListener(String name) { this.name = name; }
    public void onAuthStateChanged(String event, String session) {
        received.add(name + " receives " + event + ":" + session);
    }
    List<String> received() { return received; }
}
