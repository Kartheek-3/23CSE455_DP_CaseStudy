import { inject, injectable } from "tsyringe";
import { IBookingRepository } from "../../../domain/repositories/IBookingrepository"; 
import { TOKENS } from "../../../constants/Tokens";
import { IGetRideHistoryUseCase, RideHistoryResponse } from "./interfaces/IGetRideHistoryUseCase";

@injectable()
export class GetRideHistory implements IGetRideHistoryUseCase {
  constructor(
     @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository

  ) {}

  async execute(role: "user" | "driver", id: string, page: number = 1, limit: number = 2): Promise<RideHistoryResponse> {
    const result = await this._bookingRepo.getRideHistoryByRole(id, role, page, limit);
    return result;
  }
}
