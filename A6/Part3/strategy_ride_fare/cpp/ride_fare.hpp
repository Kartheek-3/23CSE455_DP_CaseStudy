// Strategy pattern: ride fare per ride type (mirrors Part2 src/domain/pricing/FareStrategy.ts).
#pragma once
#include <algorithm>
#include <cmath>
#include <map>
#include <memory>
#include <stdexcept>
#include <string>

struct Trip {
    std::string rideType;
    double km = 0;
    int days = 0;
    double hours = 0;
};

class FareError : public std::runtime_error {
public:
    explicit FareError(const std::string& code) : std::runtime_error(code), code(code) {}
    std::string code;
};

class FareStrategy {
public:
    virtual ~FareStrategy() = default;
    virtual long calculate(const Trip& trip) const = 0;
};

class OneWayFare : public FareStrategy {
public:
    long calculate(const Trip& t) const override {
        if (t.km <= 0) throw FareError("INVALID_INPUT");
        return std::lround(std::max(450.0, t.km * 10));
    }
};

class RoundTripFare : public FareStrategy {
public:
    long calculate(const Trip& t) const override {
        if (t.days < 1) throw FareError("INVALID_INPUT");
        return t.days * 1000L;
    }
};

class HourlyFare : public FareStrategy {
public:
    long calculate(const Trip& t) const override {
        if (t.hours <= 0) throw FareError("INVALID_INPUT");
        return std::max(4L, static_cast<long>(std::ceil(t.hours))) * 200L;
    }
};

class OutstationFare : public FareStrategy {
public:
    long calculate(const Trip& t) const override {
        if (t.km <= 0 || t.days < 1) throw FareError("INVALID_INPUT");
        return std::lround(t.km * 12 + t.days * 300);
    }
};

// Context: registry of strategies keyed by ride type; owns its strategies.
class FareCalculator {
public:
    FareCalculator() {
        registerStrategy("ONE_WAY", std::make_unique<OneWayFare>());
        registerStrategy("ROUND_TRIP", std::make_unique<RoundTripFare>());
        registerStrategy("HOURLY", std::make_unique<HourlyFare>());
        registerStrategy("OUTSTATION", std::make_unique<OutstationFare>());
    }

    void registerStrategy(const std::string& rideType, std::unique_ptr<FareStrategy> strategy) {
        strategies_[rideType] = std::move(strategy);
    }

    long calculate(const Trip& trip) const {
        auto it = strategies_.find(trip.rideType);
        if (it == strategies_.end()) throw FareError("UNKNOWN_RIDE_TYPE");
        return it->second->calculate(trip);
    }

private:
    std::map<std::string, std::unique_ptr<FareStrategy>> strategies_;
};
