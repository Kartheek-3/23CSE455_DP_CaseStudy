#ifndef INFORMATION_EXPERT_MAIN_HPP
#define INFORMATION_EXPERT_MAIN_HPP
#include <string>
#include <vector>

struct TripItem {
    std::string id;
    std::string tripId;
    std::string name;
    std::string confirmationRef;
    std::string inboxId;
    std::string status;
};
struct Trip {
    std::string id;
    std::vector<TripItem> items;
};
struct LinkResult {
    std::string action;
    TripItem* item;
    std::string error;
};
class InboxItem {
public:
    std::string id;
    std::string tripId;
    std::string providerName;
    std::string incomingReference;
    InboxItem(std::string id, std::string tripId, std::string providerName, std::string incomingReference);
    LinkResult linkOrCreateTripItem(Trip& trip, const std::string& caseId) const;
    static bool missing(const std::string& text);
    static std::string display(const std::string& text);
};
class InboxReviewController {
public:
    std::string review(const InboxItem& inbox, Trip& trip, const std::string& caseId) const;
};
#endif
