# coding=utf-8
"""Sensor-based alerts: a notifier (subject) and the listeners it informs.

A controller raises an alert when a sensor condition starts (e.g. no reading, or
critically dry soil) and clears it when the condition ends. The notifier delivers
each alert once per episode to every attached listener; a failing listener is
logged and does not stop the others. Plain Python (no Flask/database imports).
"""
import datetime
import logging
from abc import ABC
from abc import abstractmethod
from dataclasses import dataclass
from dataclasses import field

MISSING_MEASUREMENT = 'missing_measurement'
CRITICALLY_DRY = 'critically_dry'


@dataclass(frozen=True)
class SensorAlert:
    kind: str  # MISSING_MEASUREMENT, CRITICALLY_DRY, ...
    source: str  # id of the controller that raised the alert
    message: str
    value: float = None  # measurement that caused the alert, if any
    timestamp: datetime.datetime = field(default_factory=datetime.datetime.now)


class AlertListener(ABC):
    """Receives sensor alerts from a SensorAlertNotifier."""

    @abstractmethod
    def on_alert(self, alert):
        """Handle one alert."""


class SensorAlertNotifier:
    """Keeps the attached listeners and the active alert kinds; notifies once per episode."""

    def __init__(self, logger=None):
        self.logger = logger or logging.getLogger(__name__)
        self._listeners = []
        self._active_kinds = set()

    @property
    def listeners(self):
        return tuple(self._listeners)

    def attach(self, listener):
        if listener not in self._listeners:
            self._listeners.append(listener)

    def detach(self, listener):
        if listener in self._listeners:
            self._listeners.remove(listener)

    def is_active(self, kind):
        return kind in self._active_kinds

    def raise_alert(self, alert):
        """Notify the listeners unless this kind of alert is already active. Returns True if notified."""
        if alert.kind in self._active_kinds:
            return False
        self._active_kinds.add(alert.kind)
        self._notify(alert)
        return True

    def clear(self, kind):
        """The condition has ended; the next alert of this kind is delivered again."""
        self._active_kinds.discard(kind)

    def _notify(self, alert):
        for listener in list(self._listeners):
            try:
                listener.on_alert(alert)
            except Exception:
                self.logger.exception(
                    f"Alert listener {type(listener).__name__} failed to handle '{alert.kind}' alert")


class LogAlertListener(AlertListener):
    """Writes alerts to a log as warnings."""

    def __init__(self, logger):
        self.logger = logger

    def on_alert(self, alert):
        self.logger.warning(f"ALERT [{alert.kind}] {alert.message}")


class EmailAlertListener(AlertListener):
    """E-mails alerts; `send(recipients, message, subject=...)` does the actual sending."""

    def __init__(self, recipients, send):
        if not recipients:
            raise ValueError("At least one e-mail recipient is required")
        self.recipients = list(recipients)
        self.send = send

    def on_alert(self, alert):
        self.send(self.recipients, alert.message, subject=f"Mycodo alert: {alert.kind}")


def parse_recipients(text):
    """Split a comma-separated recipient list, dropping blanks."""
    return [address.strip() for address in (text or '').split(',') if address.strip()]
