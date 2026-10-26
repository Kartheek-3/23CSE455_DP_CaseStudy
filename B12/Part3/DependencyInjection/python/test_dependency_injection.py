"""Tests for the Dependency Injection cross-language snippet (shared cases)."""

from notification_service import (
    EmailSender,
    NotificationService,
    SmsSender,
    build_notification_service,
)

passed = 0
total = 0


def check(label, actual, expected):
    global passed, total
    total += 1
    assert actual == expected, label + ": expected " + str(expected) + " got " + str(actual)
    passed += 1


email = EmailSender()
check("email-channel", email.channel(), "email")

email_service = NotificationService(email)
check("email-send", email_service.notify("hi"), "email:hi")

sms = SmsSender()
check("sms-channel", sms.channel(), "sms")

sms_service = NotificationService(sms)
check("sms-send", sms_service.notify("hi"), "sms:hi")

check("inject-different", 1 if email_service.notify("x") != sms_service.notify("x") else 0, 1)
check("composition-root", 1 if build_notification_service().notify("p") == "email:p" else 0, 1)

print("DEPENDENCY_INJECTION_PY PASS " + str(passed) + "/" + str(total))
