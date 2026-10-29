import { PaginatedResult } from "../../../../domain/repositories/IBookingrepository";
import { AdminDriverResponseDto } from "../../../dto/admin/AdminResponseDto";

export interface IGetDriversUseCase {
  execute(page: number, limit: number): Promise<PaginatedResult<AdminDriverResponseDto>> 
}
