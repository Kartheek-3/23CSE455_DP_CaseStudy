import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { AuthError } from "../../../domain/errors/Autherror";
import { TOKENS } from "../../../constants/Tokens";
import { ERROR_MESSAGES } from "../../../constants/ErrorMessages";
import { HTTP_STATUS_CODES } from "../../../constants/HttpStatusCode";
import { IAcknowledgeBookingUseCase } from "./interfaces/IAcknowledgeBookingUseCase";

@injectable()
export class AcknowledgeBookingUseCase implements IAcknowledgeBookingUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute(bookingId: string): Promise<void> {
    const booking = await this._bookingRepo.findBookingById(bookingId);
    if (!booking) {
      throw new AuthError(ERROR_MESSAGES.BOOKING_NOT_FOUND, HTTP_STATUS_CODES.NOT_FOUND);
    }

    await this._bookingRepo.updateBooking(bookingId, {
      userAcknowledged: true
    });
  }
}
