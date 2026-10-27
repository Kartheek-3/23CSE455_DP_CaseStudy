import { UserResponseDto } from "../user/UserResponseDto";
import { DriverFullResponseDto } from "../driver/DriverResponseDto";

/**
 * Authentication Response DTOs
 */

export interface LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  role: "user" | "driver" | "admin";
}

export interface VerifyOtpResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto | DriverFullResponseDto | { id: string; role: string };
}

export interface ResendOtpResponseDto {
  message: string;
}
