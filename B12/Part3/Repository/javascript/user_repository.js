'use strict';

// Repository pattern (architectural, data-access) -- in-memory User repository.
// Production snippet. Tests live in test_repository.js.

class User {
  constructor(id, name) {
    this.id = id;
    this.name = name;
  }
}

class UserRepository {
  save(user) {
    throw new Error('save() not implemented');
  }
  findById(id) {
    throw new Error('findById() not implemented');
  }
  findAll() {
    throw new Error('findAll() not implemented');
  }
  deleteById(id) {
    throw new Error('deleteById() not implemented');
  }
}

class InMemoryUserRepository extends UserRepository {
  constructor() {
    super();
    this.store = new Map();
  }
  save(user) {
    this.store.set(user.id, user);
    return user;
  }
  findById(id) {
    return this.store.has(id) ? this.store.get(id) : null;
  }
  findAll() {
    return [...this.store.values()];
  }
  deleteById(id) {
    return this.store.delete(id);
  }
}

class UserService {
  constructor(repository) {
    this.repository = repository;
  }
  register(user) {
    return this.repository.save(user);
  }
  get(id) {
    return this.repository.findById(id);
  }
  all() {
    return this.repository.findAll();
  }
  remove(id) {
    return this.repository.deleteById(id);
  }
}

module.exports = { User, UserRepository, InMemoryUserRepository, UserService };
