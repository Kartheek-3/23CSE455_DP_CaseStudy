from dataclasses import dataclass
from typing import Callable, List, Optional


@dataclass(frozen=True)
class NotificationState:
    unread_count: int
    latest_notification: Optional[str]


class NotificationsSubject:
    """Subject that publishes the current notification state to observers."""

    def __init__(self):
        self._observers: List[Callable[[NotificationState], None]] = []
        self._state = NotificationState(0, None)

    @property
    def state(self):
        return self._state

    def subscribe(self, observer):
        if observer not in self._observers:
            self._observers.append(observer)
        # BehaviorSubject-like: immediately provide the current state.
        observer(self._state)

    def unsubscribe(self, observer):
        if observer in self._observers:
            self._observers.remove(observer)

    def _publish(self):
        for observer in list(self._observers):
            observer(self._state)

    def publish_new_notification(self, message):
        self._state = NotificationState(
            self._state.unread_count + 1, message
        )
        self._publish()

    def mark_one_as_read(self):
        self._state = NotificationState(
            max(0, self._state.unread_count - 1),
            self._state.latest_notification
        )
        self._publish()

    def mark_all_as_read(self):
        self._state = NotificationState(0, self._state.latest_notification)
        self._publish()


class NotificationPanel:
    """Concrete observer representing a UI notification panel."""

    def __init__(self):
        self.state = None

    def update(self, state):
        self.state = state
