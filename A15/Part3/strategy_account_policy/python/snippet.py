class NoPolicy(Exception):
    pass


class AccountPolicy:                            # Strategy
    def bonus_on_deposit(self, amount):
        raise NotImplementedError

    def allows_withdrawal(self, balance, amount):
        raise NotImplementedError


class SavingsPolicy(AccountPolicy):             # ConcreteStrategy
    def bonus_on_deposit(self, amount):
        return 0.5

    def allows_withdrawal(self, balance, amount):
        return amount <= balance


class CheckingPolicy(AccountPolicy):            # ConcreteStrategy
    OVERDRAFT_LIMIT = 500.0

    def bonus_on_deposit(self, amount):
        return 0.0

    def allows_withdrawal(self, balance, amount):
        return balance - amount >= -self.OVERDRAFT_LIMIT


class PolicyResolver:                           # StrategySelector
    def __init__(self):
        self.policies = {"S": SavingsPolicy(), "C": CheckingPolicy()}

    def for_type(self, kind):
        if kind not in self.policies:
            raise NoPolicy(kind)
        return self.policies[kind]


class Account:                                  # Context: delegates the type-specific rules to the strategy
    def __init__(self, balance, policy):
        self.balance, self.policy = balance, policy

    def deposit(self, amount):
        self.balance += amount + self.policy.bonus_on_deposit(amount)

    def withdraw(self, amount):
        if amount <= 0 or not self.policy.allows_withdrawal(self.balance, amount):
            return False
        self.balance -= amount
        return True
