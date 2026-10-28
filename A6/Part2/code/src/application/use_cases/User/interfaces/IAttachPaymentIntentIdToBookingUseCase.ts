import { AttachPaymentIntentRequest } from "../../../../presentation/schemas/booking/BookingRequestDTO";
import { paymentStatus } from "../../../../domain/models/Booking";

export interface AttachPaymentIntentParams extends AttachPaymentIntentRequest {
  rideId: string;
  userId: string;
  paymentStatus?: paymentStatus; // Override to use the enum
}

export interface IAttachPaymentIntentIdToBookingUseCase {
  execute(params: AttachPaymentIntentParams): Promise<void>;
}
