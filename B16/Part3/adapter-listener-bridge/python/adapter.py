"""Adapter, modelled on JUnit's ExecutionListenerAdapter (instance B7): the engine reports events
through EngineListener (the Target) using raw unique ids; ListenerAdapter converts them into
TestIdentifier objects for a client TestListener (the Adaptee), which has a different interface."""
import re


class InputFormatError(Exception):
    pass


STATUSES = ("SUCCESSFUL", "FAILED", "ABORTED")
SEGMENTS = re.compile(r"\[([a-z-]+):([^\]]+)\]")


class EngineListener:
    """Target: the interface the engine calls."""

    def execution_started(self, unique_id):
        pass

    def execution_finished(self, unique_id, status):
        pass


class TestIdentifier:
    def __init__(self, display_name, is_test, parent_name):
        self.display_name = display_name
        self.is_test = is_test
        self.parent_name = parent_name

    def describe(self):
        kind = "test" if self.is_test else "container"
        parent = f" (in {self.parent_name})" if self.parent_name else ""
        return f"{kind} {self.display_name}{parent}"


class TestListener:
    """Adaptee: the client-side interface, which works with TestIdentifier objects."""

    def test_started(self, identifier):
        pass

    def test_finished(self, identifier, status):
        pass


class PrintingTestListener(TestListener):
    def __init__(self):
        self.lines = []

    def test_started(self, identifier):
        self.lines.append(f"started  {identifier.describe()}")

    def test_finished(self, identifier, status):
        self.lines.append(f"finished {identifier.describe()}: {status}")


def to_identifier(unique_id):
    segments = SEGMENTS.findall(unique_id)
    kind, name = segments[-1]
    parent = segments[-2][1] if len(segments) > 1 else None
    return TestIdentifier(name, kind == "method", parent)


class ListenerAdapter(EngineListener):
    """Adapter: implements the Target and forwards to the Adaptee in its own terms."""

    def __init__(self, test_listener):
        self.test_listener = test_listener

    def execution_started(self, unique_id):
        self.test_listener.test_started(to_identifier(unique_id))

    def execution_finished(self, unique_id, status):
        self.test_listener.test_finished(to_identifier(unique_id), status)


def run_engine(lines, engine_listener):
    """The engine side: knows only EngineListener and raw unique ids."""
    for number, line in enumerate(lines, start=1):
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        event = fields[0]
        if event not in ("started", "finished"):
            raise InputFormatError(f"line {number}: unknown event '{event}'")
        if len(fields) != (2 if event == "started" else 3):
            raise InputFormatError(f"line {number}: malformed {event} event")
        unique_id = fields[1]
        if not re.fullmatch(r"(\[[a-z-]+:[^\]]+\])(/\[[a-z-]+:[^\]]+\])*", unique_id):
            raise InputFormatError(f"line {number}: malformed unique id '{unique_id}'")
        if event == "started":
            engine_listener.execution_started(unique_id)
        else:
            if fields[2] not in STATUSES:
                raise InputFormatError(f"line {number}: unknown status '{fields[2]}'")
            engine_listener.execution_finished(unique_id, fields[2])


def report(path):
    with open(path, encoding="utf-8") as f:
        lines = f.read().splitlines()
    client = PrintingTestListener()
    run_engine(lines, ListenerAdapter(client))
    return "\n".join(client.lines) + "\n"
