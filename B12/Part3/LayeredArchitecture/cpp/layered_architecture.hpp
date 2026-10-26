#pragma once

#include <string>
#include <vector>

// Layered Architecture pattern -- presentation/business/data layers with
// downward-only dependencies. Production snippet. Tests live in
// layered_architecture_test.cpp.

struct Reservation {
    int slotId;
    std::string plate;

    Reservation(int slotId_, std::string plate_)
        : slotId(slotId_), plate(std::move(plate_)) {}
};

// Data layer
class ReservationRepository {
public:
    Reservation save(const Reservation& reservation) {
        items_.push_back(reservation);
        return reservation;
    }

    int count() const { return static_cast<int>(items_.size()); }

    const Reservation* findByPlate(const std::string& plate) const {
        for (const auto& item : items_) {
            if (item.plate == plate) {
                return &item;
            }
        }
        return nullptr;
    }

private:
    std::vector<Reservation> items_;
};

// Business layer (depends on the data layer)
class ParkingService {
public:
    explicit ParkingService(ReservationRepository* repository)
        : repository_(repository) {}

    Reservation reserve(int slotId, const std::string& plate) {
        return repository_->save(Reservation(slotId, plate));
    }

    int reservations() const { return repository_->count(); }

private:
    ReservationRepository* repository_;
};

// Presentation layer (depends on the business layer)
class ParkingController {
public:
    explicit ParkingController(ParkingService* service) : service_(service) {}

    std::string postReservation(int slotId, const std::string& plate) {
        if (slotId <= 0) {
            return "ERR:invalid-slot";
        }
        service_->reserve(slotId, plate);
        return "OK:" + std::to_string(slotId) + ":" + plate;
    }

private:
    ParkingService* service_;
};
