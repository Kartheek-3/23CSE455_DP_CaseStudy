from typing import Callable


Guard = Callable[[str | None], bool]


def create_guard(*allowed_roles: str) -> Guard:
    allowed = set(allowed_roles)

    def guard(user_role: str | None) -> bool:
        if user_role is None:
            return False

        return user_role in allowed

    return guard