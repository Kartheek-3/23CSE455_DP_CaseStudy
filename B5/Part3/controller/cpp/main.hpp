#ifndef CONTROLLER_TRIP_CREATION_HPP
#define CONTROLLER_TRIP_CREATION_HPP
#include <string>
#include <vector>

struct Trip {
    std::string id, title, startDate, endDate;
};
struct TripMember {
    std::string tripId, travelerId, role;
};
class Account {
public:
    std::string userId, ownerTravelerId;
    std::vector<TripMember> memberships;
    Account(std::string user, std::string traveler);
    void addMembership(const TripMember& member);
};
class TripStore {
public:
    std::vector<Trip> trips;
    void add(const Trip& trip);
};
class CoverTaskQueue {
public:
    std::vector<std::string> tripIds;
    void enqueue(const std::string& tripId);
};
class TripCreationController {
    Account& account;
    TripStore& store;
    CoverTaskQueue& coverTasks;
public:
    TripCreationController(Account& account, TripStore& store, CoverTaskQueue& coverTasks);
    std::string create(const std::string& caseId, const std::string& title,
                       const std::string& start, const std::string& end);
};
#endif
