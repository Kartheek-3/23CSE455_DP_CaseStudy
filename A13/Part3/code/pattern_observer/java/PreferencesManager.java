import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

record CommitEvent(String key, String value, String oldValue) {}

public class PreferencesManager {
    private final Map<String, String> state = new HashMap<>();
    private final List<Consumer<CommitEvent>> listeners = new ArrayList<>();

    public void on(Consumer<CommitEvent> listener) {
        listeners.add(listener);
    }

    public void off(Consumer<CommitEvent> listener) {
        listeners.remove(listener);
    }

    public void commit(String key, String value) {
        if (value.equals(state.get(key))) return; // unchanged: not announced
        state.put(key, value);
        // As in manager.ts:261-271, oldValue is read after the state was updated, so it equals value.
        CommitEvent event = new CommitEvent(key, value, state.get(key));
        for (Consumer<CommitEvent> listener : new ArrayList<>(listeners)) listener.accept(event);
    }
}
