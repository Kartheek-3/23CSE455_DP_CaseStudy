from typing import Protocol


class LogBackend(Protocol):
    def write(self, level: str, message: str) -> str: ...


class BootstrapConsoleBackend:
    def write(self, level, message):
        return f"{level}: {message}"


class PrettyConsoleBackend:
    def write(self, level, message):
        return f"[{level.upper()}] {message}"


class JsonConsoleBackend:
    def write(self, level, message):
        return '{"level":"%s","message":"%s"}' % (level, message)


class LogManager:
    def __init__(self, backend):
        self._backend = backend

    def set_backend(self, backend):
        if backend is None:
            raise ValueError("backend is required")
        self._backend = backend

    def log(self, level, message):
        return self._backend.write(level, message)
