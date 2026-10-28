class BadRequest extends Error {}
class NotFound extends Error {}

class Account {                                  // DomainObject: data AND the rules that protect it
  constructor(kind, balance) { this.kind = kind; this.balance = balance; }
  deposit(amount) {
    if (amount <= 0) throw new BadRequest();
    this.balance += amount + (this.kind === 'S' ? 0.5 : 0.0);
  }
  withdraw(amount) {
    const allowed = this.kind === 'C' ? this.balance - amount >= -500.0 : amount <= this.balance;
    if (amount <= 0 || !allowed) throw new BadRequest();
    this.balance -= amount;
  }
  credit(amount) {
    if (amount <= 0) throw new BadRequest();
    this.balance += amount;
  }
}

class Bank {                                     // Orchestrator: loads, calls the domain object, nothing more
  constructor() { this.accounts = new Map(); this.next = 1; }
  open(kind, balance) { this.accounts.set(this.next, new Account(kind, balance)); return this.next++; }
  find(id) {
    if (!this.accounts.has(id)) throw new NotFound(String(id));
    return this.accounts.get(id);
  }
  deposit(id, amount) { const a = this.find(id); a.deposit(amount); return a.balance; }
  withdraw(id, amount) { const a = this.find(id); a.withdraw(amount); return a.balance; }
  transfer(fromId, toId, amount) {
    if (fromId === toId || amount <= 0) throw new BadRequest();
    const source = this.find(fromId), target = this.find(toId);
    source.withdraw(amount);                     // throws before anything is changed
    target.credit(amount);
  }
  balance(id) { return this.find(id).balance; }
}

module.exports = { Bank, BadRequest, NotFound };
