#pragma once
#include <memory>
#include <stdexcept>
#include <string>

struct NoPolicy : std::runtime_error { NoPolicy() : std::runtime_error("no policy") {} };

struct AccountPolicy {                           // Strategy
    virtual ~AccountPolicy() = default;
    virtual double bonusOnDeposit(double amount) const = 0;
    virtual bool allowsWithdrawal(double balance, double amount) const = 0;
};

struct SavingsPolicy : AccountPolicy {           // ConcreteStrategy
    double bonusOnDeposit(double) const override { return 0.5; }
    bool allowsWithdrawal(double balance, double amount) const override { return amount <= balance; }
};

struct CheckingPolicy : AccountPolicy {          // ConcreteStrategy
    static constexpr double OVERDRAFT_LIMIT = 500.0;
    double bonusOnDeposit(double) const override { return 0.0; }
    bool allowsWithdrawal(double balance, double amount) const override { return balance - amount >= -OVERDRAFT_LIMIT; }
};

struct PolicyResolver {                          // StrategySelector
    std::unique_ptr<AccountPolicy> forType(const std::string& kind) const {
        if (kind == "S") return std::make_unique<SavingsPolicy>();
        if (kind == "C") return std::make_unique<CheckingPolicy>();
        throw NoPolicy();
    }
};

class Account {                                  // Context: delegates the type-specific rules to the strategy
    std::unique_ptr<AccountPolicy> policy_;
public:
    double balance;
    Account(double b, std::unique_ptr<AccountPolicy> p) : policy_(std::move(p)), balance(b) {}
    void deposit(double amount) { balance += amount + policy_->bonusOnDeposit(amount); }
    bool withdraw(double amount) {
        if (amount <= 0 || !policy_->allowsWithdrawal(balance, amount)) return false;
        balance -= amount;
        return true;
    }
};
