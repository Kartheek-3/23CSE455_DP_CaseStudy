import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { paymentStatus } from "../../../domain/models/Booking"; 
import { AuthError } from "../../../domain/errors/Autherror";
import { IStripeService } from "../../../domain/services/IStripeService";

import { IUserRepository } from "../../../domain/repositories/IUserepository";
import { INotificationService } from "../../services/NotificationService";
import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { TOKENS } from "../../../constants/Tokens";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { IAttachPaymentIntentIdToBookingUseCase, AttachPaymentIntentParams } from "./interfaces/IAttachPaymentIntentIdToBookingUseCase";

@injectable()
export class AttachPaymentIntentIdToBooking implements IAttachPaymentIntentIdToBookingUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository,
    @inject(TOKENS.WALLET_REPO) private _walletRepository: IWalletRepository,
    @inject(TOKENS.IUSER_REPO) private _userRepository: IUserRepository,
    @inject(TOKENS.PAYMENT_SERVICE)
    private _stripeService: IStripeService,
    @inject(TOKENS.NOTIFICATION_SERVICE)
    private _notificationService: INotificationService
  ) {}

  async execute(params: AttachPaymentIntentParams): Promise<void> {
    const { rideId, walletDeduction, paymentIntentId, paymentStatus: paymentstatus, userId } = params;
    const booking = await this._bookingRepo.findBookingById(rideId);
    console.log(walletDeduction,'walletDeduction')
    if (!booking) {
      throw new AuthError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }
if(walletDeduction&&walletDeduction>0){
await this._walletRepository.debitAmount(
  booking.userId.toString(),
  walletDeduction,
  `ride booked for ${booking.startDate}`
);
booking.walletDeduction=walletDeduction;
}
    if(paymentIntentId){

    booking.paymentIntentId = paymentIntentId;
  }
  if(paymentstatus){
    booking.paymentStatus = paymentstatus;
  }

  if(paymentstatus&&paymentIntentId){
    const payment=await this._stripeService.retrievePaymentIntent(paymentIntentId);
 
    booking.driver_fee=(payment.amount-payment.application_fee_amount!)*.01;
    booking.platform_fee=payment.application_fee_amount!*.01;
  }

  if(paymentstatus=='COMPLETED'&&userId){
  const user = await this._userRepository.getUserById(userId);

  if (!user) {
    throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND); 
    }
  }

    await this._bookingRepo.updateBooking(rideId, booking);
    if (paymentstatus == 'COMPLETED' && booking.driverId) {
      console.log(booking.driverId.toString());
      await this._notificationService.paymentNotification(booking.driverId.toString(), { status: paymentstatus, startDate: booking.startDate, bookingId: rideId })
    }

  }
}
