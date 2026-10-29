import { VerifyOtpResponseDto } from "../../dto/auth/AuthResponseDto";

export interface IVerifyOtp {
  execute(email: string, otp: string, role: "user" | "driver"): Promise<VerifyOtpResponseDto>;
}
