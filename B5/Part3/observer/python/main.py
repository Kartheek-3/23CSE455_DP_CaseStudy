from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass(frozen=True)
class MailMessage:
    message_id: str
    subject: str
    recipient: str | None


class MailObserver(ABC):
    @abstractmethod
    def onDelivered(self, message: MailMessage) -> None:
        pass


class MailLogger(MailObserver):
    def __init__(self) -> None:
        self.received: list[MailMessage] = []

    def onDelivered(self, message: MailMessage) -> None:
        self.received.append(message)


class MailDeliveryPublisher:
    def __init__(self) -> None:
        self._observers: list[MailObserver] = []

    def register(self, observer: MailObserver) -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def unregister(self, observer: MailObserver) -> None:
        if observer in self._observers:
            self._observers.remove(observer)

    def deliver(self, message: MailMessage, delivered: bool) -> None:
        if not delivered:
            return
        if message.recipient is None or not message.recipient.strip():
            raise ValueError("INVALID_RECIPIENT")
        for observer in tuple(self._observers):
            observer.onDelivered(message)
