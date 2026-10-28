import { Driver } from "../../../domain/models/Driver";

/**
 * Driver Response DTO
 * Safe subset of driver data for public API
 */
export interface DriverResponseDto {
  _id: string;
  name: string;
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

export interface DriverFullResponseDto extends DriverResponseDto {
  email: string;
  mobile: string;
  aadhaarNumber: string;
  licenseNumber: string;
  aadhaarImage: string;
  licenseImage: string;
  stripeAccountId?: string;
  activePayment?: boolean;
}

/**
 * Mapper: Domain Entity -> DriverResponseDto
 */
export const toDriverResponse = (driver: Partial<Driver> & { distance?: number | null }): DriverResponseDto => {
  return {
    _id: driver._id ? driver._id.toString() : "",
    name: driver.name || "",
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
 * Mapper: Domain Entity -> DriverFullResponseDto
 */
export const toDriverFullResponse = (driver: Partial<Driver> & { distance?: number | null }): DriverFullResponseDto => {
  return {
    ...toDriverResponse(driver),
    email: driver.email || "",
    mobile: driver.mobile || "",
    aadhaarNumber: driver.aadhaarNumber || "",
    licenseNumber: driver.licenseNumber || "",
    aadhaarImage: driver.aadhaarImage || "",
    licenseImage: driver.licenseImage || "" ,
    stripeAccountId: driver.stripeAccountId || "",
    activePayment: driver.activePayment || false,
  };
};

/**
 * Mapper: Array of Domain Entities -> Array of DriverResponseDto
 */
export const toDriverListResponse = (drivers: (Partial<Driver> & { distance?: number | null })[]): DriverResponseDto[] => {
  return drivers.map(toDriverResponse);
};
export interface PaginatedResultDTO<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export type FindNearbyDriversResult = PaginatedResultDTO<DriverResponseDto>;
