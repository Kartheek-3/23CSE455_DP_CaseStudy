interface LogBackend {
    String name();
    String write(String level, String message);
}

class PrettyConsoleBackend implements LogBackend {
    public String name() { return "pretty"; }

    public String write(String level, String message) {
        return "[" + level.toUpperCase() + "] " + message;
    }
}

class JsonConsoleBackend implements LogBackend {
    public String name() { return "json"; }

    public String write(String level, String message) {
        return "{\"level\":\"" + level + "\",\"message\":\"" + message + "\"}";
    }
}

public class LoggingFactory {
    public static LogBackend createLoggingBackend(String format) {
        if (format == null || format.equals("pretty")) return new PrettyConsoleBackend();
        if (format.equals("json")) return new JsonConsoleBackend();
        throw new IllegalArgumentException("logging.format must be either pretty or json");
    }
}
