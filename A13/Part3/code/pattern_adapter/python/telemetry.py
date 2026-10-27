from abc import ABC, abstractmethod

DEFAULT_SHUTDOWN_TIMEOUT = 5000


class TelemetryAdapter(ABC):
    @abstractmethod
    def capture_message(self, message, user_id=None): ...

    @abstractmethod
    def start_span(self, name, fn): ...

    @abstractmethod
    def shutdown(self): ...


class SentryTelemetryAdapter(TelemetryAdapter):
    # Translates the application's telemetry calls into the Sentry SDK's API.

    def __init__(self, sentry):
        self._sentry = sentry

    def capture_message(self, message, user_id=None):
        options = {"level": "error"}
        if user_id is not None:
            options["user.id"] = user_id
        self._sentry.capture_message(message, options)

    def start_span(self, name, fn):
        return self._sentry.start_span({"name": name}, fn)

    def shutdown(self):
        self._sentry.close(DEFAULT_SHUTDOWN_TIMEOUT)


class TelemetryRegistry:
    def __init__(self, adapters):
        self._adapters = list(adapters)

    def capture_message(self, message, user_id=None):
        for adapter in self._adapters:
            adapter.capture_message(message, user_id)

    def start_span(self, name, fn):
        return self._span(0, name, fn)

    def _span(self, index, name, fn):
        if index == len(self._adapters):
            return fn()
        return self._adapters[index].start_span(name, lambda: self._span(index + 1, name, fn))

    def shutdown(self):
        for adapter in self._adapters:
            adapter.shutdown()
