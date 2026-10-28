import { Booking } from "../../../../domain/models/Booking";

export interface AcceptBookingInput {
  bookingId: string;
  driverId: string;
}

export interface IAcceptBookingUseCase {
  execute(data: AcceptBookingInput): Promise<Booking>;
}
