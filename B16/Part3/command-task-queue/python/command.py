"""Command, modelled on JUnit's NodeTestTask / MethodInvocation (instance B9): each task is an object
with execute(); the executor (invoker) queues them and runs them later without knowing what they do."""
from abc import ABC, abstractmethod


class InputFormatError(Exception):
    pass


class Command(ABC):
    @abstractmethod
    def execute(self, results):
        """Runs the task and returns the line to print."""


class RunTestCommand(Command):
    def __init__(self, name, outcome):
        self.name, self.outcome = name, outcome

    def execute(self, results):
        results.append(self.outcome)
        return f"test {self.name} -> {self.outcome}"


class NoteCommand(Command):
    def __init__(self, text):
        self.text = text

    def execute(self, results):
        return f"note: {self.text}"


class TaskExecutor:
    """Invoker: holds commands and executes them in submission order."""

    def __init__(self):
        self.queue = []
        self.results = []

    def submit(self, command):
        self.queue.append(command)

    def run_all(self):
        lines = [f"#{number} {command.execute(self.results)}" for number, command in enumerate(self.queue, start=1)]
        executed, self.queue = len(self.queue), []
        return lines, executed


def parse(lines):
    commands = []
    for number, line in enumerate(lines, start=1):
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        if fields[0] == "test" and len(fields) == 3 and fields[2] in ("PASS", "FAIL"):
            commands.append(RunTestCommand(fields[1], fields[2]))
        elif fields[0] == "note" and len(fields) > 1:
            commands.append(NoteCommand(" ".join(fields[1:])))
        elif fields[0] in ("test", "note"):
            raise InputFormatError(f"line {number}: expected 'test <name> PASS|FAIL' or 'note <text>'")
        else:
            raise InputFormatError(f"line {number}: unknown command '{fields[0]}'")
    return commands


def report(path):
    with open(path, encoding="utf-8") as f:
        commands = parse(f.read().splitlines())
    executor = TaskExecutor()
    for command in commands:
        executor.submit(command)
    out = [f"queued {len(commands)} commands"]
    lines, executed = executor.run_all()
    out.extend(lines)
    passed = executor.results.count("PASS")
    out.append(f"executed {executed} commands: {len(executor.results)} tests, {passed} passed, "
               f"{len(executor.results) - passed} failed")
    return "\n".join(out) + "\n"
