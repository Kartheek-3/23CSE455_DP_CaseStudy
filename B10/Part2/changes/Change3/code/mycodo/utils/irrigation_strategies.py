# coding=utf-8
"""Irrigation decision strategies for on/off irrigation controllers.

A strategy looks at the current situation (an IrrigationContext) and decides
whether the irrigation output should be switched on, switched off, or left as
it is. Plain Python (no Flask/database imports) so it can be tested in isolation.

Strategies:
  RaiseHysteresisStrategy / LowerHysteresisStrategy - the on/off band (per direction)
  TimeWindowStrategy - only irrigate inside allowed time windows (wraps another strategy)
  RainSkipStrategy   - skip irrigation while rain is expected (wraps another strategy)
The wrapping strategies derive from IrrigationRestriction and can be stacked.
build_irrigation_strategy() is the single creation point used by the bang-bang Function.
"""
import datetime
from abc import ABC
from abc import abstractmethod
from dataclasses import dataclass

TURN_ON = 'on'
TURN_OFF = 'off'

DEFAULT_IRRIGATION_STRATEGY = 'hysteresis'
IRRIGATION_STRATEGY_CHOICES = [
    ('hysteresis', 'Hysteresis band (default)'),
    ('time_window', 'Time windows: irrigate only in allowed hours'),
    ('skip_if_rain', 'Skip irrigation when rain is expected'),
]


class UnknownIrrigationStrategyError(LookupError):
    """Raised when an irrigation strategy id is not known."""


@dataclass(frozen=True)
class IrrigationContext:
    measurement: float  # latest value of the controlled measurement (e.g. soil moisture)
    output_state: str  # output state reported by the daemon ('on' / 'off' / ...)
    lower_threshold: float  # setpoint - hysteresis
    upper_threshold: float  # setpoint + hysteresis
    now: datetime.datetime = None  # local time of the decision
    rain_indicator: float = None  # latest rain indicator value, None if not read or missing


class IrrigationStrategy(ABC):
    """Decides the next output command for an on/off irrigation controller."""

    @abstractmethod
    def decide(self, context):
        """Return TURN_ON, TURN_OFF or None (send no command)."""

    def needs_rain_indicator(self):
        """True if decide() uses context.rain_indicator."""
        return False


class RaiseHysteresisStrategy(IrrigationStrategy):
    """Output raises the measurement (e.g. irrigation raises soil moisture)."""

    def decide(self, context):
        if context.measurement > context.upper_threshold:
            return TURN_OFF if context.output_state == 'on' else None
        if context.measurement < context.lower_threshold:
            return TURN_ON
        return None


class LowerHysteresisStrategy(IrrigationStrategy):
    """Output lowers the measurement (mirror image of RaiseHysteresisStrategy)."""

    def decide(self, context):
        if context.measurement < context.lower_threshold:
            return TURN_OFF if context.output_state == 'on' else None
        if context.measurement > context.upper_threshold:
            return TURN_ON
        return None


# Strategy for each value of the bang-bang 'direction' option
DIRECTION_STRATEGIES = {
    'raise': RaiseHysteresisStrategy(),
    'lower': LowerHysteresisStrategy(),
}


class IrrigationRestriction(IrrigationStrategy):
    """Wraps another strategy and delegates to it; subclasses add a restriction."""

    def __init__(self, inner):
        self.inner = inner

    def decide(self, context):
        return self.inner.decide(context)

    def needs_rain_indicator(self):
        return self.inner.needs_rain_indicator()

    @staticmethod
    def _stop(context):
        """Keep the output off: switch it off if it is on, otherwise send nothing."""
        return TURN_OFF if context.output_state == 'on' else None


class TimeWindowStrategy(IrrigationRestriction):
    """Irrigate only inside the allowed time windows; outside them the output is kept off."""

    def __init__(self, inner, windows):
        super().__init__(inner)
        self.windows = tuple(windows)

    def decide(self, context):
        if in_time_windows(self.windows, context.now.time()):
            return self.inner.decide(context)
        return self._stop(context)


class RainSkipStrategy(IrrigationRestriction):
    """Skip irrigation while the rain indicator is at or above the threshold."""

    def __init__(self, inner, threshold):
        super().__init__(inner)
        self.threshold = threshold

    def decide(self, context):
        if context.rain_indicator is not None and context.rain_indicator >= self.threshold:
            return self._stop(context)
        return self.inner.decide(context)

    def needs_rain_indicator(self):
        return True


def parse_time_windows(text):
    """Parse 'HH:MM-HH:MM[,HH:MM-HH:MM...]' into a tuple of (start, end) datetime.time pairs.

    A window whose end is earlier than its start crosses midnight. Raises ValueError
    for an empty text, a malformed or out-of-range time, or a zero-length window.
    """
    if not text or not text.strip():
        raise ValueError("No irrigation time window given")
    windows = []
    for part in text.split(','):
        try:
            start_text, end_text = part.strip().split('-')
            start = datetime.datetime.strptime(start_text.strip(), '%H:%M').time()
            end = datetime.datetime.strptime(end_text.strip(), '%H:%M').time()
        except ValueError:
            raise ValueError(f"Invalid irrigation time window '{part.strip()}' (expected HH:MM-HH:MM)") from None
        if start == end:
            raise ValueError(f"Irrigation time window '{part.strip()}' has zero length")
        windows.append((start, end))
    return tuple(windows)


def in_time_windows(windows, time_of_day):
    """True if time_of_day is inside one of the windows (start inclusive, end exclusive)."""
    for start, end in windows:
        if start < end:
            if start <= time_of_day < end:
                return True
        elif time_of_day >= start or time_of_day < end:  # window crosses midnight
            return True
    return False


def build_irrigation_strategy(name, direction, time_windows='', rain_threshold=None):
    """Single creation point: the strategy for a strategy id and a direction ('raise'/'lower').

    Raises UnknownIrrigationStrategyError for an unknown strategy id, KeyError for an
    unknown direction and ValueError for invalid time windows or a missing threshold.
    """
    band = DIRECTION_STRATEGIES[direction]
    if name == 'hysteresis':
        return band
    if name == 'time_window':
        return TimeWindowStrategy(band, parse_time_windows(time_windows))
    if name == 'skip_if_rain':
        if rain_threshold is None:
            raise ValueError("No rain threshold given")
        return RainSkipStrategy(band, rain_threshold)
    raise UnknownIrrigationStrategyError(f"Unknown irrigation strategy '{name}'")
