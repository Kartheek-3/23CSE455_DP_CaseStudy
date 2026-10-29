import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { BookingStatus, Booking } from "../../../domain/models/Booking";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { IAcceptBookingUseCase, AcceptBookingInput } from "./interfaces/IAcceptBookingUseCase";
import { PopulatedDriver } from "../../../infrastructure/database/interfaces/PopulatedBooking";
import { DriverAccount } from "../../../domain/driver/DriverAccountState";

@injectable()
export class AcceptBooking implements IAcceptBookingUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO) private _bookingRepo: IBookingRepository,
    @inject(TOKENS.NOTIFICATION_SERVICE) private _notificationService: INotificationService,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepo: IDriverRepository
  ) {}

  async execute(data: AcceptBookingInput): Promise<Booking> {
    const { bookingId, driverId } = data;

    const driver = await this._driverRepo.findDriverById(driverId);
    if (!driver) {
      throw new AuthError(ERROR_MESSAGES.DRIVER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
    if (!new DriverAccount(driver.status).canReceiveRides()) {
      throw new AuthError(`Drivers with status ${driver.status} cannot accept rides.`, HTTP_STATUS_CODES.FORBIDDEN);
    }

    // Atomic update in the repository: only succeeds while the booking is still PENDING
    const updatedBooking = await this._bookingRepo.acceptPendingBooking(bookingId, driverId);

    // If updatedBooking is null, it was either already accepted or expired
    if (!updatedBooking) {
      throw new AuthError("This booking request is no longer available.", HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const driverObj = updatedBooking.driverId as unknown as PopulatedDriver;

    // Notify user via Socket.IO
    await this._notificationService.sendBookingConfirmation(updatedBooking.userId.toString(), {
      bookingId: String(updatedBooking._id),
      status: BookingStatus.CONFIRMED,
      driver: driverObj ? {
        _id: driverObj._id.toString(),
        name: driverObj.name,
        mobile: driverObj.mobile,
        profileImage: driverObj.profileImage || "N/A"
      } : undefined
    });

    // Notify other online drivers to dismiss their popups
    this._notificationService.bookingAssignedNotification(String(updatedBooking._id), driverId);

    return updatedBooking;
  }
}
