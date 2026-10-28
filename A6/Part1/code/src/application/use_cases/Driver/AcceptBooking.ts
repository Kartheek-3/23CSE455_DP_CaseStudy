import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { BookingStatus, Booking } from "../../../domain/models/Booking";
import { AuthError } from "../../../domain/errors/Autherror";
import { INotificationService } from "../../services/NotificationService";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import BookingModel from "../../../infrastructure/database/modals/Bookingschema";
import { Types } from "mongoose";
import { IAcceptBookingUseCase, AcceptBookingInput } from "./interfaces/IAcceptBookingUseCase";
import { PopulatedDriver } from "../../../infrastructure/database/interfaces/PopulatedBooking";

@injectable()
export class AcceptBooking implements IAcceptBookingUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO) private _bookingRepo: IBookingRepository,
    @inject(TOKENS.NOTIFICATION_SERVICE) private _notificationService: INotificationService
  ) {}

  async execute(data: AcceptBookingInput): Promise<Booking> {
    const { bookingId, driverId } = data;

    // Atomic update: only updates status to CONFIRMED if status is currently PENDING
    const updatedBooking = await BookingModel.findOneAndUpdate(
      { _id: new Types.ObjectId(bookingId), status: BookingStatus.PENDING },
      { status: BookingStatus.CONFIRMED, driverId: new Types.ObjectId(driverId) },
      { new: true }
    ).populate("driverId", "name profileImage mobile");

    // If updatedBooking is null, it was either already accepted or expired
    if (!updatedBooking) {
      throw new AuthError("This booking request is no longer available.", HTTP_STATUS_CODES.BAD_REQUEST);
    }

    const driverObj = updatedBooking.driverId as unknown as PopulatedDriver;

    // Notify user via Socket.IO
    await this._notificationService.sendBookingConfirmation(updatedBooking.userId.toString(), {
      bookingId: (updatedBooking._id as Types.ObjectId).toString(),
      status: BookingStatus.CONFIRMED,
      driver: driverObj ? {
        _id: driverObj._id.toString(),
        name: driverObj.name,
        mobile: driverObj.mobile,
        profileImage: driverObj.profileImage || "N/A"
      } : undefined
    });

    // Notify other online drivers to dismiss their popups
    this._notificationService.bookingAssignedNotification((updatedBooking._id as Types.ObjectId).toString(), driverId);

    return updatedBooking.toObject() as Booking;
  }
}
