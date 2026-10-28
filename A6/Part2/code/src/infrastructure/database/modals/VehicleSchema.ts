import mongoose, { Schema, Document, Types } from "mongoose";
import { Vehicle, VehicleType} from "../../../domain/models/Vehicle"; // Import Enum

export interface VehicleDocument extends  Omit<Vehicle, "_id">, Document {}

const VehicleSchema = new Schema<VehicleDocument>(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      vehicleImage: { type: String, required: true },
      rcBookImage: { type: String, required: true },
      Register_No: { type: String, required: true, unique: true },
      ownerName: { type: String, required: true },
      vehicleName: { type: String, required: true },
      vehicleType: {
        type: String,
        enum: Object.values(VehicleType), // Strict enum validation
        required: true,
      },
      polution_expire: { type: Date, required: true },
    },
    { timestamps: true }
  );
  
  export const VehicleModel = mongoose.model<VehicleDocument>("Vehicle", VehicleSchema);
