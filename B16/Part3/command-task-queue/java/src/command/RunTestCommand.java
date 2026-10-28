package command;

import java.util.List;

record RunTestCommand(String name, String outcome) implements Command {
    public String execute(List<String> results) {
        results.add(outcome);
        return "test " + name + " -> " + outcome;
    }
}
