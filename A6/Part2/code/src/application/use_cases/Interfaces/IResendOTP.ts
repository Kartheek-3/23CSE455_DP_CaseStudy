import { ResendOtpResponseDto } from "../../dto/auth/AuthResponseDto"; 

export interface IResendOTP {
  execute(email: string, role: string): Promise<ResendOtpResponseDto>;
}
