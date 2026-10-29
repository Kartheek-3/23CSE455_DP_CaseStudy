import { User } from "../../../domain/models/User";

/**
 * User Response DTO
 * Plain TypeScript interface for user data sent to the client
 */
export interface UserResponseDto {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  profile: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  place?: string;
  referralCode?: string;
  onlineStatus: 'online' | 'offline';
  lastSeen: Date;
  role: "user" | "admin";
  referalPay?: boolean;
  activePayment?: boolean;
  isBlock: Boolean;
  createdAt?: Date;
}

/**
 * Mapper: Domain Entity -> Response DTO
 * Filters out sensitive fields like password and googleId
 */
export const toUserResponse = (user: User): UserResponseDto => {
  const { password, googleId, ...safeUser } = user;
  return {
    ...safeUser,
    _id: user._id?.toString() || "",
  } as UserResponseDto;
};
