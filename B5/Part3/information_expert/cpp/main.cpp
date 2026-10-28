#include "main.hpp"
#include <algorithm>
#include <cctype>
#include <utility>

static std::string trim(const std::string& value) {
    const auto first = value.find_first_not_of(" \t\r\n");
    if (first == std::string::npos) return "";
    const auto last = value.find_last_not_of(" \t\r\n");
    return value.substr(first, last - first + 1);
}
static std::string asciiLower(std::string value) {
    std::transform(value.begin(), value.end(), value.begin(), [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    return value;
}
InboxItem::InboxItem(std::string inboxId, std::string currentTripId,
                     std::string provider, std::string reference)
    : id(std::move(inboxId)), tripId(std::move(currentTripId)),
      providerName(std::move(provider)), incomingReference(std::move(reference)) {}
bool InboxItem::missing(const std::string& value) {
    const std::string cleaned = trim(value);
    return cleaned.empty() || cleaned == "~";
}
std::string InboxItem::display(const std::string& value) {
    return missing(value) ? "~" : trim(value);
}
LinkResult InboxItem::linkOrCreateTripItem(Trip& trip, const std::string& caseId) const {
    const std::string name = display(providerName);
    if (name == "~") return {"ERROR", nullptr, "MISSING_PROVIDER"};
    for (auto& item : trip.items) {
        if (item.tripId == tripId && asciiLower(trim(item.name)) == asciiLower(name)) {
            if (missing(item.confirmationRef)) item.confirmationRef = display(incomingReference);
            if (missing(item.inboxId)) item.inboxId = id;
            return {"LINKED", &item, ""};
        }
    }
    trip.items.push_back({"item-" + caseId, tripId, name, display(incomingReference), id, "confirmed"});
    return {"CREATED", &trip.items.back(), ""};
}
std::string InboxReviewController::review(const InboxItem& inbox, Trip& trip,
                                         const std::string& caseId) const {
    const LinkResult result = inbox.linkOrCreateTripItem(trip, caseId);
    if (result.action == "ERROR") return caseId + "\tERROR\t" + result.error;
    const TripItem& item = *result.item;
    return caseId + "\t" + result.action + "\t" + item.id + "\t" + trim(item.name)
        + "\t" + InboxItem::display(item.confirmationRef) + "\t" + InboxItem::display(item.inboxId);
}
