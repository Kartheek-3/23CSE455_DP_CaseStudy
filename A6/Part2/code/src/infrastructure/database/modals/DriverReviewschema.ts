// infrastructure/database/modals/DriverReviewschema.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface ReviewDocument extends Document {
  driverId: Types.ObjectId;
  userId: Types.ObjectId;
  rideId: Types.ObjectId;
  rating: number;
  review?: string;
  createdAt: Date;
}

const DriverReviewSchema = new Schema<ReviewDocument>({
  driverId: { type: Schema.Types.ObjectId, ref: 'Driver', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rideId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ReviewDocument>('DriverReview', DriverReviewSchema);
