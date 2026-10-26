package composite;

/** Thrown when the tree file cannot be read. */
public final class TreeFormatException extends RuntimeException {

    public TreeFormatException(String message) {
        super(message);
    }

    public TreeFormatException(int lineNumber, String message) {
        this("line " + lineNumber + ": " + message);
    }
}
