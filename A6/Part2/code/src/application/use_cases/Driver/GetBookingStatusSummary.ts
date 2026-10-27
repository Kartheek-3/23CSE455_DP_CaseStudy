
import { inject, injectable } from 'tsyringe';
import { IBookingRepository } from '../../../domain/repositories/IBookingrepository'; 
import { TOKENS } from '../../../constants/Tokens';
import { IGetBookingStatusSummaryUseCase } from './interfaces/IGetBookingStatusSummaryUseCase';

@injectable()
export class GetBookingStatusSummary implements IGetBookingStatusSummaryUseCase {
  constructor(
    @inject(TOKENS.IBOOKING_REPO)
    private _bookingRepo: IBookingRepository
  ) {}

  async execute(driverId: string, year?: number, month?: number): Promise<Record<string, number>> {
   
      return await this._bookingRepo.countBookingsByStatus(driverId, year, month);
   
  }
}
