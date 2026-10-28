import { BookingStatus } from "../../../../domain/models/Booking";

export interface UpdateBookingStatusInput {
  bookingId: string;
  status: BookingStatus;
  reason?: string;
  finalKm?: number;
}

export interface IUpdateBookingStatusUseCase {
  execute(input: UpdateBookingStatusInput): Promise<void>;
}
