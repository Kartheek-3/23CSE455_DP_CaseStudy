"""Dependency Injection pattern -- constructor injection + composition root.

Production snippet. Tests live in test_dependency_injection.py.
"""

from abc import ABC, abstractmethod


class NotificationSender(ABC):
    @abstractmethod
    def channel(self) -> str:
        raise NotImplementedError

    @abstractmethod
    def send(self, message: str) -> str:
        raise NotImplementedError


class EmailSender(NotificationSender):
    def channel(self) -> str:
        return "email"

    def send(self, message: str) -> str:
        return "email:" + message


class SmsSender(NotificationSender):
    def channel(self) -> str:
        return "sms"

    def send(self, message: str) -> str:
        return "sms:" + message


class NotificationService:
    def __init__(self, sender: NotificationSender) -> None:
        self._sender = sender

    def notify(self, message: str) -> str:
        return self._sender.send(message)


def build_notification_service() -> NotificationService:
    return NotificationService(EmailSender())
