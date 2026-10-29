import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { BookingStatus } from "../../../domain/models/Booking";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ICancelBookingUseCase } from "./interfaces/ICancelBookingUseCase";

interface CancelBookingInput {
  bookingId: string;
  status: BookingStatus;
  reason: string;
}

@injectable()
export class CancelBookingInputUseCase  implements ICancelBookingUseCase{
  constructor(
     @inject(TOKENS.NOTIFICATION_SERVICE)
        private _notificationService: INotificationService,
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute(input: CancelBookingInput): Promise<void> {
    const { bookingId, status, reason } = input;

    const booking = await this._bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new AuthError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    // Only restrict cancellation if the booking is already CONFIRMED (assigned to a driver)
    if (booking.status === BookingStatus.CONFIRMED) {
      const IST_OFFSET = 5.5 * 60 * 60 * 1000;
      const startIST = new Date(new Date(booking.startDate).getTime() + IST_OFFSET);
      const cutoffIST = new Date(startIST);
      cutoffIST.setUTCDate(cutoffIST.getUTCDate() - 1);
      cutoffIST.setUTCHours(21, 0, 0, 0); // 9:00 PM IST
      const cutoffTime = cutoffIST.getTime() - IST_OFFSET;

      if (Date.now() > cutoffTime) {
        throw new AuthError("Bookings can only be cancelled before 9:00 PM of the day before the ride.", HTTP_STATUS_CODES.BAD_REQUEST);
      }
    }

    await this._bookingRepo.updateBooking(bookingId, {
      status,
      reason
    });
    if (booking.driverId) {
      await this._notificationService.cancelBookingNotification(booking.driverId.toString(), { status, reason, startDate: booking.startDate, bookingId })
    }
  }
}
