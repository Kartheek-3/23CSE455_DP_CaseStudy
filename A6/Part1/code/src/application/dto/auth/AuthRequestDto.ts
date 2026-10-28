/**
 * Authentication Request DTOs
 * Plain TypeScript interfaces for auth-related inputs
 */

export interface LoginRequestDto {
  email: string;
  password?: string;
  role: "user" | "driver" | "admin";
}

export interface VerifyOtpRequestDto {
  email: string;
  otp: string;
  role: "user" | "driver" | "admin";
}

export interface ResendOtpRequestDto {
  email: string;
  role: "user" | "driver" | "admin";
}
