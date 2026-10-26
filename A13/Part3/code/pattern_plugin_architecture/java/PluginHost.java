import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;

interface HandlerRegistrar {
    void addHandler(String type, Function<String, String> fn);
}

public class PluginHost {
    private record Handler(String pluginId, String type, Function<String, String> fn) {}

    private final Set<String> contexts = new HashSet<>();
    private final List<Handler> handlers = new ArrayList<>();

    public void install(String pluginId, Consumer<HandlerRegistrar> setup) {
        contexts.add(pluginId);
        // an error from setup propagates; handlers added so far stay registered
        setup.accept((type, fn) -> handlers.add(new Handler(pluginId, type, fn)));
    }

    public void abort(String pluginId) {
        if (!contexts.remove(pluginId)) return;
        handlers.removeIf(h -> h.pluginId().equals(pluginId));
    }

    public List<Function<String, String>> getHandlers(String type) {
        List<Function<String, String>> result = new ArrayList<>();
        for (Handler h : handlers) if (h.type().equals(type)) result.add(h.fn());
        return result;
    }
}
