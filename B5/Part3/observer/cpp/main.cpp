#include "main.hpp"
#include <algorithm>
#include <cctype>
#include <stdexcept>

void MailLogger::onDelivered(const MailMessage& message) {
    messages_.push_back(message);
}

const std::vector<MailMessage>& MailLogger::received() const {
    return messages_;
}

void MailDeliveryPublisher::registerObserver(MailObserver& observer) {
    if (std::find(observers_.begin(), observers_.end(), &observer) == observers_.end()) {
        observers_.push_back(&observer);
    }
}

void MailDeliveryPublisher::unregisterObserver(MailObserver& observer) {
    observers_.erase(std::remove(observers_.begin(), observers_.end(), &observer), observers_.end());
}

void MailDeliveryPublisher::deliver(const MailMessage& message, bool delivered) {
    if (!delivered) {
        return;
    }
    if (std::all_of(message.recipient.begin(), message.recipient.end(),
                    [](unsigned char ch) { return std::isspace(ch) != 0; })) {
        throw std::invalid_argument("INVALID_RECIPIENT");
    }
    for (MailObserver* observer : observers_) {
        observer->onDelivered(message);
    }
}
