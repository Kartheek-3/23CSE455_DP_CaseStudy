class NoUser extends Error {}
class NotFound extends Error {}

class UserRepo {                               // Collaborator
  constructor() { this.ids = new Set(); }
  add(id) { this.ids.add(id); }
  require(id) { if (!this.ids.has(id)) throw new NoUser(String(id)); }
}

class AccountRepo {                            // Collaborator
  constructor() { this.rows = []; }
  save(userId, balance) { this.rows.push({ userId, balance }); return this.rows.length; }
  get(id) {
    if (id < 1 || id > this.rows.length) throw new NotFound(String(id));
    return this.rows[id - 1].balance;
  }
}

class BankService {                            // ServiceLayer: one boundary that coordinates the use cases
  constructor(users, accounts) { this.users = users; this.accounts = accounts; }
  createUser(id) { this.users.add(id); }
  openAccount(userId, balance) {
    this.users.require(userId);                // use case: look up the owner first,
    return this.accounts.save(userId, balance); // then store the account
  }
  balance(accountId) { return this.accounts.get(accountId); }
}

module.exports = { BankService, UserRepo, AccountRepo, NoUser, NotFound };
