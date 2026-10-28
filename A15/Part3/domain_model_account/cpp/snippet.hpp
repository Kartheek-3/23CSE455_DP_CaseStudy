#pragma once
#include <map>
#include <stdexcept>
#include <string>

struct BadRequest : std::runtime_error { BadRequest() : std::runtime_error("bad request") {} };
struct NotFound : std::runtime_error { NotFound() : std::runtime_error("not found") {} };

class Account {                                  // DomainObject: data AND the rules that protect it
    static constexpr double OVERDRAFT_LIMIT = 500.0;
    std::string kind_;
    double balance_;
public:
    Account() : balance_(0) {}
    Account(std::string kind, double balance) : kind_(std::move(kind)), balance_(balance) {}
    double balance() const { return balance_; }

    void deposit(double amount) {
        if (amount <= 0) throw BadRequest();
        balance_ += amount + (kind_ == "S" ? 0.5 : 0.0);
    }

    void withdraw(double amount) {
        bool allowed = kind_ == "C" ? balance_ - amount >= -OVERDRAFT_LIMIT : amount <= balance_;
        if (amount <= 0 || !allowed) throw BadRequest();
        balance_ -= amount;
    }

    void credit(double amount) {
        if (amount <= 0) throw BadRequest();
        balance_ += amount;
    }
};

class Bank {                                     // Orchestrator: loads, calls the domain object, nothing more
    std::map<long, Account> accounts_;
    long next_ = 1;
    Account& find(long id) {
        auto it = accounts_.find(id);
        if (it == accounts_.end()) throw NotFound();
        return it->second;
    }
public:
    long open(const std::string& kind, double balance) { accounts_[next_] = Account(kind, balance); return next_++; }
    double deposit(long id, double amount) { Account& a = find(id); a.deposit(amount); return a.balance(); }
    double withdraw(long id, double amount) { Account& a = find(id); a.withdraw(amount); return a.balance(); }
    void transfer(long fromId, long toId, double amount) {
        if (fromId == toId || amount <= 0) throw BadRequest();
        Account& source = find(fromId);
        Account& target = find(toId);
        source.withdraw(amount);                 // throws before anything is changed
        target.credit(amount);
    }
    double balance(long id) { return find(id).balance(); }
};
