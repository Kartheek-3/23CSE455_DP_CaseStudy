package command;

import java.util.List;

/** Command, modelled on JUnit's NodeTestTask / MethodInvocation (instance B9). */
interface Command {

    /** Runs the task and returns the line to print. */
    String execute(List<String> results);
}
