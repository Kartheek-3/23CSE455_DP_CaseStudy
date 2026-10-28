
import { LoginResponseDto } from "../../dto/auth/AuthResponseDto";

export interface ILogin {
  execute(
    email: string,
    password: string,
    role: "user" | "driver" | "admin"
  ): Promise<LoginResponseDto>;
}
