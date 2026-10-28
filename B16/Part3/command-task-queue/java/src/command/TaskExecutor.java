package command;

import java.util.ArrayList;
import java.util.List;

/** Invoker: holds commands and executes them later, in submission order, without knowing what they do. */
final class TaskExecutor {

    private final List<Command> queue = new ArrayList<>();
    final List<String> results = new ArrayList<>();

    void submit(Command command) {
        queue.add(command);
    }

    /** Executes and clears the queue; returns the printed lines. */
    List<String> runAll() {
        List<String> lines = new ArrayList<>();
        for (int i = 0; i < queue.size(); i++) {
            lines.add("#" + (i + 1) + " " + queue.get(i).execute(results));
        }
        queue.clear();
        return lines;
    }
}
