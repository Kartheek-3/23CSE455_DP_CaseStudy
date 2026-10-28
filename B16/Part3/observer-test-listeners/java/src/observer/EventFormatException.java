package observer;

/** Thrown when a line of the events file cannot be read. */
public final class EventFormatException extends RuntimeException {

    public EventFormatException(int lineNumber, String message) {
        super("line " + lineNumber + ": " + message);
    }
}
