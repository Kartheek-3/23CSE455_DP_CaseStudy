#pragma once
#include <functional>
#include <stdexcept>
#include <string>

struct HttpError : std::runtime_error {          // TranslatedException (base): carries the HTTP status and a message
    int status;
    HttpError(int s, const std::string& m) : std::runtime_error(m), status(s) {}
};
struct BadRequest : HttpError { explicit BadRequest(const std::string& m) : HttpError(400, m) {} };
struct NotFound : HttpError { explicit NotFound(const std::string& m) : HttpError(404, m) {} };

struct AccountService {                          // Raiser
    std::string deposit(double amount) const {
        if (amount <= 0) throw BadRequest("Deposit must be positive");
        return "ok";
    }
    std::string find(long id) const {
        if (id != 1) throw NotFound("Account not found");
        return "account 1";
    }
    std::string boom() const { throw std::logic_error("unexpected"); }
};

inline std::string translate(const std::function<std::string()>& action) {   // Translator
    try {
        return "200 " + action();
    } catch (const HttpError& e) {
        return std::to_string(e.status) + " " + e.what();
    } catch (const std::exception&) {
        return "500 Internal error";
    }
}
