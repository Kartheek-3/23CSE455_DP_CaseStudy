import mongoose, { Schema, Document } from "mongoose";
import { Driver } from "../../../domain/models/Driver";
import bcrypt from "bcryptjs";
export interface IDriver extends  Omit<Driver, "_id">,Document {} 

const DriverSchema = new Schema<IDriver>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    place:{type:String},
    aadhaarNumber: { type: String, required: true, unique: true },
    licenseNumber: { type: String, required: true, unique: true },
    aadhaarImage: { type: String, required: true },
    licenseImage: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    isBlock: { type: Boolean, default: false },
    role: { type: String, required: true, default: "driver" }, 
    reason: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
    stripeAccountId: { type: String, default: null },
    activePayment: { type: Boolean, default: false },
    lastSeen : { type: Date, default: null },
    onlineStatus: { type: String, enum: ['online', 'offline'], default: 'offline' },
    
    averageRating: {
    type: Number,
    default: 0,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  totalRatingPoints: {
    type: Number,
    default: 0,
  }
  },

  { timestamps: true }
);
DriverSchema.index({ location: '2dsphere' });
DriverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});
export default mongoose.model<IDriver>("Driver", DriverSchema);


