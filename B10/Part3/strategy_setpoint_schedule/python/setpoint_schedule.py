"""Strategy: setpoint schedule calculation.

Derived from mycodo/utils/method.py (AbstractMethod, DailySineMethod, DurationMethod, CascadeMethod,
create_method_handler, sine_wave_y_out). Times are plain seconds; method data rows are number lists
instead of database rows; CascadeMethod receives its linked strategies directly.
"""
import math


class AbstractMethod:
    """Strategy interface; also the neutral fallback strategy for unknown method types."""

    def calculate_setpoint(self, now, method_start_time=None):
        return None, False


def sine_wave_y_out(amplitude, frequency, shift_angle, shift_y, angle_in):
    return (amplitude * math.sin(math.radians(frequency * (angle_in - shift_angle)))) + shift_y


class DailySineMethod(AbstractMethod):
    def __init__(self, amplitude, frequency, shift_angle, shift_y):
        self.amplitude, self.frequency = amplitude, frequency
        self.shift_angle, self.shift_y = shift_angle, shift_y

    def calculate_setpoint(self, now, method_start_time=None):
        seconds_of_day = math.floor(now) % 86400
        angle = seconds_of_day / 86400 * 360
        return sine_wave_y_out(self.amplitude, self.frequency, self.shift_angle, self.shift_y, angle), False


class DurationMethod(AbstractMethod):
    """Rows (duration_sec, setpoint_start, setpoint_end); a row with duration 0 is the repeat row."""

    def __init__(self, rows):
        self.method_data_all = rows

    def cycle_duration(self):
        return sum(row[0] for row in self.method_data_all)

    def repeat_duration(self):
        for duration_sec, _setpoint_start, duration_end in self.method_data_all:
            if duration_sec == 0:
                return duration_end or 0
        return None

    def calculate_setpoint(self, now, method_start_time=None):
        duration_in_seconds = self.cycle_duration()
        seconds_from_start = now - method_start_time
        if seconds_from_start >= duration_in_seconds:
            repeat_duration = self.repeat_duration()
            if repeat_duration is None or 0 < repeat_duration <= seconds_from_start:
                return None, True
            seconds_from_start = seconds_from_start % duration_in_seconds
        total_sec = previous_total_sec = 0
        for duration_sec, setpoint_start, setpoint_end in self.method_data_all:
            total_sec += duration_sec
            if previous_total_sec <= seconds_from_start < total_sec:
                percent_row = (seconds_from_start - previous_total_sec) / duration_sec
                setpoint_diff = abs(setpoint_end - setpoint_start)
                if setpoint_start < setpoint_end:
                    return setpoint_start + setpoint_diff * percent_row, False
                return setpoint_start - setpoint_diff * percent_row, False
            previous_total_sec = total_sec
        return previous_total_sec, False


class CascadeMethod(AbstractMethod):
    """Context: multiplies the setpoints of its linked strategies (each taken as a percentage)."""

    def __init__(self, linked_methods):
        self.linked_methods = linked_methods

    def calculate_setpoint(self, now, method_start_time=None):
        setpoint = 1.0
        for linked_method in self.linked_methods:
            linked_setpoint, linked_ended = linked_method.calculate_setpoint(now, method_start_time)
            if linked_setpoint is not None:
                setpoint *= linked_setpoint / 100.0
            if linked_ended:
                return None, True
        return setpoint * 100.0, False


def create_method_handler(method_type, rows, linked_methods=None):
    """Selects the strategy for a method type; unknown types fall back to AbstractMethod."""
    if method_type == 'DailySine':
        if len(rows) != 1 or len(rows[0]) != 4:
            raise ValueError('DailySine needs exactly one row of 4 numbers')
        return DailySineMethod(*rows[0])
    if method_type == 'Duration':
        if any(len(row) != 3 for row in rows):
            raise ValueError('Duration rows need exactly 3 numbers')
        return DurationMethod([tuple(row) for row in rows])
    if method_type == 'Cascade':
        return CascadeMethod(linked_methods or [])
    return AbstractMethod()
