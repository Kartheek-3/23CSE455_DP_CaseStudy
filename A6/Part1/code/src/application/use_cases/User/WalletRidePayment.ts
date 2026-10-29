import { IWalletRepository } from "../../../domain/repositories/IWalletRepository";
import { AuthError } from "../../../domain/errors/Autherror";

import { inject, injectable } from "tsyringe";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { paymentStatus } from "../../../domain/models/Booking";
import { IStripeService } from "../../../domain/services/IStripeService";
import { IDriverRepository } from "../../../domain/repositories/IDriverepository";
import { TOKENS } from "../../../constants/Tokens";
import { IWalletPaymentUseCase } from "./interfaces/IWalletPaymentUseCase";

@injectable()
export class WalletPayment  implements IWalletPaymentUseCase {
  constructor(
    @inject(TOKENS.WALLET_REPO) private _walletRepository: IWalletRepository,
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository,
    @inject(TOKENS.STRIPE_PAYMENT_SERVICE)
    private _stripeService: IStripeService,
    @inject(TOKENS.IDRIVER_REPO) private _driverRepository: IDriverRepository
  ) {}
  async WalletRidePayment(rideId: string, userId: string, amount: number) {
    try {
      const Payment = {
        paymentStatus: paymentStatus.COMPLETED,
      };

      const Ride = await this._bookingRepo.findBookingById(rideId);
      if (!Ride) {
        throw new AuthError("Ride not found", HTTP_STATUS_CODES.NOT_FOUND);
      }
      if (!Ride.driverId) {
        throw new AuthError("No driver assigned to this ride", HTTP_STATUS_CODES.BAD_REQUEST);
      }

      const driver = await this._driverRepository.findDriverById(
        Ride.driverId.toString()
      );

      if (!driver?.stripeAccountId) {
        throw new AuthError(
          "stripe connected account not found",
          HTTP_STATUS_CODES.NOT_FOUND
        );
      }
      await this._stripeService.transferToDriverFromWallet(
        Ride.driverId.toString(),
        amount,
        driver.stripeAccountId
      );
      await this._bookingRepo.updateBooking(rideId, {...Payment,walletDeduction:amount,driver_fee:Math.floor(amount*0.9)});
      await this._walletRepository.debitAmount(
        userId,
        amount,
        `ride on ${Ride?.startDate}`
      );

     
    } catch (error: any) {
      throw new AuthError(
        "Failed to do ride wallet payment " + error.message,
        HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR
      );
    }
  }
}
