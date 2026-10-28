class EntityNotFound extends Error {
  constructor() { super('EntityNotFound'); }
}

// Stands in for TypeORM's Repository<T>: the persistence side.
class InMemoryRepository {
  constructor() {
    this.rows = [];
    this.lastId = 0;
  }

  insert(entity) {
    this.lastId++;
    this.rows.push({ ...entity, id: String(this.lastId) });
    return { id: String(this.lastId) };
  }

  findOneBy(criteria) {
    return this.rows.find(row => Object.entries(criteria).every(([k, v]) => row[k] === v)) ?? null;
  }

  findOneOrFail(criteria) {
    const row = this.findOneBy(criteria);
    if (row === null) throw new EntityNotFound();
    return row;
  }

  count() { return this.rows.length; }
}

// Misskey's extension: insert, then read the stored row back (miRepository.insertOne).
const miRepository = {
  insertOne(entity) {
    const identifiers = this.insert(entity);
    return this.findOneOrFail(identifiers);
  },
};

// Like db.getRepository(...).extend(miRepository) in the source.
function extend(repository, extension) {
  return Object.assign(repository, extension);
}

class UserService {
  constructor(usersRepository) { this.users = usersRepository; }
  register(name) { return this.users.insertOne({ name }); }
  findByName(name) { return this.users.findOneBy({ name }); }
  getByName(name) { return this.users.findOneOrFail({ name }); }
  count() { return this.users.count(); }
}

module.exports = { InMemoryRepository, miRepository, extend, UserService };
