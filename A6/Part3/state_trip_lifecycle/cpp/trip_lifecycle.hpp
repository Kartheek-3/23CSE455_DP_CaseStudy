// State pattern: trip lifecycle (mirrors Part2 src/domain/booking/TripState.ts).
#pragma once
#include <memory>
#include <stdexcept>
#include <string>

class InvalidTransition : public std::runtime_error {
public:
    InvalidTransition(const std::string& event, const std::string& state)
        : std::runtime_error("INVALID_TRANSITION: cannot " + event + " when " + state) {}
};

// Base state: every event is refused unless a concrete state overrides it.
class TripState {
public:
    virtual ~TripState() = default;
    virtual std::string name() const = 0;
    virtual std::unique_ptr<TripState> accept() const { refuse("accept"); }
    virtual std::unique_ptr<TripState> complete() const { refuse("complete"); }
    virtual std::unique_ptr<TripState> cancel() const { refuse("cancel"); }
    virtual std::unique_ptr<TripState> reject() const { refuse("reject"); }
    virtual std::unique_ptr<TripState> expire() const { refuse("expire"); }

protected:
    [[noreturn]] void refuse(const std::string& event) const { throw InvalidTransition(event, name()); }
};

// COMPLETED, CANCELLED, REJECTED and EXPIRED accept no events.
class Finished : public TripState {
public:
    explicit Finished(std::string name) : name_(std::move(name)) {}
    std::string name() const override { return name_; }

private:
    std::string name_;
};

class Confirmed : public TripState {
public:
    std::string name() const override { return "CONFIRMED"; }
    std::unique_ptr<TripState> complete() const override { return std::make_unique<Finished>("COMPLETED"); }
    std::unique_ptr<TripState> cancel() const override { return std::make_unique<Finished>("CANCELLED"); }
    std::unique_ptr<TripState> reject() const override { return std::make_unique<Finished>("REJECTED"); }
};

class Pending : public TripState {
public:
    std::string name() const override { return "PENDING"; }
    std::unique_ptr<TripState> accept() const override { return std::make_unique<Confirmed>(); }
    std::unique_ptr<TripState> cancel() const override { return std::make_unique<Finished>("CANCELLED"); }
    std::unique_ptr<TripState> reject() const override { return std::make_unique<Finished>("REJECTED"); }
    std::unique_ptr<TripState> expire() const override { return std::make_unique<Finished>("EXPIRED"); }
};

// Context: owns its current state object.
class Trip {
public:
    Trip() : state_(std::make_unique<Pending>()) {}

    std::string status() const { return state_->name(); }

    void apply(const std::string& event) {
        if (event == "accept") state_ = state_->accept();
        else if (event == "complete") state_ = state_->complete();
        else if (event == "cancel") state_ = state_->cancel();
        else if (event == "reject") state_ = state_->reject();
        else if (event == "expire") state_ = state_->expire();
        else throw std::invalid_argument("unknown event " + event);
    }

private:
    std::unique_ptr<TripState> state_;
};
