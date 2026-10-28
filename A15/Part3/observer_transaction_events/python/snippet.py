class BadRequest(Exception):
    pass


class Event:                                    # Event (what is published)
    def __init__(self, kind, account_id, amount):
        self.kind, self.account_id, self.amount = kind, account_id, amount


class EventPublisher:                           # SubjectChannel: keeps the observers, knows none by type
    def __init__(self):
        self.observers = []

    def subscribe(self, observer):
        self.observers.append(observer)

    def publish(self, event):
        for observer in self.observers:
            observer.on_event(event)


class AccountService:                           # Subject: publishes after a valid operation
    def __init__(self, publisher):
        self.publisher = publisher

    def deposit(self, account_id, amount):
        self._apply("DEPOSIT", account_id, amount)

    def withdraw(self, account_id, amount):
        self._apply("WITHDRAWAL", account_id, amount)

    def _apply(self, kind, account_id, amount):
        if amount <= 0:
            raise BadRequest()                  # failed operations publish nothing
        self.publisher.publish(Event(kind, account_id, amount))


class AuditLog:                                 # ConcreteObserver
    def __init__(self):
        self.entries = {}

    def on_event(self, event):
        self.entries.setdefault(event.account_id, []).append(event)

    def text(self, account_id):
        return ",".join("%s:%.2f" % (e.kind, e.amount) for e in self.entries.get(account_id, [])) or "-"


class HighValueAlert:                           # ConcreteObserver
    THRESHOLD = 10000.0

    def __init__(self):
        self.alerts = []

    def on_event(self, event):
        if event.amount >= self.THRESHOLD:
            self.alerts.append(event)

    def text(self):
        return ",".join("%s:%.2f@%d" % (e.kind, e.amount, e.account_id) for e in self.alerts) or "-"
