import { User } from "../../../../domain/models/User";

export interface IRegisterUser {
  execute(userData: User): Promise<{ message: string }>;
}
