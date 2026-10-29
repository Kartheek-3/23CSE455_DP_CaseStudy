import { z } from "zod";

/**
 * Driver Registration Schema
 * Validates the core signup fields for the Driver entity
 */
export const RegisterDriverSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
  place: z.string().min(1, "Place is required"),
  aadhaarNumber: z.string().min(12, "Aadhaar number must be at least 12 digits"),
  licenseNumber: z.string().min(1, "License number is required"),
  // These are often relative paths (images/uploads/...) from the client
  profileImage: z.string().optional().or(z.literal("")),
  aadhaarImage: z.string().min(1, "Aadhaar image path is required"),
  licenseImage: z.string().min(1, "License image path is required"),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
});
export type RegisterDriverRequest = z.infer<typeof RegisterDriverSchema>;


/**
 * Driver Login Schema
 * Reuses the same structure as User but can be extended later if needed
 */
export const DriverLoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("driver"),
});

/**
 * Driver OTP Verification Schema
 */
export const VerifyDriverOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

/**
 * Driver Resend OTP Schema
 */
export const ResendDriverOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.literal("driver"),
});

/**
 * Edit Driver Profile Schema (Partial Update)
 */
export const EditDriverProfileSchema = RegisterDriverSchema.partial();
export type EditDriverProfileRequest = z.infer<typeof EditDriverProfileSchema>;


/**
 * Onboard Driver Schema
 */
export const OnboardDriverSchema = z.object({
  email: z.string().email("Invalid email format"),
  driverId: z.string().optional(),
});

/**
 * User ID Params Schema
 */
export const UserIdParamSchema = z.object({
  id: z.string().min(1, "User ID is required"),
});

/**
 * Driver Booking Pagination Schema
 */
export const DriverBookingPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(2),
});

/**
 * Verify Account Schema
 */
export const VerifyAccountSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
});


