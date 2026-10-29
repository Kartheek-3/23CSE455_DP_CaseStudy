'use strict';

// State pattern (GoF, behavioural) -- EV charging session lifecycle.
// Production snippet. Tests live in test_state.js.

class ChargingSessionState {
  name() {
    throw new Error('name() not implemented');
  }
  plugIn(ctx) {
    return ctx.fail('plugIn', this.name());
  }
  startCharge(ctx) {
    return ctx.fail('startCharge', this.name());
  }
  finishCharge(ctx) {
    return ctx.fail('finishCharge', this.name());
  }
  removeCable(ctx) {
    return ctx.fail('removeCable', this.name());
  }
}

class IdleState extends ChargingSessionState {
  name() {
    return 'idle';
  }
  plugIn(ctx) {
    ctx.setState(new PluggedInState());
    return 'plugged_in';
  }
}

class PluggedInState extends ChargingSessionState {
  name() {
    return 'plugged_in';
  }
  startCharge(ctx) {
    ctx.setState(new ChargingActiveState());
    return 'charging';
  }
  removeCable(ctx) {
    ctx.setState(new IdleState());
    return 'idle';
  }
}

class ChargingActiveState extends ChargingSessionState {
  name() {
    return 'charging';
  }
  finishCharge(ctx) {
    ctx.setState(new CompletedState());
    return 'completed';
  }
}

class CompletedState extends ChargingSessionState {
  name() {
    return 'completed';
  }
  removeCable(ctx) {
    ctx.setState(new IdleState());
    return 'idle';
  }
}

class ChargingSession {
  constructor() {
    this._state = new IdleState();
    this.errors = [];
  }
  setState(state) {
    this._state = state;
  }
  get state() {
    return this._state.name();
  }
  fail(event, from) {
    this.errors.push(event + '@' + from);
    return 'error';
  }
  plugIn() {
    return this._state.plugIn(this);
  }
  startCharge() {
    return this._state.startCharge(this);
  }
  finishCharge() {
    return this._state.finishCharge(this);
  }
  removeCable() {
    return this._state.removeCable(this);
  }
}

module.exports = {
  ChargingSessionState,
  IdleState,
  PluggedInState,
  ChargingActiveState,
  CompletedState,
  ChargingSession,
};
