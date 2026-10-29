"""Measures every Part 3 program on this machine and writes ../data/cross_language.csv.

For each problem x language, from that language's folder (commands as in its README):
  1. compile (Java, C++), 2. run the test runner and record passed/total,
  3. lizard on the production files only (tests excluded): NLOC = lines with code, no blanks/comments/docstrings,
     max function CCN,
  4. time the program on the shared input: 1 warm-up + 5 measured runs, median of the 5.
     Time = wall-clock time of the whole process (startup + reading the input + output), measured
     from Python with time.perf_counter_ns around subprocess.run; output is captured, not printed.
Raw times go to timing-raw.csv; each test runner's full output goes to evidence/test_results/<Pattern>_<Language>.txt.
Run from Part3/:  python3 measure.py   (needs lizard on PATH and JAVA_HOME/bin first)
            python3 measure.py --tests-only   (only re-runs the tests and rewrites the test logs)
"""
import csv
import re
import statistics
import subprocess
import sys
import time
from pathlib import Path

HERE = Path(__file__).resolve().parent
RUNS, WARMUP = 5, 1

PROBLEMS = {
    "observer-test-listeners": dict(
        pattern="Observer", instance="C1 Test Execution Listeners",
        args="../test-data/events.txt", pkg="observer", demo="ObserverDemo", test="ObserverTest",
        py_test="test_observer", js_test="test/observer.test.js", cpp_src="listeners.cpp runner.cpp", bin="observer",
        prod={"java": "src/observer/*.java", "python": "listeners.py runner.py main.py", "javascript": "src/*.js",
              "cpp": "listeners.hpp listeners.cpp runner.hpp runner.cpp main.cpp"}),
    "composite-test-tree": dict(
        pattern="Composite", instance="A1 Test Descriptor Tree",
        args="../test-data/tree.txt slow", pkg="composite", demo="CompositeDemo", test="CompositeTest",
        py_test="test_composite", js_test="test/composite.test.js", cpp_src="nodes.cpp tree_parser.cpp", bin="composite",
        prod={"java": "src/composite/*.java", "python": "nodes.py tree_parser.py main.py", "javascript": "src/*.js",
              "cpp": "nodes.hpp nodes.cpp tree_parser.hpp tree_parser.cpp main.cpp"}),
    "strategy-test-filters": dict(
        pattern="Strategy", instance="A3 Post-Discovery Filter Policies",
        args="../test-data/tests.txt", pkg="strategy", demo="StrategyDemo", test="StrategyTest",
        py_test="test_strategy", js_test="test/strategy.test.js", cpp_src="", bin="strategy",
        prod={"java": "src/strategy/*.java", "python": "strategy.py main.py", "javascript": "src/*.js", "cpp": "strategy.hpp main.cpp"}),
    "adapter-listener-bridge": dict(
        pattern="Adapter", instance="B7 Engine-to-Launcher Listener Adapter",
        args="../test-data/events.txt", pkg="adapter", demo="AdapterDemo", test="AdapterTest",
        py_test="test_adapter", js_test="test/adapter.test.js", cpp_src="", bin="adapter",
        prod={"java": "src/adapter/*.java", "python": "adapter.py main.py", "javascript": "src/*.js", "cpp": "adapter.hpp main.cpp"}),
    "decorator-timeout-invocation": dict(
        pattern="Decorator", instance="D10 Timeout Invocation Wrappers",
        args="../test-data/invocations.txt", pkg="decorator", demo="DecoratorDemo", test="DecoratorTest",
        py_test="test_decorator", js_test="test/decorator.test.js", cpp_src="", bin="decorator",
        prod={"java": "src/decorator/*.java", "python": "decorator.py main.py", "javascript": "src/*.js", "cpp": "decorator.hpp main.cpp"}),
    "template-method-engine": dict(
        pattern="Template Method", instance="B1 Hierarchical Engine Execution Skeleton",
        args="../test-data/tests.txt", pkg="template", demo="TemplateDemo", test="TemplateTest",
        py_test="test_template", js_test="test/template.test.js", cpp_src="", bin="template",
        prod={"java": "src/template/*.java", "python": "template.py main.py", "javascript": "src/*.js", "cpp": "template.hpp main.cpp"}),
    "command-task-queue": dict(
        pattern="Command", instance="B9 Node Execution Tasks",
        args="../test-data/tasks.txt", pkg="command", demo="CommandDemo", test="CommandTest",
        py_test="test_command", js_test="test/command.test.js", cpp_src="", bin="command",
        prod={"java": "src/command/*.java", "python": "command.py main.py", "javascript": "src/*.js", "cpp": "command.hpp main.cpp"}),
    "null-object-listener": dict(
        pattern="Null Object", instance="C7 No-op Listeners",
        args="../test-data/tests.txt", pkg="nullobject", demo="NullObjectDemo", test="NullObjectTest",
        py_test="test_nullobject", js_test="test/nullobject.test.js", cpp_src="", bin="nullobject",
        prod={"java": "src/nullobject/*.java", "python": "nullobject.py main.py", "javascript": "src/*.js", "cpp": "nullobject.hpp main.cpp"}),
    "chain-of-responsibility-interceptors": dict(
        pattern="Chain of Responsibility", instance="D9 Invocation Interceptor Chain",
        args="../test-data/invocations.txt", pkg="chain", demo="ChainDemo", test="ChainTest",
        py_test="test_chain", js_test="test/chain.test.js", cpp_src="", bin="chain",
        prod={"java": "src/chain/*.java", "python": "chain.py main.py", "javascript": "src/*.js", "cpp": "chain.hpp main.cpp"}),
    "factory-method-executors": dict(
        pattern="Factory Method", instance="B2 Engine Collaborator Factory Methods",
        args="../test-data/tests.txt", pkg="factory", demo="FactoryDemo", test="FactoryTest",
        py_test="test_factory", js_test="test/factory.test.js", cpp_src="", bin="factory",
        prod={"java": "src/factory/*.java", "python": "factory.py main.py", "javascript": "src/*.js", "cpp": "factory.hpp main.cpp"}),
}

