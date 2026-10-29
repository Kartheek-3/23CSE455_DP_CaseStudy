import { AuthError } from "../../domain/errors/Autherror";
import { BookingType } from "../../domain/models/Booking";

export interface IFareCalculatorService {
  calculate(params: {
    bookingType: BookingType;
    estimatedKm?: number;
    startDate: Date;
    endDate?: Date;
  }): number;
}
