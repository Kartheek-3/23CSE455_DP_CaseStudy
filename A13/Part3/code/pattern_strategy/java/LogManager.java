interface LogBackend {
    String write(String level, String message);
}

class BootstrapConsoleBackend implements LogBackend {
    public String write(String level, String message) {
        return level + ": " + message;
    }
}

class PrettyConsoleBackend implements LogBackend {
    public String write(String level, String message) {
        return "[" + level.toUpperCase() + "] " + message;
    }
}

class JsonConsoleBackend implements LogBackend {
    public String write(String level, String message) {
        return "{\"level\":\"" + level + "\",\"message\":\"" + message + "\"}";
    }
}

public class LogManager {
    private LogBackend backend;

    public LogManager(LogBackend backend) {
        this.backend = backend;
    }

    public void setBackend(LogBackend backend) {
        if (backend == null) throw new IllegalArgumentException("backend is required");
        this.backend = backend;
    }

    public String log(String level, String message) {
        return backend.write(level, message);
    }
}
