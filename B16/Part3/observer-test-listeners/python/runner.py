"""The subject: reads events line by line and pushes each one to its listener."""

from listeners import Status

REASON_PREFIX = "reason="


class EventFormatError(ValueError):
    def __init__(self, line_number, message):
        super().__init__(f"line {line_number}: {message}")


class EventRunner:
    def __init__(self, listener):
        self._listener = listener

    def run(self, lines):
        for line_number, line in enumerate(lines, start=1):
            self._dispatch(line_number, line.strip())

    def _dispatch(self, line_number, text):
        if not text or text.startswith("#"):
            return
        fields = text.split()
        event = fields[0]

        def require(condition):
            if not condition:
                raise EventFormatError(line_number, f"malformed {event} event")

        if event == "started":
            require(len(fields) == 2)
            self._listener.execution_started(fields[1])
        elif event == "finished":
            require(len(fields) == 3)
            if fields[2] not in Status.__members__:
                raise EventFormatError(line_number, f"unknown status '{fields[2]}'")
            self._listener.execution_finished(fields[1], Status[fields[2]])
        elif event == "skipped":
            require(len(fields) >= 3 and fields[2].startswith(REASON_PREFIX))
            reason = " ".join(fields[2:])[len(REASON_PREFIX):]
            require(reason != "")
            self._listener.execution_skipped(fields[1], reason)
        else:
            raise EventFormatError(line_number, f"unknown event '{event}'")
