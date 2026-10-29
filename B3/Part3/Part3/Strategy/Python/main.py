
from abc import ABC, abstractmethod


class PermissionStrategy(ABC):
    @abstractmethod
    def has_permission(self, user, job=None):
        pass


class IsEmployer(PermissionStrategy):
    def has_permission(self, user, job=None):
        return user is not None and user["role"] == "employer"


class IsEmployee(PermissionStrategy):
    def has_permission(self, user, job=None):
        return user is not None and user["role"] == "employee"


class IsJobCreator(PermissionStrategy):
    def has_permission(self, user, job=None):
        return (
            user is not None
            and job is not None
            and job["owner_id"] == user["id"]
        )


def check_permission(strategy, user, job=None):
    return strategy.has_permission(user, job)


if __name__ == "__main__":
    employer = {"id": 1, "role": "employer"}
    employee = {"id": 2, "role": "employee"}
    job = {"id": 101, "owner_id": 1}

    print("Employer permission:", check_permission(IsEmployer(), employer))
    print("Employee permission:", check_permission(IsEmployee(), employee))
    print("Job creator permission:", check_permission(IsJobCreator(), employer, job))
