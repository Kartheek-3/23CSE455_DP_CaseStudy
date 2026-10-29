import { Driver } from "../../../domain/models/Driver";
import { User } from "../../../domain/models/User";

/**
 * Admin User Response DTO
 */
export interface AdminUserResponseDto {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  profileImage: string;
  isBlock: boolean;
  vehicleCount?: number;
  createdAt?: string;
}

/**
 * Admin Driver Response DTO
 */
export interface AdminDriverResponseDto {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  profileImage: string;
  status: string;
  onlineStatus: string;
  isBlock: boolean;
  place: string;
  averageRating: number;
  totalRatings: number;
  aadhaarNumber: string;
  licenseNumber: string;
  aadhaarImage: string;
  licenseImage: string;
  createdAt?: string;
}

/**
 * Mappers
 */
export const toAdminUserResponse = (user: User & { vehicleCount?: number }): AdminUserResponseDto => {
  return {
    _id: user._id?.toString() || "",
    name: user.name || "",
    email: user.email || "",
    mobile: user.mobile || "",
    profileImage: user.profile || "",
    isBlock: !!user.isBlock,
    vehicleCount: user.vehicleCount || 0,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt)
  };
};

export const toAdminDriverResponse = (driver: Driver): AdminDriverResponseDto => {
  return {
    _id: driver._id?.toString() || "",
    name: driver.name || "",
    email: driver.email || "",
    mobile: driver.mobile || "",
    profileImage: driver.profileImage || "",
    status: driver.status || "pending",
    onlineStatus: driver.onlineStatus || "offline",
    isBlock: driver.isBlock || false,
    place: driver.place || "",
    averageRating: driver.averageRating || 0,
    totalRatings: driver.totalRatings || 0,
    aadhaarNumber: driver.aadhaarNumber || "",
    licenseNumber: driver.licenseNumber || "",
    aadhaarImage: driver.aadhaarImage || "",
    licenseImage: driver.licenseImage || "",
    createdAt: driver.createdAt instanceof Date ? driver.createdAt.toISOString() : String(driver.createdAt)
  };
};

export const toAdminDriverListResponse = (drivers: Driver[]): AdminDriverResponseDto[] => {
  return drivers.map(toAdminDriverResponse);
};

export const toAdminUserListResponse = (users: (User & { vehicleCount?: number })[]): AdminUserResponseDto[] => {
  return users.map(toAdminUserResponse);
};
