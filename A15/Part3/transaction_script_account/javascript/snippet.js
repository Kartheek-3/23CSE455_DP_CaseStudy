class BadRequest extends Error {}
class NotFound extends Error {}

class AccountScripts {                          // host of the TransactionScripts: one procedure per use case
  constructor() { this.rows = new Map(); this.next = 1; }
  open(kind, balance) { this.rows.set(this.next, { kind, balance }); return this.next++; }  // row = data only (anemic)
  find(id) {
    if (!this.rows.has(id)) throw new NotFound(String(id));
    return this.rows.get(id);
  }
  deposit(id, amount) {                         // script: all rules are inline
    const row = this.find(id);
    if (amount > 0) {
      let newBalance = row.balance + amount;
      if (row.kind === 'S') newBalance += 0.5;
      row.balance = newBalance;
      return newBalance;
    }
    throw new BadRequest();
  }
  withdraw(id, amount) {                        // script: all rules are inline
    const row = this.find(id);
    if (amount > 0 && row.balance > amount) { row.balance -= amount; return row.balance; }
    throw new BadRequest();
  }
}

module.exports = { AccountScripts, BadRequest, NotFound };
