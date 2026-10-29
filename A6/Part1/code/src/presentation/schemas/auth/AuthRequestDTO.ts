import { z } from "zod";

/**
 * Helper to ensure query params are single values even if multiple are sent
 */
const coerceToSingle = (val: unknown) => (Array.isArray(val) ? val[0] : val);

/**
 * Common Role Enum
 */
export const RoleEnum = z.enum(["user", "driver", "admin"] as const, {
  message: "Role must be user, driver, or admin",
});

/**
 * Refresh Token Request Schema
 */
export const RefreshTokenSchema = z.object({
  role: RoleEnum,
});

/**
 * Forgot Password Request Schema
 */
export const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
  role: RoleEnum,
});

/**
 * Reset Password Request Schema
 */
export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  role: RoleEnum,
});

/**
 * Logout Request Schema (Query Params)
 */
export const LogoutSchema = z.object({
  role: z.preprocess(coerceToSingle, RoleEnum),
});

/**
 * Change Password Request Schema
 */
export const ChangePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  role: RoleEnum,
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordSchema>;
export type LogoutRequest = z.infer<typeof LogoutSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordSchema>;
