import { z } from "zod";
import { User } from "../../../domain/models/User";
import { VehicleType } from "../../../domain/models/Vehicle";

/**
 * Register User Schema
 * Validates the core signup fields for the User entity
 */
export const RegisterSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits"),
});

/**
 * Verify OTP Schema
 */
export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

/**
 * Login User Schema
 */
export const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  role: z.enum(["user", "admin", "driver"] as const, {
    message: "Role must be user, admin, or driver",
  }),
});

/**
 * Resend OTP Schema
 */
export const ResendOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: z.enum(["user", "admin", "driver"] as const, {
    message: "Role must be user, admin, or driver",
  }),
});

/**
 * Update User Schema
 * Allows partial updates of secondary fields only
 */
export const UpdateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").optional(),
  email: z.string().email("Invalid email format").optional(),
  mobile: z.string().regex(/^\d{10}$/, "Mobile must be exactly 10 digits").optional(),
  profile: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  place: z.string().optional(),
});

/**
 * Helper to ensure query params are single values even if multiple are sent
 */
const coerceToSingle = (val: unknown) => (Array.isArray(val) ? val[0] : val);

/**
 * Fetch Drivers Query Schema
 * Handles pagination and search parameters from query string
 */
export const FetchDriversSchema = z.object({
  page: z.preprocess(coerceToSingle, z.coerce.number().min(1).default(1)),
  limit: z.preprocess(coerceToSingle, z.coerce.number().min(1).max(50).default(10)),
  search: z.preprocess(coerceToSingle, z.string().optional().default("")),
  lat: z.preprocess(coerceToSingle, z.coerce.number().optional()),
  lng: z.preprocess(coerceToSingle, z.coerce.number().optional()),
});

/**
 * Driver Params Schema
 * Validates driverId from req.params
 */
export const DriverIdParamSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
});

/**
 * Get Nearby Driver Details Query Schema
 */
export const GetNearbyDriverQuerySchema = z.object({
  lat: z.preprocess(coerceToSingle, z.coerce.number().optional()),
  lng: z.preprocess(coerceToSingle, z.coerce.number().optional()),
});

/**
 * Payment Intent Request Schema
 */
export const CreatePaymentIntentSchema = z.object({
  amount: z.number().positive("Amount must be greater than zero"),
  driverId: z.union([
    z.string().min(1),
    z.object({ _id: z.string().min(1) }).transform((obj) => obj._id),
  ]),
});

/**
 * Wallet History Pagination Schema
 * Coerces query strings (page, limit) to numbers
 */
export const WalletPaginationSchema = z.object({
  page: z.preprocess(coerceToSingle, z.coerce.number().min(1).default(1)),
  limit: z.preprocess(coerceToSingle, z.coerce.number().min(1).max(50).default(10)),
});

/**
 * Driver Review Request Schema
 */
export const SubmitReviewSchema = z.object({
  driverId: z.string().min(1, "Driver ID is required"),
  rideId: z.string().min(1, "Ride ID is required"),
  rating: z.number().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  review: z.string().optional(),
});

/**
 * Add Vehicle Request Schema
 */
export const AddVehicleSchema = z.object({
  vehicleImage: z.string().min(1, "Vehicle Image is required"),
  rcBookImage: z.string().min(1, "RC Book Image is required"),
  Register_No: z.string().min(1, "Register number is required"),
  ownerName: z.string().min(1, "Owner name is required"),
  vehicleName: z.string().min(1, "Vehicle name is required"),
  vehicleType: z.nativeEnum(VehicleType),
  polution_expire: z.coerce.date(),
});

/**
 * Edit Vehicle Request Schema (Partial Update)
 */
export const EditVehicleSchema = AddVehicleSchema.partial();

/**
 * Vehicle ID Params Schema
 */
export const VehicleIdParamSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
});

/**
 * Base Input for User Mappers
 * Accept a partial user where _id can be a string or ObjectId (anything with .toString())
 */
type UserMapperInput = Omit<Partial<User>, "_id"> & {
  _id?: string | { toString(): string };
};

/**
 * User Response Mapper
 * Filters out sensitive database fields before sending as JSON
 */
export const toUserResponse = (user: UserMapperInput) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, googleId, ...safeUser } = user;
  return {
    ...safeUser,
    _id: user._id?.toString() || "",
  };
};
