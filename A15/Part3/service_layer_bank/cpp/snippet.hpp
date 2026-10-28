#pragma once
#include <set>
#include <stdexcept>
#include <vector>

struct NoUser : std::runtime_error { NoUser() : std::runtime_error("no user") {} };
struct NotFound : std::runtime_error { NotFound() : std::runtime_error("not found") {} };

class UserRepo {                               // Collaborator
    std::set<long> ids_;
public:
    void add(long id) { ids_.insert(id); }
    void require(long id) const { if (!ids_.count(id)) throw NoUser(); }
};

class AccountRepo {                            // Collaborator
    std::vector<double> balances_;
public:
    long save(long, double balance) { balances_.push_back(balance); return static_cast<long>(balances_.size()); }
    double get(long id) const {
        if (id < 1 || id > static_cast<long>(balances_.size())) throw NotFound();
        return balances_[id - 1];
    }
};

class BankService {                            // ServiceLayer: one boundary that coordinates the use cases
    UserRepo& users_;
    AccountRepo& accounts_;
public:
    BankService(UserRepo& u, AccountRepo& a) : users_(u), accounts_(a) {}
    void createUser(long id) { users_.add(id); }
    long openAccount(long userId, double balance) {
        users_.require(userId);                // use case: look up the owner first,
        return accounts_.save(userId, balance); // then store the account
    }
    double balance(long accountId) const { return accounts_.get(accountId); }
};
