import { inject, injectable } from "tsyringe";
import { IFareCalculatorService } from "../../services/FareCalculatorService"; 
import { BookingType } from "../../../domain/models/Booking"; 
import { TOKENS } from "../../../constants/Tokens";
import { IGetEstimatedFare } from "./interfaces/IGetEstimatedFare";
import { GetEstimatedFareRequest } from "../../../presentation/schemas/booking/BookingRequestDTO";

@injectable()
export class GetEstimatedFare implements IGetEstimatedFare{
  constructor(
    @inject(TOKENS.IFARE_CALCULATE_SERVICE)
    private _fareCalculatorService: IFareCalculatorService
  ) {}


  async execute(params: GetEstimatedFareRequest): Promise<number> {
 
    return this._fareCalculatorService.calculate(params);
  }
}
