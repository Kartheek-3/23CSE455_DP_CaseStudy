#include "main.hpp"
#include <cctype>
#include <sstream>
#include <utility>

Account::Account(std::string user, std::string traveler)
    : userId(std::move(user)), ownerTravelerId(std::move(traveler)) {}
void Account::addMembership(const TripMember& member) { memberships.push_back(member); }
void TripStore::add(const Trip& trip) { trips.push_back(trip); }
void CoverTaskQueue::enqueue(const std::string& tripId) { tripIds.push_back(tripId); }
TripCreationController::TripCreationController(Account& a, TripStore& s, CoverTaskQueue& q)
    : account(a), store(s), coverTasks(q) {}

namespace {
std::string trim(const std::string& text) {
    const auto first = text.find_first_not_of(" \t\r\n");
    if (first == std::string::npos) return "";
    const auto last = text.find_last_not_of(" \t\r\n");
    return text.substr(first, last - first + 1);
}
bool absent(const std::string& text) { return trim(text).empty() || text == "~"; }
bool leap(int year) { return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0); }
bool validGregorian(const std::string& text) {
    if (text.size() != 10 || text[4] != '-' || text[7] != '-') return false;
    for (size_t i = 0; i < text.size(); ++i) {
        if (i == 4 || i == 7) continue;
        if (!std::isdigit(static_cast<unsigned char>(text[i]))) return false;
    }
    const int year = std::stoi(text.substr(0, 4));
    const int month = std::stoi(text.substr(5, 2));
    const int day = std::stoi(text.substr(8, 2));
    if (year < 1 || month < 1 || month > 12 || day < 1) return false;
    const int days[] = {31, leap(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    return day <= days[month - 1];
}
std::string error(const std::string& caseId, const std::string& code) {
    return caseId + "\tERROR\t" + code;
}
}

std::string TripCreationController::create(const std::string& caseId, const std::string& title,
                                           const std::string& start, const std::string& end) {
    if (absent(account.userId)) return error(caseId, "UNAUTHENTICATED");
    if (absent(account.ownerTravelerId)) return error(caseId, "MISSING_OWNER");
    const std::string cleaned = trim(title);
    if (absent(cleaned)) return error(caseId, "MISSING_TITLE");
    if (!validGregorian(start) || !validGregorian(end)) return error(caseId, "INVALID_DATE");
    if (end < start) return error(caseId, "INVALID_DATE_RANGE");
    const Trip trip{"trip-" + caseId, cleaned, start, end};
    const TripMember membership{trip.id, account.ownerTravelerId, "owner"};
    store.add(trip);
    account.addMembership(membership);
    coverTasks.enqueue(trip.id);
    return caseId + "\tCREATED\t" + trip.id + "\t" + trip.title + "\t" + membership.travelerId
         + "\t" + membership.role + "\tCOVER_QUEUED";
}
