import { inject, injectable } from "tsyringe";
import { BookingWithUsername, IBookingRepository, PaginatedResult } from "../../../domain/repositories/IBookingrepository"; 
import { Booking } from "../../../domain/models/Booking"; 
import { TOKENS } from "../../../constants/Tokens";

@injectable()
export class GetUserBookings {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute(userId: string, page: number = 1, limit: number = 3): Promise<PaginatedResult<BookingWithUsername>> {
    return await this._bookingRepo.findBookingsByUser(userId, page, limit);
  }

}
