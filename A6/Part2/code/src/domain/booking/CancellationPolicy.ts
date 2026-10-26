import { Booking, BookingStatus } from "../models/Booking";

export type CancelledBy = "user" | "driver";

/** Strategy: how much the rider is charged when a ride is cancelled. */
export interface CancellationPolicy {
  readonly cancelledBy: CancelledBy;
  calculateFee(booking: Booking, now: Date): number;
}

const IST_OFFSET = 5.5 * 60 * 60 * 1000;

/** 9:00 PM IST on the day before the ride (rule taken from the baseline CancelBooking). */
export function cancellationCutoff(startDate: Date): Date {
  const startIST = new Date(new Date(startDate).getTime() + IST_OFFSET);
  const cutoffIST = new Date(startIST);
  cutoffIST.setUTCDate(cutoffIST.getUTCDate() - 1);
  cutoffIST.setUTCHours(21, 0, 0, 0);
  return new Date(cutoffIST.getTime() - IST_OFFSET);
}

export const LATE_FEE_RATE = 0.1;
export const MIN_LATE_FEE = 50;

/** Rider: free while PENDING or before the cutoff; afterwards 10% of the estimated fare, at least Rs 50. */
export class RiderCancellationPolicy implements CancellationPolicy {
  readonly cancelledBy = "user" as const;
  calculateFee(booking: Booking, now: Date): number {
    if (booking.status !== BookingStatus.CONFIRMED) return 0;
    if (now.getTime() <= cancellationCutoff(booking.startDate).getTime()) return 0;
    return Math.max(MIN_LATE_FEE, Math.round((booking.estimatedFare ?? 0) * LATE_FEE_RATE));
  }
}

/** Driver: the rider is never charged when the driver cancels. */
export class DriverCancellationPolicy implements CancellationPolicy {
  readonly cancelledBy = "driver" as const;
  calculateFee(): number {
    return 0;
  }
}

const POLICIES: Record<CancelledBy, CancellationPolicy> = {
  user: new RiderCancellationPolicy(),
  driver: new DriverCancellationPolicy(),
};

export function cancellationPolicyFor(cancelledBy: CancelledBy): CancellationPolicy {
  return POLICIES[cancelledBy];
}
