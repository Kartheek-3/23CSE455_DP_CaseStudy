import { BookingStatus } from "../../../../domain/models/Booking"; 

export interface CancelBookingInput {
  bookingId: string;
  status: BookingStatus;
  reason: string;
}

export interface ICancelBookingUseCase {
  execute(input: CancelBookingInput): Promise<void>;
}
