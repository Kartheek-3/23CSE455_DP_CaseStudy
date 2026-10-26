#ifndef OBSERVER_MAIL_MAIN_HPP
#define OBSERVER_MAIL_MAIN_HPP

#include <string>
#include <vector>

struct MailMessage {
    std::string messageId;
    std::string subject;
    std::string recipient;
};

class MailObserver {
public:
    virtual ~MailObserver() = default;
    virtual void onDelivered(const MailMessage& message) = 0;
};

class MailLogger final : public MailObserver {
public:
    void onDelivered(const MailMessage& message) override;
    const std::vector<MailMessage>& received() const;
private:
    std::vector<MailMessage> messages_;
};

class MailDeliveryPublisher {
public:
    void registerObserver(MailObserver& observer);
    void unregisterObserver(MailObserver& observer);
    void deliver(const MailMessage& message, bool delivered);
private:
    std::vector<MailObserver*> observers_;
};

#endif
