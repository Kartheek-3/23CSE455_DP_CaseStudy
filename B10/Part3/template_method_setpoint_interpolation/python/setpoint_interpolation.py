"""Template Method: date/daily setpoint interpolation.

Derived from mycodo/utils/method.py (DateMethod.calculate_setpoint with the ignore_date hook,
DailyMethod overriding the hook). Method rows are plain objects instead of database rows.
"""
import datetime

DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
TIME_FORMAT = '%H:%M:%S'


class MethodRow:
    """One row of method data: a time span and the setpoints at its start and end."""

    def __init__(self, time_start, time_end, setpoint_start, setpoint_end=None):
        self.time_start = time_start
        self.time_end = time_end
        self.setpoint_start = setpoint_start
        self.setpoint_end = setpoint_end


class DateMethod:
    """A time/date span dictates the setpoint. Defines the template method and the default hook."""

    def __init__(self, rows):
        self.method_data_all = rows

    def ignore_date(self):
        """Hook: False means the date part of the date-time is considered."""
        return False

    def calculate_setpoint(self, now_text):
        """Template method: returns (setpoint or None, ended)."""
        now = datetime.datetime.strptime(now_text, DATE_FORMAT)
        row_format = DATE_FORMAT
        if self.ignore_date():
            now = datetime.datetime.strptime(now.strftime(TIME_FORMAT), TIME_FORMAT)
            row_format = TIME_FORMAT

        for row in self.method_data_all:
            start_time = datetime.datetime.strptime(row.time_start, row_format)
            end_time = datetime.datetime.strptime(row.time_end, row_format)
            if start_time < now < end_time:
                setpoint_start = row.setpoint_start
                setpoint_end = row.setpoint_end if row.setpoint_end is not None else setpoint_start
                setpoint_diff = abs(setpoint_end - setpoint_start)
                total_seconds = (end_time - start_time).total_seconds()
                part_seconds = (now - start_time).total_seconds()
                percent_total = part_seconds / total_seconds
                if setpoint_start < setpoint_end:
                    return setpoint_start + setpoint_diff * percent_total, False
                return setpoint_start - setpoint_diff * percent_total, False

        return None, False


class DailyMethod(DateMethod):
    """Repeats every day: only the time of day is compared."""

    def ignore_date(self):
        return True