NOTES = {
    ("observer-test-listeners", "java"): "Static typing: observer is an interface with default no-op methods, checked by the compiler; notifyEach takes a Consumer lambda; catches RuntimeException; listener name via reflection; garbage collected.",
    ("observer-test-listeners", "python"): "Duck typing: base class only supplies no-op methods, no ABC (callbacks are optional); a class not inheriting from it still works; misspelt callbacks only fail at run time; catches Exception; garbage collected.",
    ("observer-test-listeners", "javascript"): "Classes without interfaces: nothing enforces the contract, a plain object with one method is accepted; #private fields; catch receives any thrown value; listener name via constructor.name; synchronous to keep output order; garbage collected.",
    ("observer-test-listeners", "cpp"): "Abstract base class with virtual no-op callbacks and override checking; name() is pure virtual (no portable runtime class name); ownership explicit: shared_ptr in the composite, runner borrows by reference; catches std::exception; std::function for notifyEach.",
    ("composite-test-tree", "java"): "Component is an interface; safe Composite (addChild only on TestContainer; JUnit uses the transparent form); leaf is an immutable record; parser uses pattern-matching instanceof; removed children are garbage collected.",
    ("composite-test-tree", "python"): "Component is an abc.ABC with @abstractmethod (missing methods caught when the object is created, at run time); duck-typed recursion with sum(...); safe Composite with isinstance check; lists rebuilt instead of edited while iterating; reference counting frees removed nodes at once.",
    ("composite-test-tree", "javascript"): "No interfaces: base class blocks direct construction via new.target and throws in unimplemented methods (found only when called); duck typing underneath; #children private field rebuilt with filter; safe Composite with instanceof; garbage collected.",
    ("composite-test-tree", "cpp"): "Pure virtual base class checked by the compiler, copying deleted to avoid slicing; ownership tree of unique_ptr children (erase_if frees a node immediately, whole tree freed when root goes out of scope); parser keeps non-owning raw pointers; safe Composite with dynamic_cast.",
    ("strategy-test-filters", "java"): "The strategy is an interface and the concrete strategies are records: each is an immutable value with its parameter (tag, text) and the compiler checks every override. TestSelector uses filter::includes as a method reference in a stream, which is the same shape as JUnit's Filter.toPredicate(). The test plugs in an anonymous class the selector has never seen, showing that the context depends only on the interface.",
    ("strategy-test-filters", "python"): 'TestFilter is an abc.ABC; a subclass that forgets includes or describe cannot be instantiated, but this is checked at run time, not compile time. The selector only calls includes(), so any object with that method would work (duck typing); the ABC documents the contract. Lists are filtered with a comprehension instead of a stream.',
    ("strategy-test-filters", "javascript"): 'There are no interfaces: TestFilter blocks new TestFilter() with new.target and throws if a subclass forgets a method, which is only noticed when it is called. The test passes a plain object { includes } as a strategy and the selector accepts it: pure duck typing. Parameters are #private fields.',
    ("strategy-test-filters", "cpp"): 'TestFilter has pure virtual functions, so a strategy that misses one does not compile; concrete strategies are final. TestSelector borrows the strategy by const&; the strategies are owned by report() as std::unique_ptr<TestFilter> in a vector, so ownership is explicit. Selection uses std::copy_if with a lambda.',
    ("adapter-listener-bridge", "java"): "Target and adaptee are two separate interfaces; the adapter implements the target and holds the adaptee (object adapter), exactly like JUnit's ExecutionListenerAdapter. TestIdentifier is a record, so the test can compare it with equals directly. Unique ids are parsed with java.util.regex.",
    ("adapter-listener-bridge", "python"): 'The adapter subclasses the target class, but the engine would accept any object with execution_started/execution_finished (duck typing). The parent name is None for the root, so describe() uses a conditional expression. Regular expressions come from the re module.',
    ("adapter-listener-bridge", "javascript"): 'The test passes a plain object with only testFinished as the client listener; the adapter calls only what exists, so duck typing replaces the interface. toIdentifier uses matchAll and Array.prototype.at(-1). The adaptee is a #private field of the adapter.',
    ("adapter-listener-bridge", "cpp"): 'The adapter is a final class that overrides the pure virtual target functions; it holds the adaptee by reference, so it does not own it. The optional parent is a std::optional<std::string> instead of a null value. Unique ids are parsed with std::regex and std::sregex_iterator.',
    ("decorator-timeout-invocation", "java"): 'Decorators and the component share the Invocation interface, so they can be nested in any order; the test shows the opposite nesting (Timeout(Logging(...))). The abstract InvocationDecorator forwards every method, so each concrete decorator overrides only proceed(). The wrapped object is a final field set in the constructor.',
    ("decorator-timeout-invocation", "python"): "Invocation is an ABC with three abstract methods; InvocationDecorator forwards them, as in Java. A decorator here is a class, not Python's @decorator syntax: @ decorates functions at definition time, whereas this pattern wraps objects at run time. The summary keeps insertion order because dict preserves it.",
    ("decorator-timeout-invocation", "javascript"): 'There is no component interface; the decorators forward name and durationMs through getters, so callers cannot tell a decorator from the real invocation. The wrapped object is a public field (inner) so subclasses can reach it; the limit and log are #private. Nesting order is free, as shown in the test.',
    ("decorator-timeout-invocation", "cpp"): 'Each decorator owns the object it wraps as std::unique_ptr<Invocation>; building Logging(Timeout(test)) moves ownership inwards, and destroying the outer object frees the whole chain. LoggingInvocation borrows the shared log by reference. override and final let the compiler check every decorator against the component.',
    ("template-method-engine", "java"): 'execute is final, so a subclass cannot change the order of the steps; this is the language-enforced form of the pattern, as in JUnit (HierarchicalTestEngine.execute is final). runTest is abstract (must be implemented); the hooks are ordinary methods with empty bodies (may be overridden). The test builds a new engine as an anonymous subclass that implements only the primitive.',
    ("template-method-engine", "python"): 'Python has no final for methods at run time (typing.final is only a hint for type checkers), so the fixed skeleton is a convention. run_test is an @abstractmethod; hooks are normal methods with empty bodies. A subclass could still override execute; nothing stops it.',
    ("template-method-engine", "javascript"): 'There is no final and no abstract: the base class throws from name()/runTest() if a subclass forgets them, and overriding execute is only discouraged. Hooks are empty methods, as in the other languages. The test defines a subclass inline with class ... extends TestEngine.',
    ("template-method-engine", "cpp"): 'execute is not virtual, so it cannot be overridden polymorphically; the primitive is pure virtual and the hooks are virtual with empty bodies. Primitive and hooks are protected: only the template method calls them, which C++ can express directly. report() uses the two engines through TestEngine*, i.e. dynamic dispatch.',
    ("command-task-queue", "java"): 'Commands are records implementing one interface; the invoker keeps a List<Command> and runs them later, which is what makes execution deferrable (the test checks nothing runs on submit). In Java a lambda could also be a command, because the interface has one method. The queue is cleared after runAll.',
    ("command-task-queue", "python"): 'Command is an ABC; since Python functions are first-class objects, a plain function or closure could serve as a command too. The invoker returns both the printed lines and how many commands it executed. Commands share the results list passed to execute.',
    ("command-task-queue", "javascript"): "There is no interface: any object with execute(results) is a command. The executor's queue is a #private field, so commands can only be added through submit. runAll maps the queue to lines in one expression.",
    ("command-task-queue", "cpp"): 'The executor owns its commands as std::unique_ptr<Command>; submit takes ownership with std::move, and executed commands are destroyed when the queue is cleared. Commands are polymorphic through the pure virtual execute. std::count computes the passed tests from the results.',
    ("null-object-listener", "java"): 'The null object is a lambda stored as an interface constant, TestListener.NOOP, exactly where JUnit puts EngineExecutionListener.NOOP. The no-argument constructor delegates to this(TestListener.NOOP), so listener is never null. The test checks identity (==) with the shared constant.',
    ("null-object-listener", "python"): 'The default argument listener=NOOP is safe here because NOOP is a stateless shared instance (a mutable default would be a bug). None is avoided entirely; the runner just calls the method. The test checks identity with assertIs.',
    ("null-object-listener", "javascript"): 'NOOP is a frozen object literal, so nobody can add behaviour to the shared instance. A default parameter (listener = NOOP) replaces both null and undefined checks. Any object with testFinished can be a listener.',
    ("null-object-listener", "cpp"): 'The runner holds a TestListener&; a reference can never be null, so the language itself removes the null check, and the default argument binds it to the singleton NoOpListener::instance(). The null object is a function-local static, created once and never freed explicitly. The test compares addresses to show the null object is used.',
    ("chain-of-responsibility-interceptors", "java"): 'A handler receives the request and a proceed callback (Supplier<String>) instead of a fixed next field, so the same handlers can be reordered in any chain. JUnit does the same through Invocation.proceed(), which InvocationInterceptorChain wires to the next interceptor. A handler ends the chain by returning without calling proceed.get() (see DisabledInterceptor). The chain is built recursively in InterceptorChain.link.',
    ("chain-of-responsibility-interceptors", "python"): 'proceed is a lambda closing over the next index, so each link is created on demand. Handlers are classes with an abstract intercept; plain functions would also work. The trace list on the request records which links ran.',
    ("chain-of-responsibility-interceptors", "javascript"): 'Handlers are any objects with label and intercept; label is a class field. proceed is an arrow function closing over the next link. The test reorders the chain to show that a handler can stop it early.',
    ("chain-of-responsibility-interceptors", "cpp"): 'proceed is a std::function<std::string()> built from a lambda that captures the chain and request by reference, which is safe because both outlive the call. Handlers are owned by the chain as std::unique_ptr<Interceptor>. run_chain is a recursive function with a default index argument.',
    ("factory-method-executors", "java"): "execute is written once in the abstract creator and calls the abstract createExecutor; subclasses only decide which product is created, as JUnit's JupiterTestEngine does. The product is an interface, so execute never names a concrete executor. The test creates a new engine with a 3-worker pool by overriding only the factory method.",
    ("factory-method-executors", "python"): 'create_executor is an @abstractmethod; Python classes are also callable factories, so an engine could store a class instead, but the subclass form matches the pattern. The product is an ABC with describe and run. execute returns plain lines so all languages can compare them.',
    ("factory-method-executors", "javascript"): 'The creator throws if createExecutor() is not overridden (no abstract in the language). Executors are any objects with describe and run. report uses flatMap over the two engines.',
    ("factory-method-executors", "cpp"): 'The factory method returns std::unique_ptr<Executor>, so the caller (execute) owns the product and it is freed when execute returns. Factory method and product are pure virtual; create_executor is protected because only execute should call it. Engines are temporaries in report.',
}


