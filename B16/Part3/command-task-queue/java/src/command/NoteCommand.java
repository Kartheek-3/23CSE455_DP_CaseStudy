package command;

import java.util.List;

record NoteCommand(String text) implements Command {
    public String execute(List<String> results) {
        return "note: " + text;
    }
}
