import { injectable } from "tsyringe";
import { IFareCalculatorService } from "../../application/services/FareCalculatorService";
import { BookingType } from "../../domain/models/Booking";
import { AuthError } from "../../domain/errors/Autherror";
import { FareRequest, FareStrategy, HourlyFare, OneWayFare, OutstationFare, RoundTripFare } from "../../domain/pricing/FareStrategy";
import { LowSupplySurcharge, PeakHourSurcharge } from "../../domain/pricing/DynamicPricing";

/** Strategy context: picks the fare strategy for the ride type and applies dynamic pricing on top. */
@injectable()
export class FareCalculatorService implements IFareCalculatorService {
  private readonly strategies = new Map<BookingType, FareStrategy>([
    [BookingType.ONE_WAY, new OneWayFare()],
    [BookingType.ROUND_TRIP, new RoundTripFare()],
    [BookingType.HOURLY, new HourlyFare()],
    [BookingType.OUTSTATION, new OutstationFare()],
  ]);

  register(bookingType: BookingType, strategy: FareStrategy): void {
    this.strategies.set(bookingType, strategy);
  }

  calculate(params: FareRequest): number {
    const priced = new LowSupplySurcharge(new PeakHourSurcharge(this.strategyFor(params.bookingType)));
    return priced.calculate(params);
  }

  finalFare({ bookingType, estimatedFare, finalKm }: { bookingType: BookingType; estimatedFare?: number; finalKm: number }): number {
    return (estimatedFare || 0) + finalKm * this.strategyFor(bookingType).extraKmRate;
  }

  private strategyFor(bookingType: BookingType): FareStrategy {
    const strategy = this.strategies.get(bookingType);
    if (!strategy) throw new AuthError("Invalid booking type", 400);
    return strategy;
  }
}
