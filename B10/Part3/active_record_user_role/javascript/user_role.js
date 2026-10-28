'use strict';
/**
 * Active Record: user and role persistence. CRUDMixin is the Active Record base.
 * Derived from mycodo/databases/__init__.py (CRUDMixin.save / delete), mycodo/databases/models/user.py
 * (User.set_password / check_password) and mycodo/databases/models/role.py (Role). Flask-SQLAlchemy
 * (db.Model, db.session) is replaced by an in-memory Session that enforces the declared unique/required
 * columns; bcrypt is replaced by a std-lib FNV-1a salted stand-in (NOT secure); current_app.logger is
 * replaced by Session.log.
 */
const crypto = require('crypto');

class IntegrityError extends Error {}
class InvalidRequestError extends Error {}

const gensalt = () => `$fnv$${crypto.randomBytes(4).toString('hex')}$`;

/** bcrypt.hashpw stand-in: '$fnv$<salt>$<FNV-1a 32 of salt+password>'. */
function hashpw(password, saltOrHash) {
  const parts = saltOrHash.split('$');
  if (parts.length < 4 || parts[0] !== '' || parts[1] !== 'fnv' || !parts[2]) throw new Error('Invalid salt');
  let h = 0x811c9dc5;
  for (const byte of Buffer.from(parts[2] + password, 'utf8')) h = Math.imul(h ^ byte, 0x01000193) >>> 0;
  return `$fnv$${parts[2]}$${h.toString(16).padStart(8, '0')}`;
}

/** Stand-in for db.session plus the database tables. */
class Session {
  constructor() {
    Object.assign(this, { committed: [], pending: [], log: [] });
  }

  add(obj) { this.pending.push(['add', obj]); }

  delete(obj) {
    if (!this.committed.includes(obj)) throw new InvalidRequestError(`Instance ${obj.constructor.name} is not persisted`);
    this.pending.push(['delete', obj]);
  }

  commit() {
    const rows = this.committed.filter((r) => !this.pending.some(([op, p]) => op === 'delete' && p === r));
    for (const [operation, obj] of this.pending) {
      if (operation !== 'add') continue;
      const others = rows.filter((r) => r.constructor === obj.constructor && r !== obj);
      for (const column of obj.constructor.REQUIRED) {
        if (obj[column] === null) throw new IntegrityError(`NOT NULL constraint failed: ${column}`);
      }
      for (const column of obj.constructor.UNIQUE) {
        if (others.some((r) => r[column] === obj[column])) throw new IntegrityError(`UNIQUE constraint failed: ${column}`);
      }
      rows.push(obj);
    }
    this.committed = rows;
    this.pending = [];
  }

  rollback() { this.pending = []; }

  count(model) { return this.committed.filter((r) => r.constructor === model).length; }
}

/** Active Record base: the record saves and deletes itself through its session. */
class CRUDMixin {
  constructor(session) {
    this.session = session;
  }

  save() {
    try {
      this.session.add(this);
      this.session.commit();
      return this;
    } catch (error) {
      this.session.rollback();
      this.session.log.push(`Failed to save ${this.constructor.name} due to error: ${error.message}`);
      return null;
    }
  }

  delete() {
    try {
      this.session.delete(this);
      this.session.commit();
    } catch (error) {
      this.session.log.push(`Failed to delete '${this.constructor.name}': '${error.message}'`);
    }
  }
}

class User extends CRUDMixin {
  static UNIQUE = ['name', 'email'];

  static REQUIRED = [];

  constructor(session, name, email) {
    super(session);
    Object.assign(this, { name, email, passwordHash: null });
  }

  setPassword(newPassword) { this.passwordHash = hashpw(newPassword, gensalt()); }

  static checkPassword(password, hashedPassword) { return hashpw(password, hashedPassword); }
}

class Role extends CRUDMixin {
  static UNIQUE = ['name'];

  static REQUIRED = ['name'];

  constructor(session, name) {
    super(session);
    Object.assign(this, { name, editSettings: false, viewLogs: false });
  }
}

module.exports = { IntegrityError, InvalidRequestError, gensalt, hashpw, Session, CRUDMixin, User, Role };
