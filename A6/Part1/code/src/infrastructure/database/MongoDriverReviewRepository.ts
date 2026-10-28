
import { injectable } from "tsyringe";
import { IDriverReviewRepository, PaginatedReview } from "../../domain/repositories/IDriverReviewRepository";
import { DriverReview } from "../../domain/models/DriverReview";
import DriverReviewModel, { ReviewDocument } from "./modals/DriverReviewschema";
import { toDomain, toPersistence } from "./mappers/DriverReviewMapper";
import { AuthError } from "../../domain/errors/Autherror";
import { HTTP_STATUS_CODES } from "../../constants/HttpStatusCode";
import { BaseRepository } from "./BaseRepository";

@injectable()
export class MongoDriverReviewRepository extends BaseRepository<DriverReview, ReviewDocument> implements IDriverReviewRepository {
  constructor() {
    super(DriverReviewModel);
  }
  async createReview(review: Omit<DriverReview,'_id'|'createdAt'>): Promise<DriverReview> {
    const data = toPersistence({ ...review, createdAt: new Date() });
    const created = await DriverReviewModel.create(data);
    return toDomain(created);
  }

  async hasUserAlreadyReviewed(driverId: string, userId: string): Promise<boolean> {
    const existing = await super.findOne({ driverId, userId });
    return !!existing;
  }

  async getReviewsByDriverId(driverId: string,page:number,limit:number): Promise<PaginatedReview<DriverReview>> {
     try {
    const skip = (page - 1) * limit;

 
    const [reviews, total] = await Promise.all([
      DriverReviewModel.find({ driverId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name profile"),
        
      DriverReviewModel.countDocuments({ driverId }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: reviews.map(toDomain),
      total,
      page,
      totalPages,
    };
  } catch (error: any) {
    throw new AuthError(error.message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}
}