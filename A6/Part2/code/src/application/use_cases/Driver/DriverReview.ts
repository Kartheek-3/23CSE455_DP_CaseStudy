import { inject, injectable } from "tsyringe";
import { IDriverReviewRepository } from "../../../domain/repositories/IDriverReviewRepository";
import { TOKENS } from "../../../constants/Tokens";
import { IGetDriverReviewsUseCase } from "./interfaces/IGetDriverReviewsUseCase";

@injectable()
export class GetDriverReviews  implements IGetDriverReviewsUseCase  {
  constructor(
    @inject(TOKENS.DRIVER_REVIEW_REPO)
    private _reviewRepo: IDriverReviewRepository
  ) {}

  async execute(driverId: string,page: number = 1, limit: number = 3) {
    return await this._reviewRepo.getReviewsByDriverId(driverId,page, limit);
  }
}