def sh(cmd, cwd):
    return subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)


def version(cmd):
    out = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    return (out.stdout + out.stderr).strip().splitlines()[0]


def tests_result(lang, out):
    text = out.stdout + out.stderr
    if lang in ("java", "cpp"):
        m = re.search(r"(\d+) passed, (\d+) failed", text)
        passed, failed = int(m.group(1)), int(m.group(2))
    elif lang == "python":
        total = int(re.search(r"Ran (\d+) tests?", text).group(1))
        failed = sum(int(x) for x in re.findall(r"(?:failures|errors)=(\d+)", text))
        passed = total - failed
    else:
        passed, failed = int(re.search(r"(?:#|ℹ) pass (\d+)", text).group(1)), int(re.search(r"(?:#|ℹ) fail (\d+)", text).group(1))
    status = "passed" if failed == 0 and out.returncode == 0 else "failed"
    return f"{passed}/{passed + failed} {status}"


def lizard(cwd, files):
    out = subprocess.run(f"lizard {files}", shell=True, cwd=cwd, capture_output=True, text=True).stdout
    funcs = re.findall(r"^\s+(\d+)\s+(\d+)\s+\d+\s+\d+\s+\d+\s+\S+@", out, re.M)
    nloc = int(re.search(r"^Total nloc.*\n-+\n\s+(\d+)", out, re.M).group(1))
    max_ccn = max(int(c) for _, c in funcs)
    return nloc, max_ccn, out


