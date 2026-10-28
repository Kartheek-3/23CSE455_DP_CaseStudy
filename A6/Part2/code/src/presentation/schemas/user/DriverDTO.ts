import { Driver } from "../../../domain/models/Driver";

/**
 * Driver Response Type (Safe Subset)
 * Specifically excludes sensitive info like aadhaarNumber, licenseNumber, etc.
 */
export interface DriverResponse {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  profileImage: string;
  location: 
    | { latitude: number; longitude: number } 
    | { type: "Point"; coordinates: [number, number] };
  place: string;
  status: string;
  onlineStatus: 'online' | 'offline';
  averageRating: number;
  totalRatings: number;
  distance?: number | null;
}

export interface DriverFullResponse extends DriverResponse {
  aadhaarNumber: string;
  licenseNumber: string;
  aadhaarImage: string;
  licenseImage: string;
  stripeAccountId?: string;
  activePayment?: boolean;
}

/**
 * Base Input for Driver Mappers
 * Accept a partial driver where _id can be a string or ObjectId (anything with .toString())
 */
type DriverMapperInput = Omit<Partial<Driver>, "_id"> & {
  _id?: string | { toString(): string };
  distance?: number | null;
};

/**
 * Maps a single Driver (or partial Driver from application layer) 
 * to a safe Response DTO for the Public API
 */
export const toDriverResponse = (driver: DriverMapperInput): DriverResponse => {
  return {
    _id: driver._id?.toString() || "",
    name: driver.name || "",
    email: driver.email || "",
    mobile: driver.mobile || "",
    profileImage: driver.profileImage || "",
    location: driver.location || { latitude: 0, longitude: 0 },
    place: driver.place || "",
    status: driver.status || "pending",
    onlineStatus: driver.onlineStatus || "offline",
    averageRating: driver.averageRating || 0,
    totalRatings: driver.totalRatings || 0,
    distance: driver.distance ?? null,
  };
};

/**
 * Maps a single Driver to a full Response DTO (includes sensitive docs)
 * Only for self-viewing (Dashboard)
 */
export const toDriverFullResponse = (driver: DriverMapperInput): DriverFullResponse => {
  return {
    ...toDriverResponse(driver),
    aadhaarNumber: driver.aadhaarNumber || "",
    licenseNumber: driver.licenseNumber || "",
    aadhaarImage: driver.aadhaarImage || "",
    licenseImage: driver.licenseImage || "",
    stripeAccountId: driver.stripeAccountId || "",
    activePayment: driver.activePayment || false,
  };
};

/**
 * Maps an array of Drivers to safe Response DTOs
 */
export const toDriverListResponse = (drivers: DriverMapperInput[]): DriverResponse[] => {
  return drivers.map(toDriverResponse);
};
