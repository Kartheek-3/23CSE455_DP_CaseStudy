import mongoose, { Schema, Document } from "mongoose";
import { User } from "../../../domain/models/User";
import bcrypt from "bcryptjs";
export interface UserDocument extends Omit<User, "_id">, Document {}

const UserSchema = new Schema<UserDocument>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String},
  profile:{type:String},
  location: {
    latitude: { type: Number, default:null},
    longitude: { type: Number, default: null },
  },
  place:{type:String},
  password: { type: String },
  googleId: { type: String },
  referralCode: { type: String },
  referredBy: {  type: mongoose.Schema.Types.ObjectId, ref: "User" ,default: null },
  isBlock:{type:Boolean,default:false},
  role:{type:String,required:true,default:'user'},
  createdAt: { type: Date, default: Date.now },
  stripeAccountId: { type: String, default: null },
  activePayment: { type: Boolean, default: false },
  lastSeen : { type: Date, default: null },
  onlineStatus: { type: String, enum: ['online', 'offline'], default: 'offline' },
  referalPay: { type: Boolean, default: false },
});
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")||!this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.model<UserDocument>("User", UserSchema);




