import { inject, injectable } from "tsyringe";
import { BookingWithUsername, IBookingRepository, PaginatedResult } from "../../../domain/repositories/IBookingrepository"; 
import { TOKENS } from "../../../constants/Tokens";
import { IGetUserBookingsUseCase } from "./interfaces/IGetUserBookingsUseCase";

@injectable()
export class GetUserBookingsUseCase implements IGetUserBookingsUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute(userId: string, page: number = 1, limit: number = 2): Promise<PaginatedResult<BookingWithUsername>> {
    return await this._bookingRepo.findBookingsByUser(userId, page, limit);
  }
}
