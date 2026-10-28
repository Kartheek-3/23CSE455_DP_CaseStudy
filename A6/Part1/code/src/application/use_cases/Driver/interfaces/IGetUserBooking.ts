import { PaginatedResult } from "../../../../domain/repositories/IBookingrepository";
import { RideHistoryResponseDto } from "../../../dto/booking/BookingResponseDto";

export interface IGetBooking  {
    execute(driverId: string, page: number, limit: number): Promise<PaginatedResult<RideHistoryResponseDto>>
}