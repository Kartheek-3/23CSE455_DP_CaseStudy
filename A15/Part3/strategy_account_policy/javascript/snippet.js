class NoPolicy extends Error {}

class AccountPolicy {                            // Strategy
  bonusOnDeposit(amount) { throw new Error('abstract'); }
  allowsWithdrawal(balance, amount) { throw new Error('abstract'); }
}

class SavingsPolicy extends AccountPolicy {      // ConcreteStrategy
  bonusOnDeposit() { return 0.5; }
  allowsWithdrawal(balance, amount) { return amount <= balance; }
}

class CheckingPolicy extends AccountPolicy {     // ConcreteStrategy
  bonusOnDeposit() { return 0.0; }
  allowsWithdrawal(balance, amount) { return balance - amount >= -500.0; }
}

class PolicyResolver {                           // StrategySelector
  constructor() { this.policies = { S: new SavingsPolicy(), C: new CheckingPolicy() }; }
  forType(kind) {
    if (!Object.prototype.hasOwnProperty.call(this.policies, kind)) throw new NoPolicy(kind);
    return this.policies[kind];
  }
}

class Account {                                  // Context: delegates the type-specific rules to the strategy
  constructor(balance, policy) { this.balance = balance; this.policy = policy; }
  deposit(amount) { this.balance += amount + this.policy.bonusOnDeposit(amount); }
  withdraw(amount) {
    if (amount <= 0 || !this.policy.allowsWithdrawal(this.balance, amount)) return false;
    this.balance -= amount;
    return true;
  }
}

module.exports = { Account, PolicyResolver, NoPolicy };
