"""Tests for the Repository cross-language snippet (shared cases)."""

from user_repository import InMemoryUserRepository, User, UserService

passed = 0
total = 0


def check(label, actual, expected):
    global passed, total
    total += 1
    assert actual == expected, label + ": expected " + str(expected) + " got " + str(actual)
    passed += 1


service = UserService(InMemoryUserRepository())

service.register(User(1, "Ada"))
check("find-name", service.get(1).name, "Ada")
check("all-1", len(service.all()), 1)

service.register(User(2, "Bob"))
check("all-2", len(service.all()), 2)

check("missing", service.get(99), None)

service.register(User(1, "Ada2"))
check("overwrite-count", len(service.all()), 2)
check("overwrite-name", service.get(1).name, "Ada2")

service.remove(1)
check("deleted", service.get(1), None)
check("all-after-delete", len(service.all()), 1)

print("REPOSITORY_PY PASS " + str(passed) + "/" + str(total))
