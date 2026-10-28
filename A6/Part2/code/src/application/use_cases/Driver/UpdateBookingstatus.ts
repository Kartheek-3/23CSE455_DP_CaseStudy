import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { BookingStatus } from "../../../domain/models/Booking";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { IUpdateBookingStatusUseCase } from "./interfaces/IUpdateBookingStatusUseCase";
import { TripLifecycle } from "../../../domain/booking/TripState";
import { IFareCalculatorService } from "../../services/FareCalculatorService";


interface UpdateBookingStatusInput {
  bookingId: string;
  status: BookingStatus
  reason?: string;
  finalKm?: number;
}
@injectable()
export class UpdateBookingStatus implements IUpdateBookingStatusUseCase {
  constructor(  @inject(TOKENS.IBOOKING_REPO)
  private _bookingRepo: IBookingRepository,
 @inject(TOKENS.NOTIFICATION_SERVICE)
    private _notificationService: INotificationService,
  @inject(TOKENS.IFARE_CALCULATE_SERVICE)
    private _fareCalculator: IFareCalculatorService
) {}

  async execute(input: UpdateBookingStatusInput): Promise<void> {
    const { bookingId, status, reason, finalKm } = input;
    let finalFare: number | undefined = undefined;

    const booking = await this._bookingRepo.findBookingById(bookingId);
    
    if (!booking) {
      throw new AuthError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    if (status === BookingStatus.CANCELLED) {
      throw new AuthError("Use the cancel endpoint to cancel a ride.", HTTP_STATUS_CODES.BAD_REQUEST);
    }
    // Throws InvalidTransitionError when the current trip state does not allow this status.
    new TripLifecycle(booking.status).moveTo(status);

    if (status === "REJECTED" && !reason) {
      throw new AuthError(
        "Reason is required when rejecting a booking.",
        HTTP_STATUS_CODES.BAD_REQUEST
      );
    }

    // If ride is completed and finalKm is provided, calculate final fare
    if (status === "COMPLETED") {
      if (finalKm === undefined || finalKm === null) {
        
        throw new AuthError("Final KM is required to complete the ride", HTTP_STATUS_CODES.BAD_REQUEST);
      }

      finalFare = this._fareCalculator.finalFare({
        bookingType: booking.bookingType,
        estimatedFare: booking.estimatedFare,
        finalKm,
      });
    }
    if (status === "REJECTED" && reason){
      this._notificationService.rejectBookingNotification(booking.userId.toString(),{status,startDate:booking.startDate,bookingId,reason})
    }
    // Always update status, and optionally finalFare and reason
    await this._bookingRepo.updateBooking(bookingId, {
      status,
      ...(reason && { reason }),
      ...(finalFare !== undefined && { finalFare }),
    });
    this._notificationService.sendBookingConfirmation(booking.userId.toString(),{status,startDate:booking.startDate,bookingId});

    
  }
 

}