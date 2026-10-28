#pragma once

#include <string>
#include <vector>

// State pattern (GoF, behavioural) -- EV charging session lifecycle.
// Production snippet (header). Tests live in state_test.cpp.

class ChargingSessionState;

class ChargingSession {
public:
    ChargingSession();
    ~ChargingSession();
    ChargingSession(const ChargingSession&) = delete;
    ChargingSession& operator=(const ChargingSession&) = delete;

    void setState(ChargingSessionState* state);
    std::string state() const;
    std::string fail(const std::string& event, const std::string& fromState);

    std::string plugIn();
    std::string startCharge();
    std::string finishCharge();
    std::string removeCable();

    std::vector<std::string> errors;

private:
    ChargingSessionState* state_;
};

class ChargingSessionState {
public:
    virtual ~ChargingSessionState() = default;
    virtual std::string name() const = 0;
    virtual std::string plugIn(ChargingSession& ctx) {
        return ctx.fail("plugIn", name());
    }
    virtual std::string startCharge(ChargingSession& ctx) {
        return ctx.fail("startCharge", name());
    }
    virtual std::string finishCharge(ChargingSession& ctx) {
        return ctx.fail("finishCharge", name());
    }
    virtual std::string removeCable(ChargingSession& ctx) {
        return ctx.fail("removeCable", name());
    }
};

class IdleState : public ChargingSessionState {
public:
    std::string name() const override;
    std::string plugIn(ChargingSession& ctx) override;
};

class PluggedInState : public ChargingSessionState {
public:
    std::string name() const override;
    std::string startCharge(ChargingSession& ctx) override;
    std::string removeCable(ChargingSession& ctx) override;
};

class ChargingActiveState : public ChargingSessionState {
public:
    std::string name() const override;
    std::string finishCharge(ChargingSession& ctx) override;
};

class CompletedState : public ChargingSessionState {
public:
    std::string name() const override;
    std::string removeCable(ChargingSession& ctx) override;
};

inline std::string IdleState::name() const { return "idle"; }
inline std::string IdleState::plugIn(ChargingSession& ctx) {
    ctx.setState(new PluggedInState());
    return "plugged_in";
}

inline std::string PluggedInState::name() const { return "plugged_in"; }
inline std::string PluggedInState::startCharge(ChargingSession& ctx) {
    ctx.setState(new ChargingActiveState());
    return "charging";
}
inline std::string PluggedInState::removeCable(ChargingSession& ctx) {
    ctx.setState(new IdleState());
    return "idle";
}

inline std::string ChargingActiveState::name() const { return "charging"; }
inline std::string ChargingActiveState::finishCharge(ChargingSession& ctx) {
    ctx.setState(new CompletedState());
    return "completed";
}

inline std::string CompletedState::name() const { return "completed"; }
inline std::string CompletedState::removeCable(ChargingSession& ctx) {
    ctx.setState(new IdleState());
    return "idle";
}

inline ChargingSession::ChargingSession() : state_(new IdleState()) {}
inline ChargingSession::~ChargingSession() { delete state_; }
inline void ChargingSession::setState(ChargingSessionState* state) {
    if (state_ != state) {
        delete state_;
        state_ = state;
    }
}
inline std::string ChargingSession::state() const { return state_->name(); }
inline std::string ChargingSession::fail(const std::string& event, const std::string& fromState) {
    errors.push_back(event + "@" + fromState);
    return "error";
}
inline std::string ChargingSession::plugIn() { return state_->plugIn(*this); }
inline std::string ChargingSession::startCharge() { return state_->startCharge(*this); }
inline std::string ChargingSession::finishCharge() { return state_->finishCharge(*this); }
inline std::string ChargingSession::removeCable() { return state_->removeCable(*this); }
