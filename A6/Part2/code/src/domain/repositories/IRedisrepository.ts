import { RegistrationPayload } from "../models/RegistrationPayload";

export interface IRedisrepository {
    addUser(email: string, userData: RegistrationPayload): Promise<void>;
    getUser(email: string): Promise<RegistrationPayload | null>;
    removeUser(email: string): Promise<void>;
    clearUsers(): Promise<void>;
    addTokenUser(role: string, token: string, userId: string): Promise<void>;
    getTokenUser(role: string, token: string): Promise<string | null>;
    removeTokenUser(role: string, token: string): Promise<void>
  }
  