#pragma once
#include <map>
#include <stdexcept>
#include <string>

struct BadRequest : std::runtime_error { BadRequest() : std::runtime_error("bad request") {} };
struct NotFound : std::runtime_error { NotFound() : std::runtime_error("not found") {} };

struct Row {                                    // RowData: data only, no behaviour (anemic)
    std::string kind;
    double balance;
};

class AccountScripts {                          // host of the TransactionScripts: one procedure per use case
    std::map<long, Row> rows_;
    long next_ = 1;
    Row& find(long id) {
        auto it = rows_.find(id);
        if (it == rows_.end()) throw NotFound();
        return it->second;
    }
public:
    long open(const std::string& kind, double balance) { rows_[next_] = Row{kind, balance}; return next_++; }

    double deposit(long id, double amount) {    // script: all rules are inline
        Row& row = find(id);
        if (amount > 0) {
            double newBalance = row.balance + amount;
            if (row.kind == "S") newBalance += 0.5;
            row.balance = newBalance;
            return newBalance;
        }
        throw BadRequest();
    }

    double withdraw(long id, double amount) {   // script: all rules are inline
        Row& row = find(id);
        if (amount > 0 && row.balance > amount) {
            row.balance -= amount;
            return row.balance;
        }
        throw BadRequest();
    }
};
