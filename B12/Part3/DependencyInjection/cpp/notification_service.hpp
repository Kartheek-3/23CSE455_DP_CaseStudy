#pragma once

#include <string>

// Dependency Injection pattern -- constructor injection + composition root.
// Production snippet. Tests live in dependency_injection_test.cpp.

class NotificationSender {
public:
    virtual ~NotificationSender() = default;

    virtual std::string channel() const = 0;
    virtual std::string send(const std::string& message) const = 0;
};

class EmailSender : public NotificationSender {
public:
    std::string channel() const override { return "email"; }
    std::string send(const std::string& message) const override {
        return "email:" + message;
    }
};

class SmsSender : public NotificationSender {
public:
    std::string channel() const override { return "sms"; }
    std::string send(const std::string& message) const override {
        return "sms:" + message;
    }
};

class NotificationService {
public:
    explicit NotificationService(const NotificationSender* sender)
        : sender_(sender) {}

    std::string notify(const std::string& message) const {
        return sender_->send(message);
    }

private:
    const NotificationSender* sender_;
};

inline NotificationService buildNotificationService() {
    static EmailSender email;
    return NotificationService(&email);
}
