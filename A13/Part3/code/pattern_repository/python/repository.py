class EntityNotFound(Exception):
    def __init__(self):
        super().__init__("EntityNotFound")


class InMemoryRepository:
    """Stands in for TypeORM's Repository<T>: the persistence side."""

    def __init__(self):
        self._rows = []
        self._last_id = 0

    def insert(self, entity):
        self._last_id += 1
        self._rows.append(dict(entity, id=str(self._last_id)))
        return {"id": str(self._last_id)}

    def find_one_by(self, criteria):
        for row in self._rows:
            if all(row.get(k) == v for k, v in criteria.items()):
                return row
        return None

    def find_one_or_fail(self, criteria):
        row = self.find_one_by(criteria)
        if row is None:
            raise EntityNotFound()
        return row

    def count(self):
        return len(self._rows)


class MiRepository:
    """Misskey's extension: insert, then read the stored row back (miRepository.insertOne)."""

    def insert_one(self, entity):
        identifiers = self.insert(entity)
        return self.find_one_or_fail(identifiers)


class UsersRepository(MiRepository, InMemoryRepository):
    pass


class UserService:
    def __init__(self, users_repository):
        self._users = users_repository

    def register(self, name):
        return self._users.insert_one({"name": name})

    def find_by_name(self, name):
        return self._users.find_one_by({"name": name})

    def get_by_name(self, name):
        return self._users.find_one_or_fail({"name": name})

    def count(self):
        return self._users.count()
