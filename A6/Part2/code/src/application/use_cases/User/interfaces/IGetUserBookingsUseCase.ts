import { BookingWithUsername, PaginatedResult } from "../../../../domain/repositories/IBookingrepository";

export interface IGetUserBookingsUseCase {
  execute(userId: string, page?: number, limit?: number): Promise<PaginatedResult<BookingWithUsername>>;
}
