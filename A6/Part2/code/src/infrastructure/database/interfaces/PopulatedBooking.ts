import { Types } from "mongoose";
import { BookingStatus, BookingType, paymentStatus } from "../../../domain/models/Booking";

export interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  profile?: string;
  place?: string;
}

export interface PopulatedDriver {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  profileImage?: string;
  place?: string;
}

export interface PopulatedBooking {
  _id: Types.ObjectId;
  id?: string;
  userId: PopulatedUser;
  driverId?: PopulatedDriver;
  fromLocation?: string;
  toLocation?: string;
  startDate: Date;
  endDate?: Date;
  estimatedKm?: number;
  finalKm?: number;
  estimatedFare?: number;
  finalFare?: number;
  bookingType: BookingType;
  status?: BookingStatus;
  paymentStatus?: paymentStatus;
  paymentMode: 'stripe';
  reason?: string;
  paymentIntentId?: string;
  driver_fee?: number;
  platform_fee?: number;
  walletDeduction?: number;
  fromLat?: number;
  fromLng?: number;
  userAcknowledged?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  place?: string;
}
