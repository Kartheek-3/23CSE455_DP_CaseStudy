package factory;

import java.util.List;

/** Product. */
interface Executor {

    String describe();

    List<String> run(List<String[]> tests);
}
