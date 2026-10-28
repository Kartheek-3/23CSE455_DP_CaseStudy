import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository";
import { PaginatedResult } from "../../../domain/repositories/IBookingrepository";
import { TOKENS } from "../../../constants/Tokens";
import { IGetBooking } from "./interfaces/IGetUserBooking";
import { RideHistoryResponseDto, toRideHistoryListResponse } from "../../dto/booking/BookingResponseDto";

@injectable()
export class GetUserBookings implements IGetBooking {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute(driverId: string, page: number = 1, limit: number = 2): Promise<PaginatedResult<RideHistoryResponseDto>> {
    const result = await this._bookingRepo.findBookingsByDriver(driverId, page, limit);
    
    return {
      ...result,
      data: toRideHistoryListResponse(result.data)
    };
  }
}

