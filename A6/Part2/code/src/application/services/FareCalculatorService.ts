import { BookingType } from "../../domain/models/Booking";
import { FareRequest } from "../../domain/pricing/FareStrategy";

export interface IFareCalculatorService {
  calculate(params: FareRequest): number;
  finalFare(params: { bookingType: BookingType; estimatedFare?: number; finalKm: number }): number;
}
