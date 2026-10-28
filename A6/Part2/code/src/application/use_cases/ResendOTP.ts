import { injectable, inject } from "tsyringe";
import { IRedisrepository } from "../../domain/repositories/IRedisrepository";
import { EmailService } from "../services/Emailservice";
import { TOKENS } from "../../constants/Tokens";
import { INFO_MESSAGES } from "../../constants/Info_Messages";
import { AuthError } from "../../domain/errors/Autherror";
import { ERROR_MESSAGES } from "../../constants/ErrorMessages";
import { ResendOtpResponseDto } from "../dto/auth/AuthResponseDto";
import { IResendOTP } from "./Interfaces/IResendOTP";
@injectable()
export class ResendOTP implements IResendOTP {
  constructor(
    @inject(TOKENS.EMAIL_SERVICE) private _emailService: EmailService,
    @inject(TOKENS.USER_REGISTERSTORE) private _store: IRedisrepository
  ) {}
  async execute(email: string, role: string):Promise<ResendOtpResponseDto> {
    const existingUser = await this._store.getUser(email);

    if (!existingUser) {
      throw new AuthError(ERROR_MESSAGES.PENDING_NOTFOUND);
    }

    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // Expires in 5 min

    // // Update the OTP in store
    this._store.addUser(existingUser.email, {
      ...existingUser,
      otp: newOTP,
      otpExpires,
    });
    // Send OTP via email
    await this._emailService.sendOTP(email, newOTP);
    return { message: INFO_MESSAGES.USER.OTP_RESEND };
  }
}
