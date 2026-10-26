import { Types } from "mongoose";

export enum VehicleType {
  CAR = "four wheel",
  HEAVY = "Heavy",
}

export interface Vehicle {
  _id?: string;
  userId: Types.ObjectId;
  vehicleImage: string;
  rcBookImage: string;
  Register_No: string;
  ownerName: string;
  vehicleName: string;
  vehicleType: VehicleType;
  polution_expire: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

