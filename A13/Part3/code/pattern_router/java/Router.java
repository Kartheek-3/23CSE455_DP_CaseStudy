import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Consumer;

record Route(String path, String component, boolean loginRequired) {}

record Resolved(Route route, String component, Map<String, String> params, String query, String hash, boolean popup) {}

public class Router {
    private final List<Route> routes;
    private final boolean loggedIn;
    private final String notFound;
    private final List<Consumer<Resolved>> listeners = new ArrayList<>();
    private Resolved current;

    public Router(List<Route> routes, boolean loggedIn, String notFoundComponent) {
        this.routes = routes;
        this.loggedIn = loggedIn;
        this.notFound = notFoundComponent;
    }

    public void onChange(Consumer<Resolved> listener) {
        listeners.add(listener);
    }

    public Resolved resolve(String fullPath) {
        String[] hashSplit = fullPath.split("#", 2);
        String hash = hashSplit.length > 1 ? hashSplit[1] : "";
        String[] querySplit = hashSplit[0].split("\\?", 2);
        String query = querySplit.length > 1 ? querySplit[1] : "";
        List<String> segments = segmentsOf(querySplit[0]);
        for (Route route : routes) {
            List<String> pattern = segmentsOf(route.path());
            if (pattern.size() != segments.size()) continue;
            Map<String, String> params = new HashMap<>();
            boolean matches = true;
            for (int i = 0; i < pattern.size() && matches; i++) {
                if (pattern.get(i).startsWith(":")) params.put(pattern.get(i).substring(1), segments.get(i));
                else matches = pattern.get(i).equals(segments.get(i));
            }
            if (matches) return new Resolved(route, route.component(), params, query, hash, false);
        }
        return new Resolved(null, notFound, Map.of(), query, hash, false);
    }

    public Resolved navigate(String fullPath) {
        Resolved res = resolve(fullPath);
        if (res.route() != null && res.route().loginRequired() && !loggedIn) {
            res = new Resolved(res.route(), notFound, res.params(), res.query(), res.hash(), true);
        }
        current = res;
        if (res.route() != null) {
            for (Consumer<Resolved> listener : new ArrayList<>(listeners)) listener.accept(res);
        }
        return res;
    }

    private static List<String> segmentsOf(String path) {
        List<String> segments = new ArrayList<>();
        for (String s : path.split("/")) if (!s.isEmpty()) segments.add(s);
        return segments;
    }
}
