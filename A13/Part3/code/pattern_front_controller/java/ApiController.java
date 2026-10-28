import java.util.HashMap;
import java.util.Map;
import java.util.function.BiFunction;
import java.util.function.Function;

record Endpoint(String name, boolean requireCredential, BiFunction<String, String, String> execute) {}

record Response(int status, String text) {}

public class ApiController {
    private final Function<String, String> authenticate;
    private final int limit;
    private final Map<String, Endpoint> endpoints = new HashMap<>();
    private final Map<String, Integer> calls = new HashMap<>();

    public ApiController(Function<String, String> authenticate, int limit) {
        this.authenticate = authenticate;
        this.limit = limit;
    }

    public void register(Endpoint endpoint) {
        endpoints.put(endpoint.name(), endpoint);
    }

    public Response handle(String name, String token, String body) {
        Endpoint endpoint = endpoints.get(name);
        if (endpoint == null) return new Response(404, "no such endpoint");
        String user = authenticate.apply(token);
        if (endpoint.requireCredential() && user == null) return new Response(401, "credential required");
        String actor = user == null ? "anon" : user;
        int count = calls.getOrDefault(actor, 0);
        if (count >= limit) return new Response(429, "rate limited");
        calls.put(actor, count + 1);
        return new Response(200, endpoint.execute().apply(body, user));
    }
}
