// State pattern: trip lifecycle (mirrors Part2 src/domain/booking/TripState.ts).

export class InvalidTransition extends Error {}

// Base state: every event is refused unless a concrete state overrides it.
class TripState {
  refuse(event) {
    throw new InvalidTransition(`INVALID_TRANSITION: cannot ${event} when ${this.name}`);
  }
  accept() { return this.refuse("accept"); }
  complete() { return this.refuse("complete"); }
  cancel() { return this.refuse("cancel"); }
  reject() { return this.refuse("reject"); }
  expire() { return this.refuse("expire"); }
}

class Pending extends TripState {
  name = "PENDING";
  accept() { return new Confirmed(); }
  cancel() { return new Finished("CANCELLED"); }
  reject() { return new Finished("REJECTED"); }
  expire() { return new Finished("EXPIRED"); }
}

class Confirmed extends TripState {
  name = "CONFIRMED";
  complete() { return new Finished("COMPLETED"); }
  cancel() { return new Finished("CANCELLED"); }
  reject() { return new Finished("REJECTED"); }
}

// COMPLETED, CANCELLED, REJECTED and EXPIRED accept no events.
class Finished extends TripState {
  constructor(name) {
    super();
    this.name = name;
  }
}

const EVENTS = new Set(["accept", "complete", "cancel", "reject", "expire"]);

// Context.
export class Trip {
  #state = new Pending();

  get status() {
    return this.#state.name;
  }

  apply(event) {
    if (!EVENTS.has(event)) throw new Error(`unknown event ${event}`);
    this.#state = this.#state[event]();
  }
}
