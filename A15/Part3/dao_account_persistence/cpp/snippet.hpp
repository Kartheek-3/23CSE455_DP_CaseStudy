#pragma once
#include <map>
#include <stdexcept>
#include <vector>

struct NotFound : std::runtime_error {
    NotFound() : std::runtime_error("not found") {}
};

struct Account {                                   // TransferObject
    long id;
    double balance;
};

class AccountDao {                                 // DataAccessObject (abstraction: find + list only, as in DAO<T>)
public:
    virtual ~AccountDao() = default;
    virtual const Account& findById(long id) const = 0;
    virtual std::vector<Account> getAll() const = 0;
};

class InMemoryAccountDao : public AccountDao {     // ConcreteDAO (save exists only on the concrete class)
    std::map<long, Account> rows_;
    long next_ = 1;
public:
    const Account& findById(long id) const override {
        auto it = rows_.find(id);
        if (it == rows_.end()) throw NotFound();
        return it->second;
    }
    long save(double balance) {
        rows_[next_] = Account{next_, balance};
        return next_++;
    }
    std::vector<Account> getAll() const override {
        std::vector<Account> out;
        for (const auto& kv : rows_) out.push_back(kv.second);
        return out;
    }
};

class AccountService {                             // BusinessObject: never touches storage directly
    InMemoryAccountDao& dao_;
public:
    explicit AccountService(InMemoryAccountDao& dao) : dao_(dao) {}
    long open(double balance) { return dao_.save(balance); }
    double balanceOf(long id) const { return dao_.findById(id).balance; }
    std::vector<double> balances() const {
        std::vector<double> out;
        for (const auto& a : dao_.getAll()) out.push_back(a.balance);
        return out;
    }
};
