#pragma once
#include <string>
#include <vector>

struct Response { int status; std::string message; };

class BankApi {                                 // what the Delegate (service layer) offers to the controller
public:
    virtual ~BankApi() = default;
    virtual void create(long userId, const std::string& kind, double balance) = 0;
    virtual void deposit(long accountId, double amount) = 0;
    virtual void withdraw(long accountId, double amount) = 0;
    virtual std::vector<long> listAll() = 0;
};

class AccountController {                       // GRASP Controller: receives the system event, no business rules
    BankApi& service_;
public:
    explicit AccountController(BankApi& s) : service_(s) {}
    Response create(long userId, const std::string& kind, double balance) { service_.create(userId, kind, balance); return {201, "Account created"}; }
    Response deposit(long accountId, double amount) { service_.deposit(accountId, amount); return {200, "Deposit done"}; }
    Response withdraw(long accountId, double amount) { service_.withdraw(accountId, amount); return {200, "Withdraw done"}; }
    Response list() { return {200, std::to_string(service_.listAll().size())}; }
};
