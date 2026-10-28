import { DriverReview } from "../models/DriverReview";
export interface PaginatedReview<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}
export interface IDriverReviewRepository {
  createReview(review: Omit<DriverReview, '_id' | 'createdAt'>): Promise<DriverReview>;
  hasUserAlreadyReviewed(driverId: string, userId: string): Promise<boolean>;
  getReviewsByDriverId(driverId: string,page: number, limit: number): Promise<PaginatedReview<DriverReview>>;
}
