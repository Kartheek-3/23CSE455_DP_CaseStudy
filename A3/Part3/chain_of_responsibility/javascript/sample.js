class Rule {
  constructor(next = null) { this.next = next; }
  allows(amount, balance) {
    return this.accepts(amount, balance) && (this.next === null || this.next.allows(amount, balance));
  }
}
class Positive extends Rule { accepts(amount, balance) { return amount > 0; } }
class Funds extends Rule { accepts(amount, balance) { return amount <= balance; } }
class HighValue extends Rule {
  constructor(limit, next = null) {
    super(next);
    if (limit <= 0) throw Error("positive limit required");
    this.limit = limit;
  }
  accepts(amount, balance) { return amount <= this.limit; }
}
module.exports = {Positive, Funds, HighValue};
