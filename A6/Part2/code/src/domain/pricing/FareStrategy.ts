import { BookingType } from "../models/Booking";
import { AuthError } from "../errors/Autherror";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";

export interface FareRequest {
  bookingType: BookingType;
  estimatedKm?: number;
  startDate: Date;
  endDate?: Date;
  /** Drivers that can take the ride near the pickup; unknown for a plain estimate. */
  availableDrivers?: number;
}

/** Strategy: one fare algorithm per ride type. */
export interface FareStrategy {
  calculate(request: FareRequest): number;
  /** Rate charged per extra km reported by the driver when the ride completes. */
  readonly extraKmRate: number;
}

const DAY_MS = 1000 * 60 * 60 * 24;
const HOUR_MS = 1000 * 60 * 60;

const invalid = (message: string): never => {
  throw new AuthError(message, HTTP_STATUS_CODES.BAD_REQUEST);
};

const calendarDays = (startDate: Date, endDate: Date) =>
  Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS) + 1;

/** ONE_WAY: Rs 10 per km, minimum Rs 450 (baseline rule). */
export class OneWayFare implements FareStrategy {
  readonly extraKmRate = 10;
  calculate({ estimatedKm }: FareRequest): number {
    if (!estimatedKm) return invalid("Estimated KM is required for ONE_WAY booking");
    return Math.max(450, estimatedKm * 10);
  }
}

/** ROUND_TRIP (range of dates): Rs 1000 per calendar day, inclusive (baseline rule). */
export class RoundTripFare implements FareStrategy {
  readonly extraKmRate = 10;
  calculate({ startDate, endDate }: FareRequest): number {
    if (!endDate) return invalid("End date is required for ROUND_TRIP booking");
    return calendarDays(startDate, endDate) * 1000;
  }
}

/** HOURLY: Rs 200 per started hour, minimum 4 hours. */
export class HourlyFare implements FareStrategy {
  readonly extraKmRate = 10;
  calculate({ startDate, endDate }: FareRequest): number {
    if (!endDate) return invalid("End time is required for HOURLY booking");
    const hours = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / HOUR_MS);
    if (hours <= 0) return invalid("End time must be after start time");
    return Math.max(4, hours) * 200;
  }
}

/** OUTSTATION: Rs 12 per km plus Rs 300 driver allowance per calendar day. */
export class OutstationFare implements FareStrategy {
  readonly extraKmRate = 12;
  calculate({ estimatedKm, startDate, endDate }: FareRequest): number {
    if (!estimatedKm) return invalid("Estimated KM is required for OUTSTATION booking");
    if (!endDate) return invalid("End date is required for OUTSTATION booking");
    return estimatedKm * 12 + calendarDays(startDate, endDate) * 300;
  }
}
