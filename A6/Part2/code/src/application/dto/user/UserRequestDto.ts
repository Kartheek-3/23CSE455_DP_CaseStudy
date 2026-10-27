import { User } from "../../../domain/models/User";

/**
 * Update User Request DTO
 * Plain TypeScript interface for updating user profile
 */
export type UpdateUserRequestDto = Partial<Omit<User, "password" | "googleId" | "role" | "_id">>;
