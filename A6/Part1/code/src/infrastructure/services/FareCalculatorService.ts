import { injectable } from "tsyringe";
import { IFareCalculatorService } from "../../application/services/FareCalculatorService";
import { BookingType } from "../../domain/models/Booking";
import { AuthError } from "../../domain/errors/Autherror";

@injectable()
export class FareCalculatorService implements IFareCalculatorService {
  private readonly PER_KM_RATE = 10; // move to env/config later
  private readonly PER_DAY_RATE = 1000;

  calculate(params: {
    bookingType: BookingType;
    estimatedKm?: number;
    startDate: Date;
    endDate?: Date;
  }): number {
    const { bookingType, estimatedKm, startDate, endDate } = params;
let fare = 0;
 console.log(params)
    if (bookingType === BookingType.ONE_WAY) {
      if (!estimatedKm) throw new Error("Estimated KM is required for ONE_WAY booking");
      fare= estimatedKm * this.PER_KM_RATE;
   
      return fare < 450 ? 450 : fare;
    }
   
    if (bookingType === BookingType.ROUND_TRIP) {
      if (!endDate) throw new Error("End date is required for ROUND_TRIP booking");
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      
      return dayCount * this.PER_DAY_RATE;
    }

    throw new AuthError("Invalid booking type", 400);
  }
}
