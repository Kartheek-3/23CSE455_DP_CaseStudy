from abc import ABC, abstractmethod

COLUMN_PREFIX = "___"
RANGE_MAX = 1000


class Chart(ABC):
    def __init__(self):
        self.rows = []

    @abstractmethod
    def tick_major(self, group): ...

    @abstractmethod
    def tick_minor(self, group): ...

    def tick(self, major, group=None):
        data = self.tick_major(group) if major else self.tick_minor(group)
        columns = {COLUMN_PREFIX + key.replace(".", "_"): max(0, min(RANGE_MAX, value))
                   for key, value in data.items()}
        if columns:
            self.rows.append(columns)
        return columns


class UsersChart(Chart):
    def tick_major(self, group):
        return {"total": 1500, "local.total": 40}

    def tick_minor(self, group):
        return {"local.total": 41}


class NotesChart(Chart):
    def tick_major(self, group):
        return {"total": -5}

    def tick_minor(self, group):
        return {}
