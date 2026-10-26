"""Repository pattern (architectural, data-access) -- in-memory User repository.

Production snippet. Tests live in test_repository.py.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, List, Optional


@dataclass
class User:
    id: int
    name: str


class UserRepository(ABC):
    @abstractmethod
    def save(self, user: User) -> User:
        raise NotImplementedError

    @abstractmethod
    def find_by_id(self, user_id: int) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    def find_all(self) -> List[User]:
        raise NotImplementedError

    @abstractmethod
    def delete_by_id(self, user_id: int) -> bool:
        raise NotImplementedError


class InMemoryUserRepository(UserRepository):
    def __init__(self) -> None:
        self._store: Dict[int, User] = {}

    def save(self, user: User) -> User:
        self._store[user.id] = user
        return user

    def find_by_id(self, user_id: int) -> Optional[User]:
        return self._store.get(user_id)

    def find_all(self) -> List[User]:
        return list(self._store.values())

    def delete_by_id(self, user_id: int) -> bool:
        return self._store.pop(user_id, None) is not None


class UserService:
    def __init__(self, repository: UserRepository) -> None:
        self._repository = repository

    def register(self, user: User) -> User:
        return self._repository.save(user)

    def get(self, user_id: int) -> Optional[User]:
        return self._repository.find_by_id(user_id)

    def all(self) -> List[User]:
        return self._repository.find_all()

    def remove(self, user_id: int) -> bool:
        return self._repository.delete_by_id(user_id)
