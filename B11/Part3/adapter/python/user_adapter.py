"""Adapter pattern - mirrors UserAdapter.java. Representative of
CustomUserDetails in legalSystem modal/CustomUserDetails.java:10."""
from abc import ABC, abstractmethod
from typing import List


class User:                                  # Adaptee
    def __init__(self, name, password, active, roles):
        self.name = name
        self.password = password
        self.active = active
        self.roles = roles


class UserDetails(ABC):                       # Target
    @abstractmethod
    def get_username(self) -> str: ...
    @abstractmethod
    def get_password(self) -> str: ...
    @abstractmethod
    def is_enabled(self) -> bool: ...
    @abstractmethod
    def get_authorities(self) -> List[str]: ...


class UserDetailsAdapter(UserDetails):        # Adapter
    def __init__(self, user: User):
        self._user = user

    def get_username(self) -> str:
        return self._user.name

    def get_password(self) -> str:
        return self._user.password

    def is_enabled(self) -> bool:
        return self._user.active

    def get_authorities(self) -> List[str]:
        return [f"ROLE_{r}" for r in self._user.roles]


def main():
    u = User("rakshann", "secret", True, ["ADMIN", "LAWYER"])
    d = UserDetailsAdapter(u)
    print(f"username,{d.get_username()}")
    print(f"password,{d.get_password()}")
    print(f"enabled,{str(d.is_enabled()).lower()}")
    print("authorities," + "|".join(d.get_authorities()))


if __name__ == "__main__":
    main()
