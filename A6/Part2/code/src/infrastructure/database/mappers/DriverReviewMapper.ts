
import { Types } from "mongoose";
import { DriverReview } from "../../../domain/models/DriverReview";
import { ReviewDocument } from "../modals/DriverReviewschema"; // you'll export this interface from schema

export const toDomain = (doc: any): DriverReview => ({
  _id: (doc._id as Types.ObjectId).toString(),
  driverId: doc.driverId.toString(),
  userId: doc.userId.toString(),
  rideId: doc.rideId.toString(),
  rating: doc.rating,
  review: doc.review,
  createdAt: doc.createdAt,
   user: doc.userId?.name ? {
      _id: doc.userId._id.toString(),
      name: doc.userId.name,
      profile: doc.userId.profile,
    } : undefined,
});

export const toPersistence = (review: Omit<DriverReview, "_id">) => ({
  driverId: new Types.ObjectId(review.driverId),
  userId: new Types.ObjectId(review.userId),
  rideId: new Types.ObjectId(review.rideId),
  rating: review.rating,
  review: review.review,
  createdAt: review.createdAt,
});