def main():
    tools = {"java": version("java -version"), "python": version("python3 --version"),
             "javascript": "Node.js " + version("node --version"), "cpp": version("clang++ --version") + ", -std=c++20 (no -O flag, as in the README)"}
    rows, raw, lizard_log = [], [], []
    for problem, p in PROBLEMS.items():
        for lang in ("java", "python", "javascript", "cpp"):
            cwd = HERE / problem / lang
            if lang == "java":
                build = f"javac -d out src/{p['pkg']}/*.java test/{p['pkg']}/*.java"
                run = f"java -cp out {p['pkg']}.{p['demo']} {p['args']}"
                test = f"java -cp out {p['pkg']}.{p['test']}"
            elif lang == "python":
                build, run, test = None, f"python3 main.py {p['args']}", f"python3 -m unittest -v {p['py_test']}"
            elif lang == "javascript":
                build, run, test = None, f"node src/main.js {p['args']}", f"node --test {p['js_test']}"
            else:
                build = (f"clang++ -std=c++20 -Wall -Wextra -pedantic -o {p['bin']} main.cpp {p['cpp_src']} && "
                         f"clang++ -std=c++20 -Wall -Wextra -pedantic -o {p['bin']}_test test_main.cpp {p['cpp_src']}")
                run, test = f"./{p['bin']} {p['args']}", f"./{p['bin']}_test"
            if build:
                b = sh(build, cwd)
                assert b.returncode == 0, b.stderr
            test_out = sh(test, cwd)
            result = tests_result(lang, test_out)
            label = {"java": "Java", "python": "Python", "javascript": "JavaScript", "cpp": "Cpp"}[lang]
            log = HERE / "evidence" / "test_results" / f"{p['pattern'].replace(' ', '')}_{label}.txt"
            log.parent.mkdir(parents=True, exist_ok=True)
            log.write_text(f"$ (cd Part3/{problem}/{lang}) {test}\n{test_out.stdout}{test_out.stderr}[exit {test_out.returncode}]\n"
                           f"result: {result}\n", encoding="utf-8")
            if "--tests-only" in sys.argv:
                print(f"{problem:24} {lang:10} tests={result}")
                continue
            expected = (HERE / problem / "test-data" / "expected-output.txt").read_text()
            assert sh(run, cwd).stdout == expected, f"{problem}/{lang}: output differs from expected"
            times = []
            for i in range(WARMUP + RUNS):
                t0 = time.perf_counter_ns()
                r = subprocess.run(run, shell=True, cwd=cwd, capture_output=True)
                ms = (time.perf_counter_ns() - t0) / 1e6
                assert r.returncode == 0
                raw.append([problem, lang, "warmup" if i < WARMUP else f"run{i}", f"{ms:.2f}"])
                if i >= WARMUP:
                    times.append(ms)
            nloc, ccn, lz = lizard(cwd, p["prod"][lang])
            lizard_log.append(f"### {problem}/{lang}: lizard {p['prod'][lang]}\n{lz}")
            prod_paths = "; ".join(f"Part3/{problem}/{lang}/{f.relative_to(cwd)}"
                                   for pattern in p["prod"][lang].split() for f in sorted(cwd.glob(pattern)))
            rows.append(dict(pattern_name=p["pattern"], instance_name=p["instance"], language=lang.replace("cpp", "C++")
                             .replace("javascript", "JavaScript").replace("python", "Python").replace("java", "Java"),
                             snippet_path=prod_paths, source_loc=nloc, max_function_cc=ccn, runtime_compiler=tools[lang],
                             test_command=f"(cd Part3/{problem}/{lang}) " + (build + " && " if build else "") + test,
                             test_result=f"{result} (Part3/{log.relative_to(HERE).as_posix()})", median_process_ms=f"{statistics.median(times):.1f}",
                             language_notes=NOTES[(problem, lang)]))
            print(f"{problem:24} {lang:10} loc={nloc:3} maxCC={ccn:2} tests={result:12} median={statistics.median(times):7.1f} ms")
    if "--tests-only" in sys.argv:
        return
    with (HERE.parent / "data" / "cross_language.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)
    with (HERE / "timing-raw.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["problem", "language", "run", "elapsed_ms"])
        w.writerows(raw)
    (HERE / "lizard-raw.txt").write_text("\n".join(lizard_log), encoding="utf-8")


if __name__ == "__main__":
    main()
