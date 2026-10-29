import { Driver } from "../models/Driver";
import { PaginatedResult } from "./IBookingrepository";

export interface IDriverRepository {
  create(driver: Driver): Promise<Driver>;
  findByEmail(email: string): Promise<Driver | null>;
  getDrivers(page: number, limit: number): Promise<PaginatedResult<Driver>>;
  findDriverById(driverId: string): Promise<Driver | null>; 
  updateStatus(driverId: string, status: "pending" | "approved" | "rejected", reason?: string):Promise<Driver | null>; 
  blockOrUnblockDriver(driverId: string, isBlocked: boolean): Promise<void>;
  update(userId: string, data: Partial<Driver>): Promise<Driver | null>;
  findActiveDrivers(page: number, limit: number, placeKey?: string, lat?: number, lng?: number): Promise<PaginatedResult<Driver>>;

  updateStripeAccount(driverId: string, stripeAccountId: string): Promise<Driver>;
  
  updateRatingStats(driverId: string, stats: {
  totalRatingPoints: number;
  totalRatings: number;
  averageRating: number;
}): Promise<void>;
findNearbyDriversWithinRadius(
  location: { latitude: number; longitude: number },
  excludedDriverIds: string[],
  radiusInKm: number
): Promise<{ _id: string; latitude: number; longitude: number }[]>;

}
