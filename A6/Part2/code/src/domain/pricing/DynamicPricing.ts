import { FareRequest, FareStrategy } from "./FareStrategy";

/**
 * Decorator: dynamic-pricing rules wrap any FareStrategy and adjust its result,
 * so a rule can be added without touching the ride-type strategies.
 */
export abstract class FareDecorator implements FareStrategy {
  constructor(protected readonly inner: FareStrategy) {}

  get extraKmRate(): number {
    return this.inner.extraKmRate;
  }

  abstract calculate(request: FareRequest): number;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const istHour = (date: Date) => new Date(new Date(date).getTime() + IST_OFFSET_MS).getUTCHours();

/** +25% when the ride starts 08:00-10:59 or 17:00-20:59 IST. */
export class PeakHourSurcharge extends FareDecorator {
  static readonly MULTIPLIER = 1.25;
  calculate(request: FareRequest): number {
    const fare = this.inner.calculate(request);
    const hour = istHour(request.startDate);
    const peak = (hour >= 8 && hour < 11) || (hour >= 17 && hour < 21);
    return peak ? Math.round(fare * PeakHourSurcharge.MULTIPLIER) : fare;
  }
}

/** +20% when fewer than 3 drivers are available near the pickup. */
export class LowSupplySurcharge extends FareDecorator {
  static readonly MULTIPLIER = 1.2;
  static readonly THRESHOLD = 3;
  calculate(request: FareRequest): number {
    const fare = this.inner.calculate(request);
    const lowSupply = request.availableDrivers !== undefined && request.availableDrivers < LowSupplySurcharge.THRESHOLD;
    return lowSupply ? Math.round(fare * LowSupplySurcharge.MULTIPLIER) : fare;
  }
}
