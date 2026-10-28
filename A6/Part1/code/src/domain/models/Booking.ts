import { Types } from "mongoose";

export enum paymentStatus {
  PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    }
export enum BookingStatus {
  PENDING = "PENDING", 
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",          
  CANCELLED = "CANCELLED",
  REJECTED= "REJECTED",
  EXPIRED = "EXPIRED",
    }
export enum BookingType {
  ONE_WAY = "ONE_RIDE",
    ROUND_TRIP = "RANGE_OF_DATES",  
        }
export interface Booking {
    _id?: Types.ObjectId | string;
    id?: string;
    userId:Types.ObjectId;
    driverId?: Types.ObjectId;
    fromLocation?: string;
    toLocation?: string; 
    startDate: Date;
    endDate?: Date;
    estimatedKm?: number;
    finalKm?: number;
    estimatedFare?: number;
    finalFare?: number;
    bookingType:BookingType; 
    status?: BookingStatus; 
    paymentStatus?: paymentStatus; 
    paymentMode:'stripe'
   reason?: string;
paymentIntentId?:string;
    driver_fee?: number;
    platform_fee?: number;
    walletDeduction?: number;
    fromLat?: number;
    fromLng?: number;
    userAcknowledged?: boolean;
    createdAt?: Date;   
    updatedAt?: Date;
  }
