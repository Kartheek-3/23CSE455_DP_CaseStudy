// Strategy pattern: ride fare per ride type (mirrors Part2 src/domain/pricing/FareStrategy.ts).

export class FareError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

export class OneWayFare {
  calculate(trip) {
    if (!(trip.km > 0)) throw new FareError("INVALID_INPUT");
    return Math.round(Math.max(450, trip.km * 10));
  }
}

export class RoundTripFare {
  calculate(trip) {
    if (!(trip.days >= 1)) throw new FareError("INVALID_INPUT");
    return trip.days * 1000;
  }
}

export class HourlyFare {
  calculate(trip) {
    if (!(trip.hours > 0)) throw new FareError("INVALID_INPUT");
    return Math.max(4, Math.ceil(trip.hours)) * 200;
  }
}

export class OutstationFare {
  calculate(trip) {
    if (!(trip.km > 0) || !(trip.days >= 1)) throw new FareError("INVALID_INPUT");
    return Math.round(trip.km * 12 + trip.days * 300);
  }
}

// Context: registry of strategies keyed by ride type.
export class FareCalculator {
  #strategies = new Map();

  constructor() {
    this.register("ONE_WAY", new OneWayFare());
    this.register("ROUND_TRIP", new RoundTripFare());
    this.register("HOURLY", new HourlyFare());
    this.register("OUTSTATION", new OutstationFare());
  }

  register(rideType, strategy) {
    this.#strategies.set(rideType, strategy);
  }

  calculate(trip) {
    const strategy = this.#strategies.get(trip.rideType);
    if (!strategy) throw new FareError("UNKNOWN_RIDE_TYPE");
    return strategy.calculate(trip);
  }
}
