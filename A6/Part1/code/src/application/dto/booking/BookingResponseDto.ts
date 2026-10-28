import { rideHistory } from "../../../domain/repositories/IBookingrepository";

/**
 * Ride History Response DTO
 * Safe subset of booking data with populated user/driver info
 */
export interface RideHistoryResponseDto {
  _id: string;
  userId: string;
  driverId?: string;
  fromLocation: string;
  toLocation: string;
  startDate: string; // ISO String
  endDate?: string;  // ISO String
  estimatedKm: number;
  finalFare: number;
  bookingType: string;
  status: string;
  paymentStatus: string;
  // Populated details
  name: string;
  email: string;
  profile: string;
  place: string;
  mobile?: string;
}

/**
 * Mapper: Repository Result -> RideHistoryResponseDto
 */
export const toRideHistoryResponse = (booking: rideHistory): RideHistoryResponseDto => {
  return {
    _id: booking.id || booking._id?.toString() || "",
    userId: booking.userId.toString(),
    driverId: booking.driverId ? booking.driverId.toString() : undefined,
    fromLocation: booking.fromLocation || "",
    toLocation: booking.toLocation || "",
    startDate: booking.startDate instanceof Date ? booking.startDate.toISOString() : String(booking.startDate),
    endDate: booking.endDate ? (booking.endDate instanceof Date ? booking.endDate.toISOString() : String(booking.endDate)) : undefined,
    estimatedKm: booking.estimatedKm || 0,
    finalFare: booking.finalFare || 0,
    bookingType: booking.bookingType,
    status: booking.status || "PENDING",
    paymentStatus: booking.paymentStatus || "PENDING",
    name: booking.name || "",
    email: booking.email || "",
    profile: booking.profile || "",
    place: booking.place || "",
    mobile: booking.mobile
  };
};

/**
 * Mapper: Array of Repository Results -> Array of RideHistoryResponseDto
 */
export const toRideHistoryListResponse = (bookings: rideHistory[]): RideHistoryResponseDto[] => {
  return bookings.map(toRideHistoryResponse);
};
