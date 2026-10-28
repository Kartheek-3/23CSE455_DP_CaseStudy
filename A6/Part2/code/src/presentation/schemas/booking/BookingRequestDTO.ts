import { z } from "zod";
import { BookingType, BookingStatus, paymentStatus } from "../../../domain/models/Booking";

/**
 * Book Driver Request Schema
 * Handles validation and date coercion for the initial booking request
 */
export const BookDriverSchema = z.object({
  driverId: z.string().optional(),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  estimatedKm: z.coerce.number().nonnegative().optional(),
  bookingType: z.nativeEnum(BookingType),
  fromLat: z.coerce.number(),
  fromLng: z.coerce.number(),
}).refine((data) => {
  if (data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type BookDriverRequest = z.infer<typeof BookDriverSchema>;

export type BookingIdParamRequest = z.infer<typeof BookingIdParamSchema>;

/**
 * Cancel Booking Request Schema
 */
export const CancelBookingSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
  reason: z.string().min(1, "Reason is required"),
});

export type CancelBookingRequest = z.infer<typeof CancelBookingSchema>;

/**
 * Chat Params Schema
 */
export const ChatParamsSchema = z.object({
  roomId: z.string().min(1, "Room ID is required"),
});

export type ChatParamsRequest = z.infer<typeof ChatParamsSchema>;

/**
 * Message Params Schema
 */
export const MessageParamsSchema = ChatParamsSchema.extend({
  messageId: z.string().min(1, "Message ID is required"),
});

export type MessageParamsRequest = z.infer<typeof MessageParamsSchema>;

/**
 * Update Booking Status Schema
 */
export const UpdateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  reason: z.string().optional(),
  finalKm: z.coerce.number().nonnegative().optional(),
}).refine((data) => {
  if (data.status === BookingStatus.REJECTED && !data.reason) {
    return false;
  }
  return true;
}, {
  message: "Reason is required when rejecting a booking",
  path: ["reason"],
}).refine((data) => {
  if (data.status === BookingStatus.COMPLETED && data.finalKm === undefined) {
    return false;
  }
  return true;
}, {
  message: "Final KM is required when completing a booking",
  path: ["finalKm"],
});

export type UpdateBookingStatusRequest = z.infer<typeof UpdateBookingStatusSchema>;

/**
 * Get Estimated Fare Request Schema
 */
export const GetEstimatedFareSchema = z.object({
  bookingType: z.nativeEnum(BookingType),
  estimatedKm: z.coerce.number().nonnegative().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export type GetEstimatedFareRequest = z.infer<typeof GetEstimatedFareSchema>;

/**
 * Helper to ensure query params are single values even if multiple are sent
 */
const coerceToSingle = (val: unknown) => (Array.isArray(val) ? val[0] : val);

/**
 * User Booking Pagination Schema (Query Params)
 */
export const UserBookingPaginationSchema = z.object({
  page: z.preprocess(coerceToSingle, z.coerce.number().min(1).default(1)),
  limit: z.preprocess(coerceToSingle, z.coerce.number().min(1).max(50).default(10)),
});

export type UserBookingPaginationRequest = z.infer<typeof UserBookingPaginationSchema>;

/**
 * Attach Payment Intent Schema
 */
export const AttachPaymentIntentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment Intent ID is required"),
  paymentStatus: z.nativeEnum(paymentStatus).optional(),
  walletDeduction: z.coerce.number().nonnegative().optional().default(0),
});

export type AttachPaymentIntentRequest = z.infer<typeof AttachPaymentIntentSchema>;

/**
 * Ride ID Params Schema
 */
export const RideIdParamSchema = z.object({
  rideId: z.string().min(1, "Ride ID is required"),
});

/**
 * Booking ID Params Schema
 */
export const BookingIdParamSchema = z.object({
  bookingId: z.string().min(1, "Booking ID is required"),
});
/**
 * Ride History Pagination Schema
 */
export const RideHistorySchema = UserBookingPaginationSchema;

export type RideHistoryRequest = z.infer<typeof RideHistorySchema>;
/**
 * Chat Signature Request Schema
 */
export const GetChatSignatureSchema = z.object({
  fileType: z.string().min(1, "File type is required"),
});

export type GetChatSignatureRequest = z.infer<typeof GetChatSignatureSchema>;

/**
 * Wallet Payment Request Schema
 */
export const WalletPaymentSchema = z.object({
  rideId: z.string().min(1, "Ride ID is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
});

export type WalletPaymentRequest = z.infer<typeof WalletPaymentSchema>;

/**
 * Driver Review Params Schema (from id param)
 */
export const DriverReviewParamsSchema = z.object({
  id: z.string().min(1, "Driver ID is required"),
});

/**
 * Driver Stats Query Schema (year/month)
 */
export const DriverStatsQuerySchema = z.object({
  year: z.preprocess(coerceToSingle, z.coerce.number().int().min(2020).optional()),
  month: z.preprocess(coerceToSingle, z.coerce.number().int().min(1).max(12).optional()),
});
