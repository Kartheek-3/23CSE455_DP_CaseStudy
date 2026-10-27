class NotFound extends Error {}

class Account {                              // TransferObject
  constructor(id, balance) { this.id = id; this.balance = balance; }
}

class AccountDao {                           // DataAccessObject (abstraction: find + list only, as in DAO<T>)
  findById(id) { throw new Error('abstract'); }
  getAll() { throw new Error('abstract'); }
}

class InMemoryAccountDao extends AccountDao { // ConcreteDAO (save exists only on the concrete class)
  constructor() { super(); this.rows = new Map(); this.next = 1; }
  findById(id) {
    if (!this.rows.has(id)) throw new NotFound(String(id));
    return this.rows.get(id);
  }
  save(balance) {
    const account = new Account(this.next, balance);
    this.rows.set(account.id, account);
    this.next += 1;
    return account.id;
  }
  getAll() { return [...this.rows.values()]; }
}

class AccountService {                       // BusinessObject: never touches storage directly
  constructor(dao) { this.dao = dao; }
  open(balance) { return this.dao.save(balance); }
  balanceOf(id) { return this.dao.findById(id).balance; }
  balances() { return this.dao.getAll().map((a) => a.balance); }
}

module.exports = { NotFound, AccountService, InMemoryAccountDao };
