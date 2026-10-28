import { BookingStatus } from "../../../../domain/models/Booking";
import { CancelledBy } from "../../../../domain/booking/CancellationPolicy";

export interface CancelBookingInput {
  bookingId: string;
  reason: string;
  cancelledBy: CancelledBy;
  actorId: string;
}

export interface CancelBookingResult {
  bookingId: string;
  status: BookingStatus;
  cancellationFee: number;
}

export interface ICancelBookingUseCase {
  execute(input: CancelBookingInput): Promise<CancelBookingResult>;
}
