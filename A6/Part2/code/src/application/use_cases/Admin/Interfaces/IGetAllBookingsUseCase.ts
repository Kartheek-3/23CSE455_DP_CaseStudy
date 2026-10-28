import { BookingWithUsername, PaginatedResult } from "../../../../domain/repositories/IBookingrepository";


export interface IGetAllBookingsUseCase {
  execute(page?: number, limit?: number): Promise<PaginatedResult<BookingWithUsername>>;
}
