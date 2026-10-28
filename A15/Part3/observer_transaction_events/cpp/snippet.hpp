#pragma once
#include <cstdio>
#include <map>
#include <stdexcept>
#include <string>
#include <vector>

struct BadRequest : std::runtime_error { BadRequest() : std::runtime_error("bad request") {} };

struct Event {                                   // Event (what is published)
    std::string kind; long accountId; double amount;
};

struct Observer {
    virtual ~Observer() = default;
    virtual void onEvent(const Event& e) = 0;
};

class EventPublisher {                           // SubjectChannel: keeps the observers, knows none by type
    std::vector<Observer*> observers_;
public:
    void subscribe(Observer* o) { observers_.push_back(o); }
    void publish(const Event& e) { for (auto* o : observers_) o->onEvent(e); }
};

class AccountService {                           // Subject: publishes after a valid operation
    EventPublisher& publisher_;
    void apply(const std::string& kind, long id, double amount) {
        if (amount <= 0) throw BadRequest();     // failed operations publish nothing
        publisher_.publish(Event{kind, id, amount});
    }
public:
    explicit AccountService(EventPublisher& p) : publisher_(p) {}
    void deposit(long id, double amount) { apply("DEPOSIT", id, amount); }
    void withdraw(long id, double amount) { apply("WITHDRAWAL", id, amount); }
};

inline std::string money(double v) { char b[64]; std::snprintf(b, sizeof b, "%.2f", v); return b; }

class AuditLog : public Observer {               // ConcreteObserver
    std::map<long, std::vector<Event>> entries_;
public:
    void onEvent(const Event& e) override { entries_[e.accountId].push_back(e); }
    std::string text(long id) const {
        std::string out;
        auto it = entries_.find(id);
        if (it != entries_.end())
            for (const auto& e : it->second) out += (out.empty() ? "" : ",") + e.kind + ":" + money(e.amount);
        return out.empty() ? "-" : out;
    }
};

class HighValueAlert : public Observer {         // ConcreteObserver
    static constexpr double THRESHOLD = 10000.0;
    std::vector<Event> alerts_;
public:
    void onEvent(const Event& e) override { if (e.amount >= THRESHOLD) alerts_.push_back(e); }
    std::string text() const {
        std::string out;
        for (const auto& e : alerts_) out += (out.empty() ? "" : ",") + e.kind + ":" + money(e.amount) + "@" + std::to_string(e.accountId);
        return out.empty() ? "-" : out;
    }
};
