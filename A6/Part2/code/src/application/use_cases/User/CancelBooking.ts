import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ICancelBookingUseCase, CancelBookingInput, CancelBookingResult } from "./interfaces/ICancelBookingUseCase";
import { TripLifecycle } from "../../../domain/booking/TripState";
import { cancellationPolicyFor } from "../../../domain/booking/CancellationPolicy";

@injectable()
export class CancelBookingInputUseCase  implements ICancelBookingUseCase{
  constructor(
     @inject(TOKENS.NOTIFICATION_SERVICE)
        private _notificationService: INotificationService,
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute(input: CancelBookingInput): Promise<CancelBookingResult> {
    const { bookingId, reason, cancelledBy, actorId } = input;

    const booking = await this._bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new AuthError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    const ownerId = cancelledBy === "user" ? booking.userId?.toString() : booking.driverId?.toString();
    if (!ownerId || ownerId !== actorId) {
      throw new AuthError("You can only cancel your own rides.", HTTP_STATUS_CODES.FORBIDDEN);
    }

    // State decides whether the ride can still be cancelled; the policy decides the fee.
    const status = new TripLifecycle(booking.status).apply("cancel");
    const cancellationFee = cancellationPolicyFor(cancelledBy).calculateFee(booking, new Date());

    await this._bookingRepo.updateBooking(bookingId, {
      status,
      reason,
      cancelledBy,
      cancellationFee,
    });

    const payload = { status, reason, startDate: booking.startDate, bookingId, cancelledBy, cancellationFee };
    if (cancelledBy === "user" && booking.driverId) {
      await this._notificationService.cancelBookingNotification(booking.driverId.toString(), payload);
    } else if (cancelledBy === "driver") {
      await this._notificationService.driverCancelledBookingNotification(booking.userId.toString(), payload);
    }
    if (!booking.driverId) {
      // Broadcast request that nobody accepted yet: dismiss the popup on drivers' screens.
      this._notificationService.bookingAssignedNotification(bookingId);
    }

    return { bookingId, status, cancellationFee };
  }
}
