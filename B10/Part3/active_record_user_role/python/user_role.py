"""Active Record: user and role persistence.

Derived from mycodo/databases/__init__.py (CRUDMixin.save / delete), mycodo/databases/models/user.py
(User.set_password / check_password) and mycodo/databases/models/role.py (Role). Flask-SQLAlchemy
(db.Model, db.session) is replaced by an in-memory Session that enforces the declared unique/required
columns; bcrypt is replaced by a std-lib FNV-1a salted stand-in (NOT secure); current_app.logger is
replaced by Session.log.
"""
import secrets


class IntegrityError(Exception):
    pass


class InvalidRequestError(Exception):
    pass


def gensalt():
    return f'$fnv${secrets.token_hex(4)}$'


def hashpw(password, salt_or_hash):
    """bcrypt.hashpw stand-in: '$fnv$<salt>$<FNV-1a 32 of salt+password>'."""
    parts = salt_or_hash.split('$')
    if len(parts) < 4 or parts[0] != '' or parts[1] != 'fnv' or not parts[2]:
        raise ValueError('Invalid salt')
    h = 0x811c9dc5
    for byte in (parts[2] + password).encode('utf-8'):
        h = ((h ^ byte) * 0x01000193) & 0xffffffff
    return f'$fnv${parts[2]}${h:08x}'


class Session:
    """Stand-in for db.session plus the database tables."""

    def __init__(self):
        self.committed, self.pending, self.log = [], [], []

    def add(self, obj):
        self.pending.append(('add', obj))

    def delete(self, obj):
        if obj not in self.committed:
            raise InvalidRequestError(f'Instance {obj!r} is not persisted')
        self.pending.append(('delete', obj))

    def commit(self):
        rows = [r for r in self.committed if ('delete', r) not in self.pending]
        for operation, obj in self.pending:
            if operation == 'add':
                others = [r for r in rows if type(r) is type(obj) and r is not obj]
                for column in obj.REQUIRED:
                    if getattr(obj, column) is None:
                        raise IntegrityError(f'NOT NULL constraint failed: {column}')
                for column in obj.UNIQUE:
                    if any(getattr(r, column) == getattr(obj, column) for r in others):
                        raise IntegrityError(f'UNIQUE constraint failed: {column}')
                rows.append(obj)
        self.committed, self.pending = rows, []

    def rollback(self):
        self.pending = []

    def count(self, model):
        return sum(type(r) is model for r in self.committed)


class CRUDMixin:
    """Active Record base: the record saves and deletes itself through its session."""

    def save(self):
        try:
            self.session.add(self)
            self.session.commit()
            return self
        except Exception as error:
            self.session.rollback()
            self.session.log.append(f'Failed to save {self!r} due to error: {error}')

    def delete(self):
        try:
            self.session.delete(self)
            self.session.commit()
        except Exception as error:
            self.session.log.append(f"Failed to delete '{self!r}': '{error}'")


class User(CRUDMixin):
    UNIQUE, REQUIRED = ('name', 'email'), ()

    def __init__(self, session, name, email):
        self.session, self.name, self.email, self.password_hash = session, name, email, None

    def set_password(self, new_password):
        self.password_hash = hashpw(new_password, gensalt())

    @staticmethod
    def check_password(password, hashed_password):
        return hashpw(password, hashed_password)


class Role(CRUDMixin):
    UNIQUE, REQUIRED = ('name',), ('name',)

    def __init__(self, session, name):
        self.session, self.name, self.edit_settings, self.view_logs = session, name, False, False
