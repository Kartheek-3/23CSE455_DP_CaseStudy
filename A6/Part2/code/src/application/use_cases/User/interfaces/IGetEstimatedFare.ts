import { GetEstimatedFareRequest } from "../../../../presentation/schemas/booking/BookingRequestDTO";

export interface IGetEstimatedFare {
  execute(params: GetEstimatedFareRequest): Promise<number>;
}
